import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import crypto from 'crypto'

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const { clinic_id, password } = await request.json()

    if (!clinic_id || !password) {
      return NextResponse.json(
        { success: false, error: 'クリニックIDとパスワードが必要です' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()
    const { data: clinic, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('clinic_id', clinic_id)
      .single()

    if (error || !clinic) {
      return NextResponse.json(
        { success: false, error: 'クリニックが見つかりません' },
        { status: 404 }
      )
    }

    if (!clinic.is_active) {
      return NextResponse.json(
        { success: false, error: 'このアカウントは無効化されています' },
        { status: 403 }
      )
    }

    if (clinic.password_hash !== hashPassword(password)) {
      return NextResponse.json(
        { success: false, error: 'パスワードが正しくありません' },
        { status: 401 }
      )
    }

    // last_login_atを更新
    await supabase
      .from('clinics')
      .update({ last_login_at: new Date().toISOString() })
      .eq('clinic_id', clinic_id)

    const token = crypto.randomUUID()

    return NextResponse.json({
      success: true,
      token,
      clinic: {
        clinic_id: clinic.clinic_id,
        clinic_name: clinic.clinic_name,
        owner_name: clinic.owner_name,
      }
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'サーバーエラー' },
      { status: 500 }
    )
  }
}
