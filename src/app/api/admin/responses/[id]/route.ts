import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json(
      { success: false, error: '認証が必要です' },
      { status: 401 }
    )
  }

  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('monshin_responses')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json(
        { success: false, error: 'データの取得に失敗しました' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('Response detail error:', err)
    return NextResponse.json(
      { success: false, error: 'サーバーエラー' },
      { status: 500 }
    )
  }
}
