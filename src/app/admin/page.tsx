"use client"

import { useState, useEffect, useCallback } from 'react'

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

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [responses, setResponses] = useState<MonshinResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedResponse, setSelectedResponse] = useState<MonshinResponse | null>(null)

  useEffect(() => {
    const savedToken = sessionStorage.getItem('admin_token')
    if (savedToken) {
      setToken(savedToken)
    }
  }, [])

  const fetchResponses = useCallback(async (authToken: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/responses', {
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
  }, [])

  useEffect(() => {
    if (token) {
      fetchResponses(token)
    }
  }, [token, fetchResponses])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const json = await res.json()
      if (json.success) {
        sessionStorage.setItem('admin_token', json.token)
        setToken(json.token)
      } else {
        setAuthError('パスワードが正しくありません')
      }
    } catch {
      setAuthError('サーバーに接続できません')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token')
    setToken(null)
    setPassword('')
    setResponses([])
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
  }

  const isToday = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  }

  const isThisWeek = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return d >= weekAgo
  }

  const todayCount = responses.filter(r => isToday(r.submitted_at)).length
  const weekCount = responses.filter(r => isThisWeek(r.submitted_at)).length

  const filteredResponses = responses.filter(r =>
    !searchQuery ||
    r.patient_name.includes(searchQuery) ||
    r.patient_furigana.includes(searchQuery)
  )

  const renderFormDataValue = (value: unknown): string => {
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join('、') : '未回答'
    }
    if (typeof value === 'string') {
      return value || '未回答'
    }
    if (typeof value === 'number') {
      return String(value)
    }
    return '未回答'
  }

  // ログイン画面
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-[#1a3a5c] text-white text-center py-6 px-4">
              <h1 className="text-xl font-bold">管理画面ログイン</h1>
              <p className="text-sm opacity-80 mt-1">Web問診票 管理システム</p>
            </div>
            <form onSubmit={handleLogin} className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード
                </label>
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

  // 管理画面本体
  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          #print-area h2 {
            font-size: 18px;
            margin-bottom: 16px;
            border-bottom: 2px solid #1a3a5c;
            padding-bottom: 8px;
          }
          #print-area table {
            width: 100%;
            border-collapse: collapse;
          }
          #print-area th, #print-area td {
            border: 1px solid #ccc;
            padding: 6px 10px;
            text-align: left;
            font-size: 13px;
          }
          #print-area th {
            background: #f0f4f8;
            font-weight: 600;
            width: 30%;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-100">
        {/* ヘッダー */}
        <header className="bg-[#1a3a5c] text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">Web問診票 管理画面</h1>
              <p className="text-xs opacity-70">三宮元町鍼灸整体院C-cure</p>
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

          {/* 検索バー */}
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
                      <th className="text-left px-4 py-3 font-medium hidden md:table-cell">頻度</th>
                      <th className="text-center px-4 py-3 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResponses.map((r, i) => (
                      <tr
                        key={r.id}
                        className={`border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer transition-colors ${
                          i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                        onClick={() => setSelectedResponse(r)}
                      >
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {formatDate(r.submitted_at)}
                        </td>
                        <td className="px-4 py-3 font-medium text-[#1a3a5c]">
                          {r.patient_name}
                          <span className="block text-xs text-gray-400">{r.patient_furigana}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                          {r.patient_tel}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {String((r.form_data as Record<string, unknown>)?.pain_level ?? '-')} / 10
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                          {String((r.form_data as Record<string, unknown>)?.frequency || '-')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedResponse(r)
                            }}
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
                {/* モーダルヘッダー */}
                <div className="bg-[#1a3a5c] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                  <h2 className="text-lg font-bold">
                    {selectedResponse.patient_name} 様の問診票
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm transition-colors"
                    >
                      印刷
                    </button>
                    <button
                      onClick={() => setSelectedResponse(null)}
                      className="bg-white/10 hover:bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-lg"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* 基本情報 */}
                  <section>
                    <h3 className="text-base font-bold text-[#1a3a5c] mb-3 pb-2 border-b-2 border-[#4a9eca]">
                      基本情報
                    </h3>
                    <table className="w-full text-sm">
                      <tbody>
                        <DetailRow label="お名前" value={`${selectedResponse.patient_name}（${selectedResponse.patient_furigana}）`} />
                        <DetailRow label="生年月日" value={selectedResponse.patient_birthday} />
                        <DetailRow label="電話番号" value={selectedResponse.patient_tel} />
                        <DetailRow label="メール" value={selectedResponse.patient_email || '未入力'} />
                        <DetailRow label="住所" value={selectedResponse.patient_address || '未入力'} />
                        <DetailRow label="職業" value={renderFormDataValue((selectedResponse.form_data as Record<string, unknown>)?.job)} />
                        <DetailRow label="仕事の内容" value={renderFormDataValue((selectedResponse.form_data as Record<string, unknown>)?.job_type)} />
                        <DetailRow label="来院きっかけ" value={renderFormDataValue((selectedResponse.form_data as Record<string, unknown>)?.source)} />
                      </tbody>
                    </table>
                  </section>

                  {/* 頭痛の状態 */}
                  <section>
                    <h3 className="text-base font-bold text-[#1a3a5c] mb-3 pb-2 border-b-2 border-[#4a9eca]">
                      頭痛の状態
                    </h3>
                    <table className="w-full text-sm">
                      <tbody>
                        <DetailRow label="発症時期" value={renderFormDataValue((selectedResponse.form_data as Record<string, unknown>)?.onset)} />
                        <DetailRow label="頻度" value={renderFormDataValue((selectedResponse.form_data as Record<string, unknown>)?.frequency)} />
                        <DetailRow label="持続時間" value={renderFormDataValue((selectedResponse.form_data as Record<string, unknown>)?.duration)} />
                        <DetailRow label="痛みの強さ" value={`${(selectedResponse.form_data as Record<string, unknown>)?.pain_level ?? '-'} / 10`} />
                        <DetailRow label="痛みの部位" value={renderFormDataValue((selectedResponse.form_data as Record<string, unknown>)?.location)} />
                        <DetailRow label="痛みの種類" value={renderFormDataValue((selectedResponse.form_data as Record<string, unknown>)?.pain_type)} />
                        <DetailRow label="起きやすい時" value={renderFormDataValue((selectedResponse.form_data as Record<string, unknown>)?.trigger)} />
                        <DetailRow label="随伴症状" value={renderFormDataValue((selectedResponse.form_data as Record<string, unknown>)?.accompanying)} />
                        <DetailRow label="頭痛薬" value={renderFormDataValue((selectedResponse.form_data as Record<string, unknown>)?.medication)} />
                        <DetailRow label="薬の種類" value={renderFormDataValue((selectedResponse.form_data as Record<string, unknown>)?.medicine_name)} />
                        <DetailRow label="診断名" value={renderFormDataValue((selectedResponse.form_data as Record<string, unknown>)?.diagnosis)} />
                      </tbody>
                    </table>
                  </section>

                  {/* カラダの状態 */}
                  <section>
                    <h3 className="text-base font-bold text-[#1a3a5c] mb-3 pb-2 border-b-2 border-[#4a9eca]">
                      カラダの状態
                    </h3>
                    <table className="w-full text-sm">
                      <tbody>
                        <DetailRow label="頭痛以外の不調" value={renderFormDataValue((selectedResponse.form_data as Record<string, unknown>)?.body_pain)} />
                        <DetailRow label="気になること" value={renderFormDataValue((selectedResponse.form_data as Record<string, unknown>)?.body_condition)} />
                        <DetailRow label="体の満足度" value={`${(selectedResponse.form_data as Record<string, unknown>)?.satisfaction ?? '-'}%`} />
                        <DetailRow label="健康への取組" value={renderFormDataValue((selectedResponse.form_data as Record<string, unknown>)?.health_effort)} />
                      </tbody>
                    </table>
                  </section>

                  {/* カウンセリング */}
                  <section>
                    <h3 className="text-base font-bold text-[#1a3a5c] mb-3 pb-2 border-b-2 border-[#4a9eca]">
                      カウンセリング
                    </h3>
                    <div className="space-y-4">
                      <CounselingItem num={1} question="なぜ当院を選びましたか？" answer={renderFormDataValue((selectedResponse.form_data as Record<string, unknown>)?.q1)} />
                      <CounselingItem num={2} question="日常生活での問題は？" answer={renderFormDataValue((selectedResponse.form_data as Record<string, unknown>)?.q2)} />
                      <CounselingItem num={3} question="最も不安なことは？" answer={renderFormDataValue((selectedResponse.form_data as Record<string, unknown>)?.q3)} />
                      <CounselingItem num={4} question="通院の心配・障害は？" answer={renderFormDataValue((selectedResponse.form_data as Record<string, unknown>)?.q4)} />
                      <CounselingItem num={5} question="頭痛改善の一番の理由は？" answer={renderFormDataValue((selectedResponse.form_data as Record<string, unknown>)?.q5)} />
                    </div>
                  </section>

                  {/* 撮影同意 */}
                  <section>
                    <h3 className="text-base font-bold text-[#1a3a5c] mb-3 pb-2 border-b-2 border-[#4a9eca]">
                      撮影同意
                    </h3>
                    <table className="w-full text-sm">
                      <tbody>
                        <DetailRow label="撮影同意" value={renderFormDataValue((selectedResponse.form_data as Record<string, unknown>)?.photo_consent)} />
                      </tbody>
                    </table>
                  </section>

                  {/* 送信情報 */}
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-gray-100">
      <th className="text-left py-2.5 px-3 text-gray-500 font-medium bg-gray-50/50 w-[30%] align-top">
        {label}
      </th>
      <td className="py-2.5 px-3 text-gray-800">
        {value}
      </td>
    </tr>
  )
}

function CounselingItem({ num, question, answer }: { num: number; question: string; answer: string }) {
  return (
    <div>
      <div className="flex items-start gap-2 mb-1">
        <span className="inline-flex items-center justify-center w-6 h-6 bg-[#4a9eca] text-white rounded-full text-xs font-bold flex-shrink-0">
          {num}
        </span>
        <span className="text-sm font-medium text-[#1a3a5c]">{question}</span>
      </div>
      <p className="text-sm text-gray-700 pl-8 leading-relaxed bg-gray-50 rounded-lg p-3 ml-0">
        {answer}
      </p>
    </div>
  )
}
