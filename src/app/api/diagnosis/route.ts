import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

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
    const { diagnosis_type, scores, answers, clinic_id } = body

    if (!diagnosis_type) {
      return NextResponse.json(
        { success: false, error: '診断タイプが必要です' },
        { status: 400, headers: corsHeaders }
      )
    }

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('diagnosis_results')
      .insert({ diagnosis_type, scores, answers, clinic_id: clinic_id || 'ccure-clinic' })
      .select()
      .single()

    if (error) {
      console.error('Diagnosis save error:', error)
      return NextResponse.json(
        { success: false, error: '保存に失敗しました' },
        { status: 500, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      { success: true, id: data.id },
      { headers: corsHeaders }
    )
  } catch (err) {
    console.error('Diagnosis error:', err)
    return NextResponse.json(
      { success: false, error: 'サーバーエラー' },
      { status: 500, headers: corsHeaders }
    )
  }
}
