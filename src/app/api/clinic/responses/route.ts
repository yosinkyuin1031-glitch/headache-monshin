import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
  }

  const clinicId = request.nextUrl.searchParams.get('clinic_id')
  if (!clinicId) {
    return NextResponse.json({ success: false, error: 'clinic_idが必要です' }, { status: 400 })
  }

  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('monshin_responses')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ success: false, error: 'データ取得に失敗' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'サーバーエラー' }, { status: 500 })
  }
}
