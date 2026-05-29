import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProofPass",
  description:
    "ProofPassは、イベント参加・登壇・貢献を、共有できる証明ページとして発行できるサービスです。参加者はウォレット不要で使えます。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
