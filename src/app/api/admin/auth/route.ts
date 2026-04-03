import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (password === process.env.ADMIN_PASSWORD) {
      const token = crypto.randomUUID()

      return NextResponse.json({ success: true, token })
    }

    return NextResponse.json(
      { success: false, error: 'パスワードが正しくありません' },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { success: false, error: 'サーバーエラー' },
      { status: 500 }
    )
  }
}
