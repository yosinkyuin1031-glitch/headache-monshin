"use client"

import { useState } from 'react'

// ---------- 設問データ ----------
interface Choice {
  label: string
  // スコア: [片頭痛, 緊張型, 要注意]
  score: [number, number, number]
}

interface Question {
  id: number
  text: string
  sub?: string
  choices: Choice[]
}

const questions: Question[] = [
  {
    id: 1,
    text: '頭痛はどのくらいの頻度で起こりますか？',
    choices: [
      { label: '月に1〜4回程度', score: [2, 0, 0] },
      { label: 'ほぼ毎日〜週に数回', score: [0, 2, 0] },
      { label: '突然、今までにない激しい頭痛が起きた', score: [0, 0, 3] },
      { label: '月に15日以上', score: [1, 1, 1] },
    ],
  },
  {
    id: 2,
    text: '頭痛の痛みはどんな感じですか？',
    choices: [
      { label: 'ズキズキ・脈打つような痛み', score: [3, 0, 0] },
      { label: '締め付けられるような重い痛み', score: [0, 3, 0] },
      { label: '目の奥をえぐられるような激痛', score: [0, 0, 2] },
      { label: 'ズキズキ＋締め付けの両方ある', score: [1, 1, 0] },
    ],
  },
  {
    id: 3,
    text: '頭痛のとき、吐き気はありますか？',
    choices: [
      { label: 'よくある', score: [3, 0, 0] },
      { label: 'たまにある', score: [1, 0, 0] },
      { label: 'ほとんどない', score: [0, 2, 0] },
      { label: '嘔吐を伴うことがある', score: [2, 0, 1] },
    ],
  },
  {
    id: 4,
    text: '光や音に敏感になりますか？',
    choices: [
      { label: '頭痛のとき、光や音がつらい', score: [3, 0, 0] },
      { label: '少し気になる程度', score: [1, 1, 0] },
      { label: '特に変わらない', score: [0, 2, 0] },
    ],
  },
  {
    id: 5,
    text: '頭痛が起きる前に、何か前兆はありますか？',
    sub: '（チカチカする光・視野の一部が見えにくい等）',
    choices: [
      { label: '視覚的な前兆がある', score: [3, 0, 0] },
      { label: '肩こり・首の張りが前兆', score: [1, 2, 0] },
      { label: '特に前兆はない', score: [0, 1, 0] },
      { label: '手足のしびれ・言葉が出にくくなる', score: [0, 0, 3] },
    ],
  },
  {
    id: 6,
    text: '頭痛はどのくらい続きますか？',
    choices: [
      { label: '4時間〜3日程度', score: [3, 0, 0] },
      { label: '30分〜数時間', score: [1, 2, 0] },
      { label: 'ほぼ一日中ダラダラ続く', score: [0, 3, 0] },
      { label: '数秒〜数分だが激烈', score: [0, 0, 2] },
    ],
  },
  {
    id: 7,
    text: '体を動かすと頭痛はどうなりますか？',
    choices: [
      { label: '動くと悪化する（階段・歩行など）', score: [3, 0, 0] },
      { label: '動いても変わらない', score: [0, 2, 0] },
      { label: '軽い運動で楽になることがある', score: [0, 2, 0] },
    ],
  },
  {
    id: 8,
    text: '痛みが出やすいのは頭のどの部分ですか？',
    choices: [
      { label: '片側（左右どちらか）', score: [3, 0, 0] },
      { label: '頭全体・両側', score: [0, 3, 0] },
      { label: '後頭部〜首筋', score: [0, 2, 0] },
      { label: '目の奥・こめかみの片側', score: [2, 0, 1] },
    ],
  },
  {
    id: 9,
    text: '以下に当てはまるものはありますか？',
    sub: '（複数ある場合は最も当てはまるものを選んでください）',
    choices: [
      { label: '天気・気圧の変化で悪化する', score: [2, 1, 0] },
      { label: 'ストレスや疲労で悪化する', score: [1, 2, 0] },
      { label: '生理前後に悪化する', score: [3, 0, 0] },
      { label: '最近、頭痛の頻度や強さが急に変わった', score: [0, 0, 3] },
    ],
  },
  {
    id: 10,
    text: '以下の症状はありますか？',
    sub: '（一つでも当てはまれば選んでください）',
    choices: [
      { label: '特にない', score: [1, 1, 0] },
      { label: '肩こり・眼精疲労がひどい', score: [0, 2, 0] },
      { label: '頭痛薬を月に10日以上使っている', score: [1, 1, 1] },
      { label: '発熱・意識がぼんやり・手足の麻痺を伴う', score: [0, 0, 5] },
    ],
  },
]

// ---------- 診断ロジック ----------
type DiagnosisType = 'migraine' | 'tension' | 'mixed' | 'warning'

interface DiagnosisResult {
  type: DiagnosisType
  title: string
  description: string
  features: string[]
  advice: string[]
  color: string
  bgColor: string
  borderColor: string
}

const diagnosisMap: Record<DiagnosisType, DiagnosisResult> = {
  migraine: {
    type: 'migraine',
    title: '片頭痛タイプ',
    description: 'あなたの頭痛は「片頭痛」の特徴が多く見られます。脳の血管や神経の過敏さが関係している可能性があります。',
    features: [
      'ズキズキと脈打つような痛み',
      '片側に痛みが出やすい',
      '動くと悪化しやすい',
      '光や音に敏感になる',
      '吐き気を伴うことがある',
    ],
    advice: [
      '暗く静かな場所で安静にする',
      '頭痛が起きたら早めに対処する',
      '規則正しい睡眠リズムを保つ',
      '頭痛の記録（頭痛ダイアリー）をつけるとパターンが見える',
      '神経整体で自律神経・筋緊張の調整が有効な場合が多い',
    ],
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    borderColor: '#ddd6fe',
  },
  tension: {
    type: 'tension',
    title: '緊張型頭痛タイプ',
    description: 'あなたの頭痛は「緊張型頭痛」の特徴が多く見られます。首や肩の筋肉の緊張、ストレスが大きく関わっている可能性があります。',
    features: [
      '締め付けられるような重い痛み',
      '頭全体や両側が痛む',
      '肩こり・首こりを伴う',
      '動いても悪化しにくい',
      'ストレスや疲労で悪化する',
    ],
    advice: [
      '長時間の同じ姿勢を避け、こまめにストレッチ',
      '首・肩周りの筋肉をほぐす',
      'ストレス管理（深呼吸・リラクゼーション）',
      'パソコン・スマホの使い方を見直す',
      '神経整体で首・肩の緊張を根本から整えることが効果的',
    ],
    color: '#0284c7',
    bgColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  mixed: {
    type: 'mixed',
    title: '混合型タイプ',
    description: '片頭痛と緊張型頭痛の両方の特徴が見られます。タイプによって対処法が異なるため、どちらの症状が出ているか見極めることが大切です。',
    features: [
      'ズキズキする痛みと締め付け感の両方がある',
      '日によって痛み方が違う',
      '肩こりもあるが、吐き気が出ることもある',
      'ストレスでも天気でも悪化する',
    ],
    advice: [
      '頭痛ダイアリーで痛みのパターンを記録するのが特に重要',
      'その日の頭痛タイプに合った対処をする',
      '生活習慣の総合的な見直し（睡眠・食事・運動）',
      '慢性化を防ぐため、早めの専門的なケアがおすすめ',
      '神経整体で自律神経と筋緊張の両方からアプローチが可能',
    ],
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  warning: {
    type: 'warning',
    title: '要注意タイプ',
    description: '回答内容に、専門医への相談をおすすめする項目が含まれています。まずは医師の診察を受けて、重大な原因がないか確認することが大切です。',
    features: [
      '今までにない激しい頭痛が突然起きた',
      '頭痛の頻度や強さが急に変わった',
      '手足のしびれ・言葉の出にくさがある',
      '発熱や意識の変調を伴う',
    ],
    advice: [
      '早めに脳神経外科・頭痛外来を受診してください',
      '「いつもと違う」頭痛は要注意のサインです',
      '医師の検査で問題がなければ、安心してケアに取り組めます',
      '検査後、神経整体で体の調整をすることで改善が期待できます',
    ],
    color: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
  },
}

function diagnose(answers: number[]): { type: DiagnosisType; scores: { migraine: number; tension: number; warning: number } } {
  let migraine = 0
  let tension = 0
  let warning = 0

  answers.forEach((choiceIdx, qIdx) => {
    const q = questions[qIdx]
    if (q && q.choices[choiceIdx]) {
      const [m, t, w] = q.choices[choiceIdx].score
      migraine += m
      tension += t
      warning += w
    }
  })

  // 要注意スコアが一定以上なら要注意
  if (warning >= 5) return { type: 'warning', scores: { migraine, tension, warning } }

  // 混合型判定
  const diff = Math.abs(migraine - tension)
  if (diff <= 4 && migraine >= 8 && tension >= 8) {
    return { type: 'mixed', scores: { migraine, tension, warning } }
  }

  if (migraine > tension) return { type: 'migraine', scores: { migraine, tension, warning } }
  return { type: 'tension', scores: { migraine, tension, warning } }
}

// ---------- コンポーネント ----------
export default function DiagnosisPage() {
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [saving, setSaving] = useState(false)

  const lineUrl = process.env.NEXT_PUBLIC_LINE_URL || 'https://lin.ee/example'

  const handleStart = () => {
    setStep('quiz')
    setCurrentQ(0)
    setAnswers([])
  }

  const handleAnswer = async (choiceIdx: number) => {
    const newAnswers = [...answers, choiceIdx]
    setAnswers(newAnswers)

    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1)
    } else {
      // 診断完了
      const { type, scores } = diagnose(newAnswers)
      const diagResult = diagnosisMap[type]
      setResult(diagResult)
      setStep('result')

      // Supabase に保存
      setSaving(true)
      try {
        await fetch('/api/diagnosis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            diagnosis_type: type,
            scores,
            answers: newAnswers.map((a, i) => ({
              question: questions[i].text,
              answer: questions[i].choices[a]?.label,
            })),
          }),
        })
      } catch {
        // 保存失敗しても診断結果は表示
      } finally {
        setSaving(false)
      }
    }
  }

  const handleBack = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1)
      setAnswers(answers.slice(0, -1))
    }
  }

  const handleRetry = () => {
    setStep('intro')
    setCurrentQ(0)
    setAnswers([])
    setResult(null)
  }

  const progress = questions.length > 0 ? ((currentQ + (step === 'result' ? 1 : 0)) / questions.length) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* ヘッダー */}
      <header className="bg-[#1a3a5c] text-white">
        <div className="max-w-lg mx-auto px-4 py-4 text-center">
          <h1 className="text-base font-bold">頭痛タイプ診断</h1>
          <p className="text-xs opacity-70 mt-0.5">三宮元町鍼灸整体院C-cure</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* === イントロ === */}
        {step === 'intro' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <div className="w-20 h-20 bg-[#e8f4fb] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-[#4a9eca]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#1a3a5c] mb-2">あなたの頭痛タイプは？</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                10の質問に答えるだけで、あなたの頭痛のタイプと<br />最適なケア方法がわかります。
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-[#4a9eca] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">1</div>
                <p className="text-sm text-gray-700">10問の質問に回答（約2分）</p>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-[#4a9eca] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">2</div>
                <p className="text-sm text-gray-700">あなたの頭痛タイプを判定</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#4a9eca] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">3</div>
                <p className="text-sm text-gray-700">タイプ別のアドバイスをお届け</p>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full bg-[#1a3a5c] hover:bg-[#2a5280] active:bg-[#0f2a45] text-white font-bold py-4 rounded-xl text-lg shadow-lg transition-all"
            >
              診断をはじめる
            </button>

            <p className="text-xs text-gray-400 text-center">
              ※この診断は医療行為ではありません。参考としてご利用ください。
            </p>
          </div>
        )}

        {/* === クイズ === */}
        {step === 'quiz' && (
          <div className="space-y-5">
            {/* プログレスバー */}
            <div className="bg-white rounded-full h-2 overflow-hidden shadow-sm">
              <div
                className="h-full bg-[#4a9eca] transition-all duration-500 ease-out rounded-full"
                style={{ width: `${(currentQ / questions.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              {currentQ + 1} / {questions.length} 問
            </p>

            {/* 質問カード */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-[#1a3a5c] text-white rounded-full text-sm font-bold">
                  {currentQ + 1}
                </span>
                <span className="text-xs text-gray-400">質問</span>
              </div>
              <h2 className="text-base font-bold text-[#1a3a5c] mb-1 leading-relaxed">
                {questions[currentQ].text}
              </h2>
              {questions[currentQ].sub && (
                <p className="text-xs text-gray-500 mb-4">{questions[currentQ].sub}</p>
              )}

              <div className="space-y-3 mt-5">
                {questions[currentQ].choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className="w-full text-left bg-gray-50 hover:bg-[#e8f4fb] active:bg-[#d0ebf7] border border-gray-200 hover:border-[#4a9eca] rounded-xl px-4 py-3.5 text-sm text-gray-800 transition-all"
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 戻るボタン */}
            {currentQ > 0 && (
              <button
                onClick={handleBack}
                className="w-full text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors"
              >
                ← 前の質問に戻る
              </button>
            )}
          </div>
        )}

        {/* === 結果 === */}
        {step === 'result' && result && (
          <div className="space-y-5">
            {/* プログレス完了 */}
            <div className="bg-white rounded-full h-2 overflow-hidden shadow-sm">
              <div className="h-full bg-[#2d8a4e] rounded-full" style={{ width: '100%' }} />
            </div>

            {/* 結果カード */}
            <div
              className="rounded-2xl shadow-sm overflow-hidden"
              style={{ backgroundColor: result.bgColor, borderColor: result.borderColor, borderWidth: 1 }}
            >
              <div className="px-6 py-6 text-center">
                <p className="text-xs text-gray-500 mb-2">あなたの頭痛タイプは…</p>
                <h2 className="text-2xl font-bold mb-3" style={{ color: result.color }}>
                  {result.title}
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {result.description}
                </p>
              </div>
            </div>

            {/* 特徴 */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-[#1a3a5c] mb-3">このタイプの特徴</h3>
              <ul className="space-y-2">
                {result.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0" style={{ backgroundColor: result.bgColor, color: result.color }}>
                      {i + 1}
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* アドバイス */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-[#1a3a5c] mb-3">おすすめのケア</h3>
              <ul className="space-y-2">
                {result.advice.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-[#2d8a4e] mt-0.5 shrink-0">✓</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            {/* LINE誘導 */}
            <div className="bg-[#06C755]/10 border border-[#06C755]/30 rounded-2xl p-5 text-center">
              <p className="text-sm font-bold text-gray-800 mb-2">
                頭痛でお悩みなら、まずはご相談ください
              </p>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                三宮元町鍼灸整体院C-cureでは、頭痛の根本原因にアプローチする神経整体を提供しています。
                LINEでお気軽にご相談いただけます。
              </p>
              <a
                href={lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#06C755] hover:bg-[#05b34c] active:bg-[#049a42] text-white font-bold px-8 py-3.5 rounded-xl text-base shadow-lg transition-all"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                LINEで無料相談する
              </a>
            </div>

            {/* もう一度 */}
            <button
              onClick={handleRetry}
              className="w-full text-gray-500 hover:text-gray-700 text-sm py-3 transition-colors"
            >
              もう一度診断する
            </button>

            {saving && (
              <p className="text-xs text-gray-400 text-center">結果を保存中...</p>
            )}

            <p className="text-xs text-gray-400 text-center pb-4">
              ※この診断は医療行為ではありません。症状が気になる場合は医療機関を受診してください。
            </p>
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="text-center text-xs text-gray-400 py-6">
        &copy; 三宮元町鍼灸整体院C-cure
      </footer>
    </div>
  )
}
