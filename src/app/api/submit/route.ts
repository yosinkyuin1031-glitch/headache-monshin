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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const clinicId = process.env.CLINIC_ID || 'ccure-clinic'
    const submittedAt = body.submitted_at || new Date().toISOString()

    // Supabaseに保存
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('monshin_responses')
      .insert({
        clinic_id: clinicId,
        patient_name: body.name || '',
        patient_furigana: body.furigana || '',
        patient_tel: body.tel || '',
        patient_email: body.email || '',
        patient_birthday: body.birthday || '',
        patient_address: body.address || '',
        form_data: body,
        submitted_at: submittedAt,
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
        const painType = Array.isArray(body.pain_type) ? body.pain_type.join('、') : (body.pain_type || '未回答')

        await resend.emails.send({
          from: 'Web問診票 <onboarding@resend.dev>',
          to: process.env.ADMIN_EMAIL,
          subject: `【Web問診票】${body.name}様から問診票が届きました`,
          text: [
            `【Web問診票 新規回答】`,
            ``,
            `患者名: ${body.name}（${body.furigana}）`,
            `電話番号: ${body.tel}`,
            `メール: ${body.email || '未入力'}`,
            ``,
            `■ 主な症状`,
            `痛みの強さ: ${body.pain_level}/10`,
            `頻度: ${body.frequency || '未回答'}`,
            `痛みの種類: ${painType}`,
            ``,
            `送信日時: ${new Date(submittedAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`,
            ``,
            `詳細は管理画面をご確認ください。`,
          ].join('\n'),
        })
      } catch (emailError) {
        console.error('Email notification error:', emailError)
      }
    }

    // LINE通知
    if (process.env.NOTIFY_LINE === 'true' && process.env.LINE_NOTIFY_TOKEN) {
      try {
        const dateStr = new Date(submittedAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
        const message = `\n【Web問診票】\n${body.name}様\nTEL: ${body.tel}\n送信日時: ${dateStr}`

        await fetch('https://notify-api.line.me/api/notify', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.LINE_NOTIFY_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ message }),
        })
      } catch (lineError) {
        console.error('LINE notification error:', lineError)
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
