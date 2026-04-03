import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import crypto from 'crypto'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

function generateClinicId(clinicName: string): string {
  const base = clinicName
    .replace(/[\s　]+/g, '-')
    .replace(/[^a-zA-Z0-9\u3000-\u9FFF\-]/g, '')
    .toLowerCase()
    .slice(0, 20)

  const suffix = crypto.randomInt(100, 999)
  return `${base}-${suffix}`
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, clinic_name, owner_name, email, password } = body

    if (!code || !clinic_name || !owner_name || !email || !password) {
      return NextResponse.json(
        { success: false, error: '全ての項目を入力してください' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'パスワードは6文字以上で設定してください' },
        { status: 400, headers: corsHeaders }
      )
    }

    const supabase = getSupabase()

    // 招待コードの検証
    const { data: inviteCode, error: codeError } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (codeError || !inviteCode) {
      return NextResponse.json(
        { success: false, error: '無効な招待コードです' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (inviteCode.is_used) {
      return NextResponse.json(
        { success: false, error: 'この招待コードは既に使用されています' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (new Date(inviteCode.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'この招待コードは有効期限が切れています' },
        { status: 400, headers: corsHeaders }
      )
    }

    // メール重複チェック
    const { data: existing } = await supabase
      .from('clinics')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'このメールアドレスは既に登録されています' },
        { status: 400, headers: corsHeaders }
      )
    }

    // クリニックID生成
    const clinicId = generateClinicId(clinic_name)

    // クリニック登録
    const { error: insertError } = await supabase
      .from('clinics')
      .insert({
        clinic_id: clinicId,
        clinic_name,
        owner_name,
        email,
        password_hash: hashPassword(password),
        invite_code_used: code.toUpperCase(),
      })

    if (insertError) {
      console.error('Clinic insert error:', insertError)
      return NextResponse.json(
        { success: false, error: '登録に失敗しました。もう一度お試しください' },
        { status: 500, headers: corsHeaders }
      )
    }

    // 招待コードを使用済みに
    await supabase
      .from('invite_codes')
      .update({
        is_used: true,
        used_by_clinic_id: clinicId,
        used_at: new Date().toISOString(),
      })
      .eq('code', code.toUpperCase())

    return NextResponse.json({
      success: true,
      clinic_id: clinicId,
      admin_url: `/admin/${clinicId}`,
      monshin_url: `/monshin.html?clinic=${clinicId}`,
    }, { headers: corsHeaders })

  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json(
      { success: false, error: 'サーバーエラー' },
      { status: 500, headers: corsHeaders }
    )
  }
}
