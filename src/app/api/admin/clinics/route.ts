import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

// 登録済みクリニック一覧取得
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
  }

  try {
    const supabase = getSupabase()

    // クリニック一覧
    const { data: clinics, error } = await supabase
      .from('clinics')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ success: false, error: 'データ取得に失敗' }, { status: 500 })
    }

    // 各クリニックの回答数を取得
    const clinicsWithStats = await Promise.all(
      (clinics || []).map(async (clinic) => {
        const { count } = await supabase
          .from('monshin_responses')
          .select('*', { count: 'exact', head: true })
          .eq('clinic_id', clinic.clinic_id)

        return { ...clinic, response_count: count || 0 }
      })
    )

    return NextResponse.json({ success: true, data: clinicsWithStats })
  } catch {
    return NextResponse.json({ success: false, error: 'サーバーエラー' }, { status: 500 })
  }
}
