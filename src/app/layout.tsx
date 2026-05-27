import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProofPass",
  description:
    "Trusted public proof pages and Proof Cards for event participation, speaking, contribution, and learning activity."
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
