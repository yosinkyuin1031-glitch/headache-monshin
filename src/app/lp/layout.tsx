import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "頭痛専門アプリ3点セット | OGUCHI HEALTHCARE",
  description:
    "問診票・診断・ダイアリーの3つで頭痛患者の見える化を実現。月額3,980円で頭痛患者のリピート率を改善。",
  openGraph: {
    title: "頭痛専門アプリ3点セット | OGUCHI HEALTHCARE",
    description:
      "問診票・診断・ダイアリーの3つで頭痛患者の見える化を実現。月額3,980円で頭痛患者のリピート率を改善。",
  },
};

export default function LPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
