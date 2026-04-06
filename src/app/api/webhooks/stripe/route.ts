import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import crypto from 'crypto'
import Stripe from 'stripe'
import { Resend } from 'resend'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

// clinic_id生成（register/route.tsと同じロジック）
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

// ランダム12文字の英数字パスワード生成
function generatePassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(crypto.randomInt(chars.length))
  }
  return password
}

// ウェルカムメール送信
async function sendWelcomeEmail(params: {
  email: string
  clinicName: string
  ownerName: string
  clinicId: string
  password: string
}) {
  const { email, clinicName, ownerName, clinicId, password } = params

  const monshinUrl = `https://headache-monshin.vercel.app/monshin.html?clinic=${clinicId}`
  const diaryUrl = 'https://headache-note.vercel.app'
  const adminUrl = `https://headache-monshin.vercel.app/admin/${clinicId}`

  await getResend().emails.send({
    from: 'onboarding@oguchi-healthcare.com',
    to: email,
    subject: '頭痛専門アプリのアカウントが発行されました',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
          頭痛専門アプリ アカウント発行のお知らせ
        </h2>

        <p>${ownerName} 様（${clinicName}）</p>

        <p>この度はお申し込みいただき、誠にありがとうございます。<br>
        頭痛専門アプリのアカウントが発行されましたので、ログイン情報をお送りいたします。</p>

        <div style="background: #f0f7ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">ログイン情報</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 140px;">クリニックID:</td>
              <td style="padding: 8px 0;">${clinicId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">初期パスワード:</td>
              <td style="padding: 8px 0;">${password}</td>
            </tr>
          </table>
          <p style="font-size: 13px; color: #666; margin-bottom: 0;">
            ※ セキュリティのため、初回ログイン後にパスワードの変更をお勧めします。
          </p>
        </div>

        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">各種URL</h3>

          <p style="margin-bottom: 8px;">
            <strong>管理画面:</strong><br>
            <a href="${adminUrl}" style="color: #2563eb;">${adminUrl}</a>
          </p>

          <p style="margin-bottom: 8px;">
            <strong>問診票（患者さん用）:</strong><br>
            <a href="${monshinUrl}" style="color: #2563eb;">${monshinUrl}</a>
          </p>

          <p style="margin-bottom: 0;">
            <strong>頭痛ダイアリー（患者さん用）:</strong><br>
            <a href="${diaryUrl}" style="color: #2563eb;">${diaryUrl}</a>
          </p>
        </div>

        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #92400e;">はじめかた</h3>
          <ol style="padding-left: 20px; margin-bottom: 0;">
            <li style="margin-bottom: 8px;">管理画面にログインして、院の設定を確認してください。</li>
            <li style="margin-bottom: 8px;">問診票URLを患者さんにお渡しください（QRコード印刷も便利です）。</li>
            <li style="margin-bottom: 8px;">患者さんが問診票を送信すると、管理画面に回答が届きます。</li>
            <li style="margin-bottom: 0;">頭痛ダイアリーは、継続的な経過観察にご活用ください。</li>
          </ol>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="font-size: 13px; color: #666;">
          ご不明な点がございましたら、お気軽にお問い合わせください。<br>
          サポート: info@oguchi-healthcare.com
        </p>
      </div>
    `,
  })
}

export async function POST(request: NextRequest) {
  let event: Stripe.Event

  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('Stripe webhook: Missing signature')
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Stripe webhook: STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Stripe署名検証
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Stripe webhook signature verification failed:', message)
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    )
  }

  // checkout.session.completed のみ処理
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session

  try {
    const metadata = session.metadata
    // checkout APIはclinicName/ownerName（キャメルケース）で送信
    const clinicNameMeta = metadata?.clinicName || metadata?.clinic_name
    const ownerNameMeta = metadata?.ownerName || metadata?.owner_name
    const emailMeta = metadata?.email || session.customer_email

    if (!clinicNameMeta || !ownerNameMeta || !emailMeta) {
      console.error('Stripe webhook: Missing metadata', metadata)
      return NextResponse.json(
        { error: 'Missing required metadata (clinicName, ownerName, email)' },
        { status: 400 }
      )
    }

    const clinic_name = clinicNameMeta
    const owner_name = ownerNameMeta
    const email = emailMeta
    const supabase = getSupabase()

    // メール重複チェック
    const { data: existing } = await supabase
      .from('clinics')
      .select('clinic_id')
      .eq('email', email)
      .single()

    if (existing) {
      console.log(`Stripe webhook: Email already registered: ${email}`)
      return NextResponse.json({
        received: true,
        message: 'Email already registered',
        clinic_id: existing.clinic_id,
      })
    }

    // clinic_id・パスワード生成
    const clinicId = generateClinicId(clinic_name)
    const rawPassword = generatePassword()

    // clinicsテーブルに登録
    const { error: insertError } = await supabase
      .from('clinics')
      .insert({
        clinic_id: clinicId,
        clinic_name,
        owner_name,
        email,
        password_hash: hashPassword(rawPassword),
        invite_code_used: 'stripe',
      })

    if (insertError) {
      console.error('Stripe webhook: Clinic insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create clinic account' },
        { status: 500 }
      )
    }

    // ウェルカムメール送信
    try {
      await sendWelcomeEmail({
        email,
        clinicName: clinic_name,
        ownerName: owner_name,
        clinicId,
        password: rawPassword,
      })
      console.log(`Stripe webhook: Welcome email sent to ${email}`)
    } catch (emailErr) {
      // メール送信失敗してもアカウント作成は成功させる
      console.error('Stripe webhook: Failed to send welcome email:', emailErr)
    }

    console.log(`Stripe webhook: Account created - clinic_id: ${clinicId}, email: ${email}`)

    return NextResponse.json({
      received: true,
      clinic_id: clinicId,
    })

  } catch (err) {
    console.error('Stripe webhook: Processing error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
