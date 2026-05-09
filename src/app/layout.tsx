import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProofPass Earn",
  description:
    "Off-chain proof and contribution tracking for research events, study groups, hackathons, and technical communities."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
