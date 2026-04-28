import Link from 'next/link'

export const metadata = {
  title: 'プライバシーポリシー | 頭痛問診票',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#14252A] text-white py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-gray-300 hover:text-white transition-colors">
            &larr; トップに戻る
          </Link>
          <span className="text-sm font-bold">頭痛問診票</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-10">
          <h1 className="text-2xl font-bold text-[#14252A] mb-2">プライバシーポリシー</h1>
          <p className="text-sm text-gray-500 mb-8">制定日: 2026年4月1日 / 最終改定日: 2026年4月22日</p>

          <div className="space-y-8 text-sm leading-relaxed text-gray-700">
            <p>
              大口神経整体院（以下「当社」といいます）は、頭痛専用問診票サービス「頭痛問診票」（以下「本サービス」といいます）における個人情報および要配慮個人情報の取扱いについて、個人情報の保護に関する法律（個人情報保護法）その他の関係法令を遵守し、以下のとおりプライバシーポリシーを定めます。
            </p>

            <section>
              <h2 className="text-base font-bold text-[#14252A] mb-2">第1条（収集する情報）</h2>
              <p><strong>1. 契約者（治療院）情報</strong>：メールアドレス、院名、担当者氏名、決済情報（Stripe経由・当社はカード情報を保持しません）、アクセスログ</p>
              <p className="mt-2"><strong>2. エンドユーザー（患者）情報</strong>：氏名・生年月日・頭痛発作日時・症状・トリガー・服薬情報等。これらは<span className="font-bold">個人情報保護法上の要配慮個人情報</span>を含みます。</p>
              <p className="mt-2 text-xs text-gray-500">※エンドユーザーデータは契約者が個人情報取扱事業者として適法に取得し、本サービスに入力するものです。当社は契約者から委託を受けた「委託先」の立場となります。</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#14252A] mb-2">第2条（利用目的）</h2>
              <p>本サービスの提供・運用・改善、料金請求・決済処理、サポート対応、不正利用検知、統計データ作成（個人を特定しない形式）、法令に基づく対応。</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#14252A] mb-2">第3条（業務委託先・第三者提供）</h2>
              <p>以下の業務委託先を利用しています（いずれも必要最小限の情報のみ委託）。</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><span className="font-medium">Supabase Inc.</span>（米国・データは東京リージョン保管）- DB・認証</li>
                <li><span className="font-medium">Stripe, Inc.</span>（米国・PCI DSS Level 1準拠）- 決済処理</li>
                <li><span className="font-medium">Vercel Inc.</span>（米国）- アプリケーションホスティング</li>
              </ul>
              <p className="mt-3">本人同意がある場合、法令に基づく場合、人の生命身体財産保護のため必要な場合を除き、第三者提供は行いません。</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#14252A] mb-2">第4条（安全管理措置）</h2>
              <div className="space-y-2 text-xs text-gray-600">
                <p><strong className="text-gray-700">技術的：</strong>SSL/TLS、Supabase RLSによる院ごとのデータ分離、bcryptハッシュ化、RBAC、ログイン失敗回数制限、アクセスログ記録</p>
                <p><strong className="text-gray-700">物理的・組織的：</strong>東京リージョン（日本国内）保管、自動バックアップ、アクセス権限の必要最小限化、定期セキュリティレビュー</p>
                <p><strong className="text-gray-700">人的：</strong>従業者教育・守秘義務の徹底</p>
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#14252A] mb-2">第5条（漏洩時の対応）</h2>
              <p>漏洩等が発生し個人の権利利益を害するおそれが大きい場合、個人情報保護委員会への報告および本人・契約者への通知を、<span className="font-bold">事故認知後速やかに（原則72時間以内を目安に）</span>行います。</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#14252A] mb-2">第6条（データ保存期間・開示請求）</h2>
              <p>アカウント情報は解約後30日以内、エンドユーザーデータは契約者が削除するまで、利用ログは最大1年間保存します。開示・訂正・削除・利用停止の請求は下記窓口までご連絡ください。エンドユーザーからの請求は一次窓口は契約者となり、当社は技術的に協力します。</p>
            </section>

            <section className="border-t pt-6 mt-6">
              <h2 className="text-base font-bold text-[#14252A] mb-2">お問い合わせ窓口</h2>
              <p>大口神経整体院 / 個人情報保護管理者：大口 陽平 / メール：ooguchi.seitai@gmail.com</p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t flex flex-wrap gap-4 text-sm">
            <Link href="/terms" className="text-blue-600 hover:underline">利用規約</Link>
            <Link href="/" className="text-blue-600 hover:underline">トップ</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
