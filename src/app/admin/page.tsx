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

interface InviteCode {
  id: string
  code: string
  is_used: boolean
  used_by_clinic_id: string | null
  expires_at: string
  created_at: string
}

interface Clinic {
  id: string
  clinic_id: string
  clinic_name: string
  owner_name: string
  email: string
  is_active: boolean
  created_at: string
  last_login_at: string | null
  response_count: number
}

interface DiaryRecord {
  id: string
  patient_id: string
  record_date: string
  onset_period: string
  pain_level: number
  pain_types: string[]
  pain_location: string[]
  accompanying_symptoms: string[]
  triggers: string[]
  weather: string
  sleep_hours: number
  stress_level: number
  medications_list: Array<{ name: string; time: string; effect: string }>
  med_effect: string
  daily_impact: number
  memo: string
}

interface DiaryPatient {
  id: string
  name: string
  phone: string
  access_code: string
  memo: string
  created_at: string
  records: DiaryRecord[]
  total_records: number
  avg_pain: number
  last_record_date: string | null
}

type Tab = 'responses' | 'diary' | 'clinics' | 'codes'

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('responses')

  // 回答関連
  const [responses, setResponses] = useState<MonshinResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedResponse, setSelectedResponse] = useState<MonshinResponse | null>(null)

  // 招待コード関連
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([])
  const [codesLoading, setCodesLoading] = useState(false)
  const [generateCount, setGenerateCount] = useState(1)
  const [generateDays, setGenerateDays] = useState(30)
  const [generating, setGenerating] = useState(false)

  // クリニック関連
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [clinicsLoading, setClinicsLoading] = useState(false)

  // ダイアリー関連
  const [diaryPatients, setDiaryPatients] = useState<DiaryPatient[]>([])
  const [diaryLoading, setDiaryLoading] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<DiaryPatient | null>(null)
  const [diarySearch, setDiarySearch] = useState('')

  useEffect(() => {
    const savedToken = sessionStorage.getItem('admin_token')
    if (savedToken) setToken(savedToken)
  }, [])

  const fetchResponses = useCallback(async (authToken: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/responses', {
        headers: { 'Authorization': `Bearer ${authToken}` },
      })
      const json = await res.json()
      if (json.success) setResponses(json.data || [])
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchInviteCodes = useCallback(async (authToken: string) => {
    setCodesLoading(true)
    try {
      const res = await fetch('/api/admin/invite-codes', {
        headers: { 'Authorization': `Bearer ${authToken}` },
      })
      const json = await res.json()
      if (json.success) setInviteCodes(json.data || [])
    } catch (err) {
      console.error('Fetch codes error:', err)
    } finally {
      setCodesLoading(false)
    }
  }, [])

  const fetchDiary = useCallback(async (authToken: string) => {
    setDiaryLoading(true)
    try {
      const res = await fetch('/api/admin/diary', {
        headers: { 'Authorization': `Bearer ${authToken}` },
      })
      const json = await res.json()
      if (json.success) setDiaryPatients(json.data || [])
    } catch (err) {
      console.error('Fetch diary error:', err)
    } finally {
      setDiaryLoading(false)
    }
  }, [])

  const fetchClinics = useCallback(async (authToken: string) => {
    setClinicsLoading(true)
    try {
      const res = await fetch('/api/admin/clinics', {
        headers: { 'Authorization': `Bearer ${authToken}` },
      })
      const json = await res.json()
      if (json.success) setClinics(json.data || [])
    } catch (err) {
      console.error('Fetch clinics error:', err)
    } finally {
      setClinicsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) {
      fetchResponses(token)
      fetchInviteCodes(token)
      fetchClinics(token)
      fetchDiary(token)
    }
  }, [token, fetchResponses, fetchInviteCodes, fetchClinics, fetchDiary])

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
    setInviteCodes([])
    setClinics([])
    setDiaryPatients([])
  }

  const handleGenerateCodes = async () => {
    if (!token) return
    setGenerating(true)
    try {
      const res = await fetch('/api/admin/invite-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ count: generateCount, days: generateDays }),
      })
      const json = await res.json()
      if (json.success) {
        fetchInviteCodes(token)
      }
    } catch (err) {
      console.error('Generate error:', err)
    } finally {
      setGenerating(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
  }

  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' })
  }

  const isToday = (dateStr: string) => {
    return new Date(dateStr).toDateString() === new Date().toDateString()
  }

  const isThisWeek = (dateStr: string) => {
    return new Date(dateStr) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  }

  const isExpired = (dateStr: string) => {
    return new Date(dateStr) < new Date()
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

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  // ログイン画面
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-[#1a3a5c] text-white text-center py-6 px-4">
              <h1 className="text-xl font-bold">管理者ログイン</h1>
              <p className="text-sm opacity-80 mt-1">頭痛専門Web問診票 管理システム</p>
            </div>
            <form onSubmit={handleLogin} className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">パスワード</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#4a9eca] focus:border-transparent"
                  placeholder="管理者パスワードを入力"
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
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-100">
        <header className="bg-[#1a3a5c] text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">管理者ダッシュボード</h1>
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

        {/* タブ */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-1">
              {([
                { key: 'responses' as Tab, label: '問診票データ', count: responses.length },
                { key: 'diary' as Tab, label: '頭痛ダイアリー', count: diaryPatients.reduce((s, p) => s + p.total_records, 0) },
                { key: 'clinics' as Tab, label: '受講生一覧', count: clinics.length },
                { key: 'codes' as Tab, label: '招待コード管理', count: inviteCodes.filter(c => !c.is_used && !isExpired(c.expires_at)).length },
              ]).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-[#4a9eca] text-[#1a3a5c]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs ${
                    activeTab === tab.key ? 'bg-[#4a9eca] text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-6">

          {/* === 自院の問診データタブ === */}
          {activeTab === 'responses' && (
            <>
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

              <div className="mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="患者名で検索..."
                  className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#4a9eca] focus:border-transparent bg-white"
                />
              </div>

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
            </>
          )}

          {/* === 頭痛ダイアリータブ === */}
          {activeTab === 'diary' && (
            <>
              {/* 患者名で紐づけ情報 */}
              {(() => {
                const totalRecords = diaryPatients.reduce((s, p) => s + p.total_records, 0)
                const linkedCount = diaryPatients.filter(p => {
                  return responses.some(r =>
                    r.patient_name === p.name ||
                    (r.patient_tel && p.phone && r.patient_tel === p.phone)
                  )
                }).length
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-5">
                      <p className="text-sm text-gray-500">ダイアリー患者数</p>
                      <p className="text-3xl font-bold text-[#1a3a5c]">{diaryPatients.length}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5">
                      <p className="text-sm text-gray-500">総記録数</p>
                      <p className="text-3xl font-bold text-[#4a9eca]">{totalRecords}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5">
                      <p className="text-sm text-gray-500">問診票と紐づき</p>
                      <p className="text-3xl font-bold text-[#2d8a4e]">{linkedCount}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5">
                      <p className="text-sm text-gray-500">平均記録数/人</p>
                      <p className="text-3xl font-bold text-[#8b5cf6]">
                        {diaryPatients.length > 0 ? Math.round(totalRecords / diaryPatients.length * 10) / 10 : 0}
                      </p>
                    </div>
                  </div>
                )
              })()}

              <div className="mb-4">
                <input
                  type="text"
                  value={diarySearch}
                  onChange={(e) => setDiarySearch(e.target.value)}
                  placeholder="患者名で検索..."
                  className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#4a9eca] focus:border-transparent bg-white"
                />
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {diaryLoading ? (
                  <div className="p-12 text-center text-gray-400">読み込み中...</div>
                ) : diaryPatients.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">ダイアリーの患者データはありません</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#1a3a5c] text-white">
                          <th className="text-left px-4 py-3 font-medium">患者名</th>
                          <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">電話番号</th>
                          <th className="text-center px-4 py-3 font-medium">記録数</th>
                          <th className="text-center px-4 py-3 font-medium">平均痛み</th>
                          <th className="text-left px-4 py-3 font-medium hidden md:table-cell">最終記録日</th>
                          <th className="text-center px-4 py-3 font-medium">問診票</th>
                          <th className="text-center px-4 py-3 font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diaryPatients
                          .filter(p => !diarySearch || p.name?.includes(diarySearch))
                          .map((p, i) => {
                            const linkedMonshin = responses.find(r =>
                              r.patient_name === p.name ||
                              (r.patient_tel && p.phone && r.patient_tel === p.phone)
                            )
                            return (
                              <tr key={p.id} className={`border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`} onClick={() => setSelectedPatient(p)}>
                                <td className="px-4 py-3 font-medium text-[#1a3a5c]">
                                  {p.name}
                                  <span className="block text-xs text-gray-400 font-mono">{p.access_code}</span>
                                </td>
                                <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{p.phone || '-'}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {p.total_records}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    p.avg_pain >= 7 ? 'bg-red-100 text-red-800' :
                                    p.avg_pain >= 4 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {p.avg_pain}/10
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600 text-xs hidden md:table-cell">
                                  {p.last_record_date || '-'}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {linkedMonshin ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      紐づき
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedPatient(p) }}
                                    className="bg-[#4a9eca] hover:bg-[#3a8eba] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                  >
                                    詳細
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* === 受講生一覧タブ === */}
          {activeTab === 'clinics' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <p className="text-sm text-gray-500">登録済み院数</p>
                  <p className="text-3xl font-bold text-[#1a3a5c]">{clinics.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <p className="text-sm text-gray-500">アクティブ</p>
                  <p className="text-3xl font-bold text-[#2d8a4e]">{clinics.filter(c => c.is_active).length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <p className="text-sm text-gray-500">総問診回答数</p>
                  <p className="text-3xl font-bold text-[#4a9eca]">{clinics.reduce((sum, c) => sum + c.response_count, 0)}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {clinicsLoading ? (
                  <div className="p-12 text-center text-gray-400">読み込み中...</div>
                ) : clinics.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">登録済みの受講生はまだいません</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#1a3a5c] text-white">
                          <th className="text-left px-4 py-3 font-medium">院名</th>
                          <th className="text-left px-4 py-3 font-medium">代表者</th>
                          <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">メール</th>
                          <th className="text-center px-4 py-3 font-medium">回答数</th>
                          <th className="text-left px-4 py-3 font-medium hidden md:table-cell">最終ログイン</th>
                          <th className="text-center px-4 py-3 font-medium">状態</th>
                          <th className="text-center px-4 py-3 font-medium">リンク</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clinics.map((c, i) => (
                          <tr key={c.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                            <td className="px-4 py-3 font-medium text-[#1a3a5c]">{c.clinic_name}</td>
                            <td className="px-4 py-3 text-gray-700">{c.owner_name}</td>
                            <td className="px-4 py-3 text-gray-600 hidden sm:table-cell text-xs">{c.email}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {c.response_count}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                              {c.last_login_at ? formatDateShort(c.last_login_at) : '未ログイン'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                c.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {c.is_active ? '有効' : '無効'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <a
                                href={`/admin/${c.clinic_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#4a9eca] hover:underline text-xs"
                              >
                                管理画面
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* === 招待コード管理タブ === */}
          {activeTab === 'codes' && (
            <>
              {/* コード発行フォーム */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-base font-bold text-[#1a3a5c] mb-4">招待コードを発行</h2>
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">発行枚数</label>
                    <select
                      value={generateCount}
                      onChange={(e) => setGenerateCount(Number(e.target.value))}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a9eca]"
                    >
                      {[1, 3, 5, 10].map(n => (
                        <option key={n} value={n}>{n}枚</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">有効期限</label>
                    <select
                      value={generateDays}
                      onChange={(e) => setGenerateDays(Number(e.target.value))}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a9eca]"
                    >
                      {[7, 14, 30, 60, 90].map(d => (
                        <option key={d} value={d}>{d}日間</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleGenerateCodes}
                    disabled={generating}
                    className="bg-[#2d8a4e] hover:bg-[#257a42] disabled:bg-gray-400 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors"
                  >
                    {generating ? '発行中...' : '発行する'}
                  </button>
                </div>
              </div>

              {/* コード一覧 */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {codesLoading ? (
                  <div className="p-12 text-center text-gray-400">読み込み中...</div>
                ) : inviteCodes.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">招待コードはまだ発行されていません</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#1a3a5c] text-white">
                          <th className="text-left px-4 py-3 font-medium">コード</th>
                          <th className="text-center px-4 py-3 font-medium">状態</th>
                          <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">使用者</th>
                          <th className="text-left px-4 py-3 font-medium">有効期限</th>
                          <th className="text-left px-4 py-3 font-medium hidden md:table-cell">発行日</th>
                          <th className="text-center px-4 py-3 font-medium">URL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inviteCodes.map((code, i) => {
                          const expired = isExpired(code.expires_at)
                          const status = code.is_used ? 'used' : expired ? 'expired' : 'active'
                          return (
                            <tr key={code.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                              <td className="px-4 py-3 font-mono font-bold text-[#1a3a5c] tracking-wider">
                                {code.code}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  status === 'active' ? 'bg-green-100 text-green-800' :
                                  status === 'used' ? 'bg-blue-100 text-blue-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {status === 'active' ? '有効' : status === 'used' ? '使用済' : '期限切れ'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-600 hidden sm:table-cell text-xs">
                                {code.used_by_clinic_id || '-'}
                              </td>
                              <td className="px-4 py-3 text-gray-600 text-xs">
                                {formatDateShort(code.expires_at)}
                              </td>
                              <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                                {formatDateShort(code.created_at)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {status === 'active' && (
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(`${baseUrl}/register?code=${code.code}`)
                                    }}
                                    className="text-[#4a9eca] hover:underline text-xs"
                                  >
                                    コピー
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
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
                    <DetailRow label="お名前" value={`${selectedResponse.patient_name}（${selectedResponse.patient_furigana}）`} />
                    <DetailRow label="生年月日" value={selectedResponse.patient_birthday} />
                    <DetailRow label="電話番号" value={selectedResponse.patient_tel} />
                    <DetailRow label="メール" value={selectedResponse.patient_email || '未入力'} />
                    <DetailRow label="住所" value={selectedResponse.patient_address || '未入力'} />
                    <DetailRow label="職業" value={renderValue((selectedResponse.form_data)?.job)} />
                    <DetailRow label="来院きっかけ" value={renderValue((selectedResponse.form_data)?.source)} />
                  </Section>
                  <Section title="頭痛の状態">
                    <DetailRow label="発症時期" value={renderValue((selectedResponse.form_data)?.onset)} />
                    <DetailRow label="頻度" value={renderValue((selectedResponse.form_data)?.frequency)} />
                    <DetailRow label="持続時間" value={renderValue((selectedResponse.form_data)?.duration)} />
                    <DetailRow label="痛みの強さ" value={`${(selectedResponse.form_data)?.pain_level ?? '-'} / 10`} />
                    <DetailRow label="痛みの部位" value={renderValue((selectedResponse.form_data)?.location)} />
                    <DetailRow label="痛みの種類" value={renderValue((selectedResponse.form_data)?.pain_type)} />
                    <DetailRow label="起きやすい時" value={renderValue((selectedResponse.form_data)?.trigger)} />
                    <DetailRow label="随伴症状" value={renderValue((selectedResponse.form_data)?.accompanying)} />
                    <DetailRow label="頭痛薬" value={renderValue((selectedResponse.form_data)?.medication)} />
                    <DetailRow label="薬の種類" value={renderValue((selectedResponse.form_data)?.medicine_name)} />
                  </Section>
                  <Section title="カラダの状態">
                    <DetailRow label="頭痛以外の不調" value={renderValue((selectedResponse.form_data)?.body_pain)} />
                    <DetailRow label="気になること" value={renderValue((selectedResponse.form_data)?.body_condition)} />
                    <DetailRow label="体の満足度" value={`${(selectedResponse.form_data)?.satisfaction ?? '-'}%`} />
                  </Section>
                  <Section title="カウンセリング">
                    {[
                      { q: 'なぜ当院を選びましたか？', k: 'q1' },
                      { q: '日常生活での問題は？', k: 'q2' },
                      { q: '最も不安なことは？', k: 'q3' },
                      { q: '通院の心配・障害は？', k: 'q4' },
                      { q: '頭痛改善の一番の理由は？', k: 'q5' },
                    ].map((item, idx) => (
                      <DetailRow key={idx} label={`Q${idx+1}. ${item.q}`} value={renderValue((selectedResponse.form_data)?.[item.k])} />
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

        {/* ダイアリー患者詳細モーダル */}
        {selectedPatient && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPatient(null)}
          >
            <div
              className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#1a3a5c] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div>
                  <h2 className="text-lg font-bold">{selectedPatient.name} 様の頭痛ダイアリー</h2>
                  <p className="text-xs opacity-70">アクセスコード: {selectedPatient.access_code} / 記録数: {selectedPatient.total_records}</p>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="bg-white/10 hover:bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-lg"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* 紐づいた問診票 */}
                {(() => {
                  const linked = responses.find(r =>
                    r.patient_name === selectedPatient.name ||
                    (r.patient_tel && selectedPatient.phone && r.patient_tel === selectedPatient.phone)
                  )
                  if (!linked) return null
                  return (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm font-bold text-green-800 mb-2">紐づいた問診票データ</p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
                        <div>送信日: {formatDate(linked.submitted_at)}</div>
                        <div>電話: {linked.patient_tel}</div>
                        <div>痛みレベル: {String((linked.form_data)?.pain_level ?? '-')}/10</div>
                        <div>頻度: {renderValue((linked.form_data)?.frequency)}</div>
                      </div>
                      <button
                        onClick={() => { setSelectedPatient(null); setSelectedResponse(linked); }}
                        className="mt-2 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded transition-colors"
                      >
                        問診票の詳細を見る
                      </button>
                    </div>
                  )
                })()}

                {/* KPIカード */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">平均痛み</p>
                    <p className={`text-2xl font-bold ${selectedPatient.avg_pain >= 7 ? 'text-red-600' : selectedPatient.avg_pain >= 4 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {selectedPatient.avg_pain}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">総記録数</p>
                    <p className="text-2xl font-bold text-[#1a3a5c]">{selectedPatient.total_records}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">平均睡眠</p>
                    <p className="text-2xl font-bold text-[#4a9eca]">
                      {selectedPatient.records.length > 0
                        ? (Math.round(selectedPatient.records.reduce((s: number, r: DiaryRecord) => s + (r.sleep_hours || 0), 0) / selectedPatient.records.length * 10) / 10)
                        : '-'}h
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">平均ストレス</p>
                    <p className="text-2xl font-bold text-[#8b5cf6]">
                      {selectedPatient.records.length > 0
                        ? (Math.round(selectedPatient.records.reduce((s: number, r: DiaryRecord) => s + (r.stress_level || 0), 0) / selectedPatient.records.length * 10) / 10)
                        : '-'}/5
                    </p>
                  </div>
                </div>

                {/* 記録一覧 */}
                <section>
                  <h3 className="text-base font-bold text-[#1a3a5c] mb-3 pb-2 border-b-2 border-[#4a9eca]">記録履歴</h3>
                  {selectedPatient.records.length === 0 ? (
                    <p className="text-sm text-gray-400">記録がありません</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedPatient.records.slice(0, 20).map((r: DiaryRecord) => (
                        <div key={r.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-[#1a3a5c]">{r.record_date}</span>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                r.pain_level >= 7 ? 'bg-red-100 text-red-800' :
                                r.pain_level >= 4 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                痛み {r.pain_level}/10
                              </span>
                              {r.weather && (
                                <span className="text-xs text-gray-500">{r.weather}</span>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            {r.onset_period && <div>発症時間帯: {r.onset_period}</div>}
                            {r.pain_types?.length > 0 && <div>痛みの種類: {r.pain_types.join('、')}</div>}
                            {r.pain_location?.length > 0 && <div>痛みの部位: {r.pain_location.join('、')}</div>}
                            {r.triggers?.length > 0 && <div>トリガー: {r.triggers.join('、')}</div>}
                            {r.accompanying_symptoms?.length > 0 && <div>随伴症状: {r.accompanying_symptoms.join('、')}</div>}
                            <div>睡眠: {r.sleep_hours}h / ストレス: {r.stress_level}/5</div>
                            {r.daily_impact !== undefined && <div>日常への支障: {['なし', '軽度', '中度', '重度'][r.daily_impact] || '-'}</div>}
                            {r.med_effect && <div>薬の効果: {r.med_effect}</div>}
                          </div>
                          {r.memo && (
                            <p className="mt-2 text-xs text-gray-500 bg-white rounded p-2">{r.memo}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-gray-100">
      <th className="text-left py-2.5 px-3 text-gray-500 font-medium bg-gray-50/50 w-[30%] align-top">{label}</th>
      <td className="py-2.5 px-3 text-gray-800">{value}</td>
    </tr>
  )
}
