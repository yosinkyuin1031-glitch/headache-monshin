"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'

interface MonshinResponse {
  id: string
  patient_name: string
  patient_furigana: string
  patient_tel: string
  patient_email: string
  patient_birthday: string
  patient_address: string
  form_data: Record<string, unknown>
  submitted_at: string
  created_at: string
}

interface ClinicInfo {
  clinic_id: string
  clinic_name: string
  owner_name: string
}

export default function ClinicAdminPage() {
  const params = useParams()
  const clinicId = params.clinicId as string

  const [token, setToken] = useState<string | null>(null)
  const [clinic, setClinic] = useState<ClinicInfo | null>(null)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [responses, setResponses] = useState<MonshinResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedResponse, setSelectedResponse] = useState<MonshinResponse | null>(null)

  useEffect(() => {
    const saved = sessionStorage.getItem(`clinic_token_${clinicId}`)
    const savedClinic = sessionStorage.getItem(`clinic_info_${clinicId}`)
    if (saved) {
      setToken(saved)
      if (savedClinic) setClinic(JSON.parse(savedClinic))
    }
  }, [clinicId])

  const fetchResponses = useCallback(async (authToken: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/clinic/responses?clinic_id=${clinicId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      })
      const json = await res.json()
      if (json.success) {
        setResponses(json.data || [])
      }
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [clinicId])

  useEffect(() => {
    if (token) fetchResponses(token)
  }, [token, fetchResponses])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    try {
      const res = await fetch('/api/clinic/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinic_id: clinicId, password }),
      })
      const json = await res.json()
      if (json.success) {
        sessionStorage.setItem(`clinic_token_${clinicId}`, json.token)
        sessionStorage.setItem(`clinic_info_${clinicId}`, JSON.stringify(json.clinic))
        setToken(json.token)
        setClinic(json.clinic)
      } else {
        setAuthError(json.error || 'ログインに失敗しました')
      }
    } catch {
      setAuthError('サーバーに接続できません')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem(`clinic_token_${clinicId}`)
    sessionStorage.removeItem(`clinic_info_${clinicId}`)
    setToken(null)
    setClinic(null)
    setPassword('')
    setResponses([])
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
  }

  const isToday = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toDateString() === new Date().toDateString()
  }

  const isThisWeek = (dateStr: string) => {
    const d = new Date(dateStr)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return d >= weekAgo
  }

  const todayCount = responses.filter(r => isToday(r.submitted_at)).length
  const weekCount = responses.filter(r => isThisWeek(r.submitted_at)).length

  const filteredResponses = responses.filter(r =>
    !searchQuery ||
    r.patient_name?.includes(searchQuery) ||
    r.patient_furigana?.includes(searchQuery)
  )

  const renderValue = (value: unknown): string => {
    if (Array.isArray(value)) return value.length > 0 ? value.join('、') : '未回答'
    if (typeof value === 'string') return value || '未回答'
    if (typeof value === 'number') return String(value)
    return '未回答'
  }

  const monshinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/monshin.html?clinic=${clinicId}`
    : ''

  // ログイン画面
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-[#1a3a5c] text-white text-center py-6 px-4">
              <h1 className="text-xl font-bold">管理画面ログイン</h1>
              <p className="text-sm opacity-80 mt-1">頭痛専門Web問診票</p>
            </div>
            <form onSubmit={handleLogin} className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">パスワード</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#4a9eca] focus:border-transparent"
                  placeholder="パスワードを入力"
                  autoFocus
                />
              </div>
              {authError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
                  {authError}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-[#1a3a5c] hover:bg-[#2a5280] text-white font-bold py-3 rounded-lg transition-colors"
              >
                ログイン
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // 管理画面
  return (
    <>
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          #print-area h2 { font-size: 18px; margin-bottom: 16px; border-bottom: 2px solid #1a3a5c; padding-bottom: 8px; }
          #print-area table { width: 100%; border-collapse: collapse; }
          #print-area th, #print-area td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; font-size: 13px; }
          #print-area th { background: #f0f4f8; font-weight: 600; width: 30%; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-100">
        <header className="bg-[#1a3a5c] text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">Web問診票 管理画面</h1>
              <p className="text-xs opacity-70">{clinic?.clinic_name || clinicId}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              ログアウト
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* 問診票URL */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-bold text-blue-800 mb-1">あなた専用の問診票URL</p>
            <p className="text-xs text-blue-600 font-mono break-all bg-white border border-blue-200 rounded px-3 py-2">
              {monshinUrl}
            </p>
            <button
              onClick={() => { navigator.clipboard.writeText(monshinUrl) }}
              className="mt-2 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition-colors"
            >
              URLをコピー
            </button>
          </div>

          {/* 統計カード */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <p className="text-sm text-gray-500">総回答数</p>
              <p className="text-3xl font-bold text-[#1a3a5c]">{responses.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5">
              <p className="text-sm text-gray-500">今日の回答</p>
              <p className="text-3xl font-bold text-[#4a9eca]">{todayCount}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5">
              <p className="text-sm text-gray-500">今週の回答</p>
              <p className="text-3xl font-bold text-[#2d8a4e]">{weekCount}</p>
            </div>
          </div>

          {/* 検索 */}
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="患者名で検索..."
              className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#4a9eca] focus:border-transparent bg-white"
            />
          </div>

          {/* テーブル */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-400">読み込み中...</div>
            ) : filteredResponses.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                {searchQuery ? '検索結果がありません' : '回答データがありません'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#1a3a5c] text-white">
                      <th className="text-left px-4 py-3 font-medium">送信日時</th>
                      <th className="text-left px-4 py-3 font-medium">患者名</th>
                      <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">電話番号</th>
                      <th className="text-left px-4 py-3 font-medium hidden md:table-cell">痛みレベル</th>
                      <th className="text-center px-4 py-3 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResponses.map((r, i) => (
                      <tr
                        key={r.id}
                        className={`border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                        onClick={() => setSelectedResponse(r)}
                      >
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(r.submitted_at)}</td>
                        <td className="px-4 py-3 font-medium text-[#1a3a5c]">
                          {r.patient_name}
                          <span className="block text-xs text-gray-400">{r.patient_furigana}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{r.patient_tel}</td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {String((r.form_data as Record<string, unknown>)?.pain_level ?? '-')} / 10
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedResponse(r) }}
                            className="bg-[#4a9eca] hover:bg-[#3a8eba] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          >
                            詳細
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        {/* 詳細モーダル */}
        {selectedResponse && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedResponse(null)}
          >
            <div
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div id="print-area">
                <div className="bg-[#1a3a5c] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                  <h2 className="text-lg font-bold">{selectedResponse.patient_name} 様の問診票</h2>
                  <div className="flex items-center gap-2">
                    <button onClick={() => window.print()} className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm transition-colors">印刷</button>
                    <button onClick={() => setSelectedResponse(null)} className="bg-white/10 hover:bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-lg">×</button>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <Section title="基本情報">
                    <Row label="お名前" value={`${selectedResponse.patient_name}（${selectedResponse.patient_furigana}）`} />
                    <Row label="生年月日" value={selectedResponse.patient_birthday} />
                    <Row label="電話番号" value={selectedResponse.patient_tel} />
                    <Row label="メール" value={selectedResponse.patient_email || '未入力'} />
                    <Row label="住所" value={selectedResponse.patient_address || '未入力'} />
                  </Section>
                  <Section title="頭痛の状態">
                    <Row label="発症時期" value={renderValue((selectedResponse.form_data)?.onset)} />
                    <Row label="頻度" value={renderValue((selectedResponse.form_data)?.frequency)} />
                    <Row label="持続時間" value={renderValue((selectedResponse.form_data)?.duration)} />
                    <Row label="痛みの強さ" value={`${(selectedResponse.form_data)?.pain_level ?? '-'} / 10`} />
                    <Row label="痛みの部位" value={renderValue((selectedResponse.form_data)?.location)} />
                    <Row label="痛みの種類" value={renderValue((selectedResponse.form_data)?.pain_type)} />
                    <Row label="起きやすい時" value={renderValue((selectedResponse.form_data)?.trigger)} />
                    <Row label="随伴症状" value={renderValue((selectedResponse.form_data)?.accompanying)} />
                    <Row label="頭痛薬" value={renderValue((selectedResponse.form_data)?.medication)} />
                    <Row label="薬の種類" value={renderValue((selectedResponse.form_data)?.medicine_name)} />
                  </Section>
                  <Section title="カラダの状態">
                    <Row label="頭痛以外の不調" value={renderValue((selectedResponse.form_data)?.body_pain)} />
                    <Row label="気になること" value={renderValue((selectedResponse.form_data)?.body_condition)} />
                    <Row label="体の満足度" value={`${(selectedResponse.form_data)?.satisfaction ?? '-'}%`} />
                  </Section>
                  <Section title="カウンセリング">
                    {[
                      { q: 'なぜ当院を選びましたか？', k: 'q1' },
                      { q: '日常生活での問題は？', k: 'q2' },
                      { q: '最も不安なことは？', k: 'q3' },
                      { q: '通院の心配・障害は？', k: 'q4' },
                      { q: '頭痛改善の一番の理由は？', k: 'q5' },
                    ].map((item, i) => (
                      <Row key={i} label={`Q${i+1}. ${item.q}`} value={renderValue((selectedResponse.form_data)?.[item.k])} />
                    ))}
                  </Section>
                  <div className="text-xs text-gray-400 pt-4 border-t border-gray-200">
                    送信日時: {formatDate(selectedResponse.submitted_at)} / ID: {selectedResponse.id}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-base font-bold text-[#1a3a5c] mb-3 pb-2 border-b-2 border-[#4a9eca]">{title}</h3>
      <table className="w-full text-sm"><tbody>{children}</tbody></table>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-gray-100">
      <th className="text-left py-2.5 px-3 text-gray-500 font-medium bg-gray-50/50 w-[30%] align-top">{label}</th>
      <td className="py-2.5 px-3 text-gray-800">{value}</td>
    </tr>
  )
}
