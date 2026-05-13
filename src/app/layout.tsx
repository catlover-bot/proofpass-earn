import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProofPass",
  description:
    "Wallet-free proof pages and NFT/SBT-style event proof records for research events, study groups, hackathons, and technical communities."
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
