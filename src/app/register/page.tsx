"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function RegisterForm() {
  const searchParams = useSearchParams()
  const codeFromUrl = searchParams.get('code') || ''

  const [code, setCode] = useState(codeFromUrl)
  const [clinicName, setClinicName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    clinic_id: string
    admin_url: string
    monshin_url: string
  } | null>(null)

  useEffect(() => {
    if (codeFromUrl) setCode(codeFromUrl)
  }, [codeFromUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!code || !clinicName || !ownerName || !email || !password) {
      setError('全ての項目を入力してください')
      return
    }

    if (password !== passwordConfirm) {
      setError('パスワードが一致しません')
      return
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で設定してください')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase(),
          clinic_name: clinicName,
          owner_name: ownerName,
          email,
          password,
        }),
      })
      const json = await res.json()

      if (json.success) {
        setResult(json)
      } else {
        setError(json.error || '登録に失敗しました')
      }
    } catch {
      setError('サーバーに接続できません')
    } finally {
      setLoading(false)
    }
  }

  // 登録完了画面
  if (result) {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-[#2d8a4e] text-white text-center py-8 px-4">
              <div className="text-4xl mb-3">✓</div>
              <h1 className="text-xl font-bold">アカウント登録完了</h1>
              <p className="text-sm opacity-80 mt-1">頭痛専門Web問診票システム</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h2 className="text-sm font-bold text-blue-800 mb-3">あなた専用のURL</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-blue-600 mb-1">管理画面URL</p>
                    <a
                      href={result.admin_url}
                      className="text-sm text-blue-800 font-mono bg-white border border-blue-200 rounded px-3 py-2 block break-all hover:bg-blue-50"
                    >
                      {baseUrl}{result.admin_url}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 mb-1">問診票URL（患者様に共有）</p>
                    <div className="text-sm text-blue-800 font-mono bg-white border border-blue-200 rounded px-3 py-2 break-all">
                      {baseUrl}{result.monshin_url}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 font-bold mb-1">重要</p>
                <p className="text-xs text-yellow-700">
                  上記のURLを必ずブックマークまたはメモしてください。
                  管理画面にはログインパスワードでアクセスできます。
                </p>
              </div>

              <a
                href={result.admin_url}
                className="block w-full bg-[#1a3a5c] hover:bg-[#2a5280] text-white font-bold py-3 rounded-lg text-center transition-colors"
              >
                管理画面を開く
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-[#1a3a5c] text-white text-center py-6 px-4">
            <h1 className="text-xl font-bold">アカウント登録</h1>
            <p className="text-sm opacity-80 mt-1">頭痛専門Web問診票システム</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                招待コード <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base font-mono tracking-widest text-center uppercase focus:outline-none focus:ring-2 focus:ring-[#4a9eca] focus:border-transparent"
                placeholder="XXXXXXXX"
                maxLength={8}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                院名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#4a9eca] focus:border-transparent"
                placeholder="例：○○整骨院"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                お名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#4a9eca] focus:border-transparent"
                placeholder="例：山田太郎"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#4a9eca] focus:border-transparent"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#4a9eca] focus:border-transparent"
                placeholder="6文字以上"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード（確認） <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#4a9eca] focus:border-transparent"
                placeholder="もう一度入力"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a3a5c] hover:bg-[#2a5280] disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
            >
              {loading ? '登録中...' : 'アカウントを登録する'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-400">読み込み中...</div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
