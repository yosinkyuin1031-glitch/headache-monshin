import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import crypto from 'crypto'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[crypto.randomInt(chars.length)]
  }
  return code
}

// 招待コード一覧取得
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
  }

  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('invite_codes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ success: false, error: 'データ取得に失敗' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'サーバーエラー' }, { status: 500 })
  }
}

// 招待コード発行
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const count = Math.min(body.count || 1, 20)
    const daysValid = body.days || 30

    const supabase = getSupabase()
    const codes = []

    for (let i = 0; i < count; i++) {
      const code = generateCode()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + daysValid)

      const { data, error } = await supabase
        .from('invite_codes')
        .insert({
          code,
          created_by: 'admin',
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Code generation error:', error)
        continue
      }
      codes.push(data)
    }

    return NextResponse.json({ success: true, data: codes })
  } catch {
    return NextResponse.json({ success: false, error: 'サーバーエラー' }, { status: 500 })
  }
}
