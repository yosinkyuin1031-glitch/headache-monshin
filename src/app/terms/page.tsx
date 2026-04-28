import Link from 'next/link'

export const metadata = {
  title: '利用規約 | 頭痛問診票',
}

export default function TermsPage() {
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
          <h1 className="text-2xl font-bold text-[#14252A] mb-2">利用規約</h1>
          <p className="text-sm text-gray-500 mb-8">制定日: 2026年4月1日 / 最終改定日: 2026年4月22日</p>

          <div className="space-y-8 text-sm leading-relaxed text-gray-700">
            <p>
              本規約は、大口神経整体院（以下「当社」といいます）が提供する頭痛専用問診票サービス「頭痛問診票」（以下「本サービス」といいます）の利用条件を定めるものです。本サービスを導入する治療院・整骨院・鍼灸院等の事業者（以下「契約者」といいます）および契約者を通じて本サービスを利用する患者等のエンドユーザーは、本規約および別途定めるプライバシーポリシーに同意のうえ、本サービスを利用するものとします。
            </p>

            <section>
              <h2 className="text-base font-bold text-[#14252A] mb-2">第1条（定義）</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>「本サービス」とは、当社が提供するクラウド型頭痛記録・管理サービスをいいます。</li>
                <li>「契約者」とは、本規約に同意のうえ本サービスの利用契約を締結した治療院等をいいます。</li>
                <li>「アグリゲーター」とは、当社から本サービスの再頒布権を得て、自己の顧客（院）に本サービスを提供する事業者をいいます。</li>
                <li>「エンドユーザー」とは、契約者の患者であり、契約者を通じて本サービスの機能を利用する方をいいます。</li>
                <li>「エンドユーザーデータ」とは、エンドユーザーの頭痛記録、症状、服薬情報等（<span className="font-bold">個人情報保護法上の要配慮個人情報</span>を含む）をいいます。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#14252A] mb-2">第2条（アカウントと管理責任）</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>契約者は、正確な情報を登録し、自己の責任においてアカウントを管理するものとします。</li>
                <li>ログイン情報の管理不備により生じた損害について、当社は責任を負いません。</li>
                <li>不正アクセスまたはその兆候を認知した場合、契約者は速やかに当社（およびアグリゲーター経由の場合はアグリゲーター）に通知するものとします。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#14252A] mb-2">第3条（利用料金・最低契約期間）</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>利用料金はプランに準じ、Stripeを通じて毎月自動課金されます（税込）。</li>
                <li>月額プランの最低契約期間は<span className="font-bold">6ヶ月</span>とし、期間内に契約者都合で解約する場合、残存期間分の月額料金を早期解約金として一括請求します。</li>
                <li>一度解約したメールアドレス・事業者での再登録は、当社が認めた場合を除き原則として受け付けません。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#14252A] mb-2">第4条（エンドユーザーデータの取り扱いに関する特約）</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>エンドユーザーデータについて、契約者は個人情報保護法上の「個人情報取扱事業者」の地位に立ち、当社は契約者から委託を受けてこれを取り扱う「委託先」の地位に立ちます。</li>
                <li>契約者は、エンドユーザーから頭痛記録・服薬情報等の<span className="font-bold">要配慮個人情報</span>の取得・利用・当社への委託について明示的な同意を取得する責任を負います。</li>
                <li>本サービスは医療行為・診断行為ではなく、記録は参考情報です。医学的判断・診断は契約者または医師の責任において行うものとします。</li>
                <li>当社は、委託されたエンドユーザーデータを本サービスの提供目的以外に利用しません。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#14252A] mb-2">第5条（安全管理措置）</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>SSL/TLSによる通信経路の暗号化</li>
                <li>Supabase Row Level Security による契約者ごとのデータ分離</li>
                <li>パスワードのbcryptハッシュ化保存</li>
                <li>データベースの国内リージョン（東京）での保管</li>
                <li>役割ベースアクセス制御（RBAC）およびアクセスログの記録</li>
                <li>決済カード情報はStripeに直接送信（PCI DSS Level 1準拠）</li>
                <li>ログイン失敗回数制限（ブルートフォース対策）</li>
                <li>業務委託先の選定および定期的なセキュリティレビュー</li>
              </ol>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#14252A] mb-2">第6条（漏洩等発生時の対応）</h2>
              <p>
                個人情報の漏洩等が発生した場合、当社は個人情報保護委員会への報告および影響を受ける契約者・エンドユーザーへの通知を、<span className="font-bold">事故認知後速やかに（原則72時間以内を目安に）</span>行います。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#14252A] mb-2">第7条（禁止事項・反社排除）</h2>
              <p>不正アクセス、データの二次利用・転売、他のアカウントの不正利用、本サービスの運営妨害、法令または公序良俗違反、反社会的勢力に該当する行為またはこれを利用する行為、リバースエンジニアリング等を禁止します。契約者は自己および役員・従業員等が反社会的勢力に該当しないことを表明・保証します。</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#14252A] mb-2">第8条（免責・損害賠償の上限）</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>当社の責に帰すべき事由により契約者に損害が発生した場合、当社の損害賠償責任は、故意または重大な過失がある場合を除き、<span className="font-bold">損害発生時点から遡って直近3ヶ月間に契約者が当社に現実に支払った利用料金の総額を上限</span>とし、逸失利益・間接損害等については責任を負いません。</li>
                <li>本サービスは医療行為・診断行為ではなく、医学的判断・施術判断の責任は一切負いません。</li>
                <li>契約者は自己の責任においてデータをエクスポート・バックアップするものとします。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#14252A] mb-2">第9条（規約の変更・準拠法）</h2>
              <p>当社は民法第548条の4の規定に基づき必要に応じて本規約を変更することがあります。本規約は日本法に準拠し、本サービスに関する紛争は当社所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。</p>
            </section>

            <section className="border-t pt-6 mt-6">
              <h2 className="text-base font-bold text-[#14252A] mb-2">運営者情報</h2>
              <p>大口神経整体院 / 代表 大口 陽平 / お問い合わせ: ooguchi.seitai@gmail.com</p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t flex flex-wrap gap-4 text-sm">
            <Link href="/privacy" className="text-blue-600 hover:underline">プライバシーポリシー</Link>
            <Link href="/" className="text-blue-600 hover:underline">トップ</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
