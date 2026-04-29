import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { Resend } from 'resend'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// 生年月日から年齢層を算出
function calcAgeGroup(birthday: string): string {
  if (!birthday) return ''
  const b = new Date(birthday)
  if (isNaN(b.getTime())) return ''
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
  if (age < 10) return '10歳未満'
  if (age < 20) return '10代'
  if (age < 30) return '20代'
  if (age < 40) return '30代'
  if (age < 50) return '40代'
  if (age < 60) return '50代'
  if (age < 70) return '60代'
  return '70代以上'
}

// 配列 or 文字列をカンマ区切り文字列に
function toStr(v: unknown): string {
  if (Array.isArray(v)) return v.filter(Boolean).join('、')
  if (v == null) return ''
  return String(v)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const clinicId = body.clinic_id || process.env.CLINIC_ID || 'ccure-clinic'

    // フォームデータをDBカラムに正しくマッピング
    const patientAge = calcAgeGroup(body.birthday || '')
    const headacheType = toStr(body.pain_type) || toStr(body.diagnosis)
    const headacheLocation = toStr(body.location)
    const headacheFrequency = toStr(body.frequency)
    const headacheDuration = toStr(body.duration)
    const headacheIntensity = toStr(body.pain_level)
    const headacheTriggers = toStr(body.trigger)
    const accompanyingSymptoms = toStr(body.accompanying)
    const currentMedications = [toStr(body.medication), toStr(body.medicine_name)]
      .filter(Boolean).join(' / ')
    const medicalHistory = [toStr(body.diagnosis), toStr(body.body_pain)].filter(Boolean).join(' / ')
    const otherConcerns = [toStr(body.body_condition), toStr(body.other), toStr(body.free_text)]
      .filter(Boolean).join(' / ')

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('monshin_responses')
      .insert({
        clinic_id: clinicId,
        patient_name: body.name || '',
        patient_age: patientAge,
        patient_gender: body.gender || '',
        headache_type: headacheType,
        headache_location: headacheLocation,
        headache_frequency: headacheFrequency,
        headache_duration: headacheDuration,
        headache_intensity: headacheIntensity,
        headache_triggers: headacheTriggers,
        accompanying_symptoms: accompanyingSymptoms,
        medical_history: medicalHistory,
        current_medications: currentMedications,
        other_concerns: otherConcerns,
        raw_data: body,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { success: false, error: 'データの保存に失敗しました' },
        { status: 500, headers: corsHeaders }
      )
    }

    // メール通知
    if (process.env.NOTIFY_EMAIL === 'true' && process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: 'Web問診票 <onboarding@resend.dev>',
          to: process.env.ADMIN_EMAIL,
          subject: `【Web問診票】${body.name}様から問診票が届きました`,
          text: [
            `【Web問診票 新規回答】`,
            ``,
            `患者名: ${body.name}（${body.furigana || ''}）`,
            `電話番号: ${body.tel || ''}`,
            `メール: ${body.email || '未入力'}`,
            ``,
            `■ 主な症状`,
            `痛みの強さ: ${headacheIntensity}/10`,
            `頻度: ${headacheFrequency || '未回答'}`,
            `痛みの種類: ${headacheType || '未回答'}`,
            ``,
            `送信日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`,
            ``,
            `詳細は管理画面をご確認ください。`,
          ].join('\n'),
        })
      } catch (emailError) {
        console.error('Email notification error:', emailError)
      }
    }

    return NextResponse.json(
      { success: true, id: data.id },
      { status: 200, headers: corsHeaders }
    )
  } catch (err) {
    console.error('Submit error:', err)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500, headers: corsHeaders }
    )
  }
}
