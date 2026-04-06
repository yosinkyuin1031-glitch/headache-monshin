import {
  ClipboardList,
  Brain,
  BookOpen,
  TrendingUp,
  BarChart3,
  Shield,
  Clock,
  Check,
  ChevronDown,
  Sparkles,
  Smartphone,
  QrCode,
  Lock,
  MessageCircle,
} from "lucide-react";
import ContactForm from "./ContactForm";

/* ---------- helper ---------- */
function SectionHeading({
  sub,
  main,
}: {
  sub: string;
  main: string;
}) {
  return (
    <div className="text-center mb-12">
      <p className="text-teal-600 font-semibold tracking-wider text-sm uppercase mb-2">
        {sub}
      </p>
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
        {main}
      </h2>
      <div className="mt-4 mx-auto w-16 h-1 rounded-full bg-gradient-to-r from-teal-500 to-sky-500" />
    </div>
  );
}

/* ============================================================
   LP page (Server Component)
   ============================================================ */
export default function LPPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* ──────────────── HERO ──────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f2942] via-[#1a3a5c] to-[#1e4d6e]">
        {/* decorative blobs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-5 py-24 sm:py-32 text-center">
          <p className="inline-block bg-white/10 backdrop-blur text-teal-300 text-xs sm:text-sm font-semibold rounded-full px-4 py-1.5 mb-6 border border-teal-400/20">
            治療院向け 頭痛特化SaaS
          </p>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">
            頭痛患者の{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-sky-300">
              &ldquo;見える化&rdquo;
            </span>
            で、
            <br className="hidden sm:block" />
            リピート率が変わる。
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            頭痛専門アプリ3点セット
            <br />
            <span className="text-slate-400 text-base">
              問診票・診断・ダイアリー
            </span>
          </p>

          <a
            href="#pricing"
            className="mt-10 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg py-4 px-8 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-5 h-5" />
            月額3,980円で導入する
          </a>

          <p className="mt-4 text-sm text-slate-400">
            初月無料 / クレジットカード決済
          </p>
        </div>
      </section>

      {/* ──────────────── 3 APPS ──────────────── */}
      <section className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-5xl mx-auto px-5">
          <SectionHeading sub="Features" main="3つのアプリでトータルサポート" />

          <div className="grid md:grid-cols-3 gap-8">
            {/* WEB問診票 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-slate-100">
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white mb-5">
                <ClipboardList className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-slate-800">
                WEB問診票
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                来院前に頭痛の詳細を把握。紙の問診票より
                <strong className="text-teal-700">10倍詳しい情報</strong>
                が手に入る。施術の質が格段に上がります。
              </p>
            </div>

            {/* 頭痛タイプ診断 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-slate-100">
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 text-white mb-5">
                <Brain className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-slate-800">
                頭痛タイプ診断
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                片頭痛・緊張型・混合型・要注意型を
                <strong className="text-sky-700">自動判別</strong>
                。患者への説明が楽になり、信頼度が上がります。
              </p>
            </div>

            {/* 頭痛ダイアリー */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-slate-100">
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white mb-5">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-slate-800">
                頭痛ダイアリー
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                患者が毎日記録。トリガー・頻度・薬の効果を
                <strong className="text-indigo-700">可視化</strong>
                。通院継続の動機付けにつながります。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── こんな院におすすめ ──────────────── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-5">
          <SectionHeading
            sub="For You"
            main="こんな院におすすめです"
          />

          <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {[
              {
                icon: TrendingUp,
                text: "頭痛患者のリピート率を上げたい",
              },
              {
                icon: BarChart3,
                text: "施術の効果を数値で見せたい",
              },
              {
                icon: Shield,
                text: "他院との差別化を図りたい",
              },
              {
                icon: Clock,
                text: "問診の時間を短縮したい",
              },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-4 bg-teal-50/60 border border-teal-100 rounded-xl px-6 py-5"
              >
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-teal-600 text-white">
                  <item.icon className="w-5 h-5" />
                </div>
                <p className="text-slate-700 font-medium text-sm sm:text-base">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── PRICING ──────────────── */}
      <section id="pricing" className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-4xl mx-auto px-5">
          <SectionHeading sub="Pricing" main="シンプルな料金プラン" />

          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#1a3a5c] to-[#1e4d6e] px-8 py-6 text-center">
              <p className="text-teal-300 text-sm font-semibold mb-1">
                頭痛専門アプリ3点セット
              </p>
              <div className="flex items-baseline justify-center gap-1 text-white">
                <span className="text-xl">月額</span>
                <span className="text-5xl font-extrabold tracking-tight">
                  3,980
                </span>
                <span className="text-lg">円</span>
                <span className="text-slate-300 text-sm ml-1">
                  (税込)
                </span>
              </div>
            </div>

            <div className="px-8 py-8">
              <ul className="space-y-4">
                {[
                  "3つのアプリ全てセット",
                  "患者数・スタッフ数の制限なし",
                  "初月無料",
                  "いつでも解約OK",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Check className="w-4 h-4" />
                    </span>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#apply"
                className="mt-8 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Sparkles className="w-5 h-5" />
                今すぐ申し込む
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── APPLICATION FORM ──────────────── */}
      <section id="apply" className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-5">
          <SectionHeading sub="Apply" main="お申し込み" />
          <ContactForm />
        </div>
      </section>

      {/* ──────────────── FAQ ──────────────── */}
      <section className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-3xl mx-auto px-5">
          <SectionHeading sub="FAQ" main="よくあるご質問" />

          <div className="space-y-4">
            {[
              {
                icon: Smartphone,
                q: "スマホでも使えますか？",
                a: "はい。ブラウザで動作するWebアプリなので、スマホ・タブレット・PCすべてに対応しています。アプリのインストールは不要です。",
              },
              {
                icon: QrCode,
                q: "患者さんへの導入は簡単ですか？",
                a: "QRコードを渡すだけでOKです。患者さんはスマホで読み取って、そのまま問診やダイアリー入力を始められます。",
              },
              {
                icon: MessageCircle,
                q: "解約はいつでもできますか？",
                a: "はい、管理画面またはLINEからいつでも解約できます。最低契約期間はありません。",
              },
              {
                icon: Lock,
                q: "データのセキュリティは？",
                a: "SSL暗号化通信を採用し、国内サーバーで安全にデータを管理しています。患者情報は厳重に保護されます。",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <summary className="flex items-center gap-3 cursor-pointer px-6 py-5 text-slate-800 font-semibold hover:bg-slate-50 transition-colors list-none">
                  <item.icon className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="flex-1">{item.q}</span>
                  <ChevronDown className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-5 text-slate-600 text-sm leading-relaxed pl-14">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── FOOTER ──────────────── */}
      <footer className="bg-[#0f2942] text-slate-400 py-12">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <p className="text-white font-bold text-lg mb-1">
            大口神経整体院
          </p>
          <p className="text-sm text-slate-500 mb-6">OGUCHI HEALTHCARE</p>

          <div className="flex justify-center gap-6 text-sm">
            <a
              href="/tokusho"
              className="hover:text-white transition-colors"
            >
              特定商取引法に基づく表記
            </a>
            <a
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              プライバシーポリシー
            </a>
          </div>

          <p className="mt-8 text-xs text-slate-600">
            &copy; {new Date().getFullYear()} OGUCHI HEALTHCARE. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
