import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "頭痛タイプチェック | 三宮元町鍼灸整体院C-cure",
  description:
    "10の質問に答えるだけで、あなたの頭痛タイプと最適なケア方法がわかります。三宮元町鍼灸整体院C-cure",
  openGraph: {
    title: "頭痛タイプチェック | 三宮元町鍼灸整体院C-cure",
    description:
      "10の質問に答えるだけで、あなたの頭痛タイプと最適なケア方法がわかります。",
  },
};

export default function DiagnosisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
