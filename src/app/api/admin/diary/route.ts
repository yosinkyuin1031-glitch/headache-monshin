import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

// 頭痛ダイアリーの患者・記録データを取得
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
  }

  try {
    const supabase = getSupabase()

    // 患者一覧を取得
    const { data: patients, error: pErr } = await supabase
      .from('headache_patients')
      .select('*')
      .order('created_at', { ascending: false })

    if (pErr) {
      console.error('Patients fetch error:', pErr)
      return NextResponse.json({ success: false, error: '患者データ取得に失敗' }, { status: 500 })
    }

    // 全記録を取得
    const { data: records, error: rErr } = await supabase
      .from('headache_records_v2')
      .select('*')
      .order('record_date', { ascending: false })

    if (rErr) {
      console.error('Records fetch error:', rErr)
      return NextResponse.json({ success: false, error: '記録データ取得に失敗' }, { status: 500 })
    }

    // 患者ごとに記録を集約
    const patientsWithRecords = (patients || []).map(patient => {
      const patientRecords = (records || []).filter(r => r.patient_id === patient.id)
      const totalRecords = patientRecords.length
      const avgPain = totalRecords > 0
        ? Math.round((patientRecords.reduce((sum: number, r: { pain_level: number }) => sum + (r.pain_level || 0), 0) / totalRecords) * 10) / 10
        : 0
      const lastRecord = patientRecords[0] || null

      return {
        ...patient,
        records: patientRecords,
        total_records: totalRecords,
        avg_pain: avgPain,
        last_record_date: lastRecord?.record_date || null,
      }
    })

    return NextResponse.json({ success: true, data: patientsWithRecords })
  } catch (err) {
    console.error('Diary fetch error:', err)
    return NextResponse.json({ success: false, error: 'サーバーエラー' }, { status: 500 })
  }
}
