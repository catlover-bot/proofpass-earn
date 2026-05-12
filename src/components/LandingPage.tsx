"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BadgeCheck, ClipboardCheck, EyeOff, Layers3, Link2, QrCode, Users } from "lucide-react";
import { PublicFooter } from "@/components/PublicFooter";
import { ButtonLink, Card, PageShell, StatusPill, cn } from "@/components/ui";

type Language = "en" | "ja";

const copy = {
  en: {
    nav: {
      home: "Home",
      events: "Events",
      demo: "Demo proof",
      roadmap: "Web3 roadmap"
    },
    hero: {
      badge: "No wallet required",
      title: "QR check-in and proof pages for community events",
      subtitle:
        "Create an event, share a QR check-in, and issue public participation proofs without requiring participants to use a wallet.",
      primary: "Create an event",
      secondary: "View demo proof",
      roadmap: "How Web3 support works"
    },
    preview: {
      label: "Proof preview",
      event: "Research Systems Night",
      participant: "Mika Tanaka",
      role: "Speaker proof",
      url: "/cert/proof_xZ0Nb0iY9yMUf1"
    },
    stepsLabel: "How it works",
    steps: ["Create an event", "Share the QR code", "Issue proof pages"],
    whoLabel: "Who it is for",
    whoTitle: "Built for practical community formats.",
    audiences: ["Research events", "Study groups", "Hackathons", "Community meetups", "Internal workshops"],
    proofLabel: "Proof types",
    proofTitle: "Recognize the roles that make events work.",
    proofTypes: ["Attendee", "Speaker", "Contributor", "Organizer"],
    whyLabel: "Why use this?",
    reasons: [
      "Replace manual attendance lists",
      "Give participants a shareable proof URL",
      "Keep participant email off public pages",
      "Prepare for future badge and SBT experiments"
    ],
    advanced: {
      heading: "Advanced proof infrastructure, when your community needs it",
      body:
        "ProofPass starts as a wallet-free proof page. For pilots, the same proof can expose structured metadata and optional Base Sepolia testnet SBT records."
    },
    badges: ["Wallet-free", "Public proof URL", "Email hidden on public pages", "Optional testnet SBT"]
  },
  ja: {
    nav: {
      home: "ホーム",
      events: "イベント",
      demo: "デモ証明",
      roadmap: "Web3ロードマップ"
    },
    hero: {
      badge: "ウォレット不要",
      title: "コミュニティイベントのQRチェックインと参加証明",
      subtitle:
        "イベントを作成し、QRチェックインを共有するだけで、参加者に公開できる参加証明ページを発行できます。ウォレットは不要です。",
      primary: "イベントを作成する",
      secondary: "デモ証明を見る",
      roadmap: "Web3対応について"
    },
    preview: {
      label: "証明プレビュー",
      event: "Research Systems Night",
      participant: "Mika Tanaka",
      role: "登壇者の証明",
      url: "/cert/proof_xZ0Nb0iY9yMUf1"
    },
    stepsLabel: "使い方",
    steps: ["イベントを作成", "QRコードを共有", "参加証明ページを発行"],
    whoLabel: "対象イベント",
    whoTitle: "実際のコミュニティ運営に使いやすい形です。",
    audiences: ["研究会", "勉強会", "ハッカソン", "コミュニティイベント", "社内ワークショップ"],
    proofLabel: "証明タイプ",
    proofTitle: "イベントを支える役割を記録できます。",
    proofTypes: ["参加者", "登壇者", "貢献者", "主催者"],
    whyLabel: "使う理由",
    reasons: [
      "手作業の参加者リストを減らす",
      "参加者に共有できる証明URLを渡せる",
      "公開ページにメールアドレスを表示しない",
      "将来のバッジやSBT実験に拡張できる"
    ],
    advanced: {
      heading: "必要に応じて拡張できる証明インフラ",
      body:
        "ProofPassはまずウォレット不要の証明ページとして使えます。実証では、同じ証明を構造化メタデータやBase Sepolia上のテストネットSBT記録に拡張できます。"
    },
    badges: ["ウォレット不要", "公開証明URL", "メール非公開", "任意のテストネットSBT"]
  }
} satisfies Record<Language, object>;

const stepIcons = [BadgeCheck, QrCode, Link2];
const reasonIcons = [ClipboardCheck, Link2, EyeOff, Layers3];

export function LandingPage() {
  const [language, setLanguage] = useState<Language>("en");
  const t = copy[language];

  return (
    <PageShell className="space-y-14 py-7 sm:space-y-16 sm:py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-ink">
          <span className="rounded-lg bg-ink p-2 text-white">
            <BadgeCheck className="h-5 w-5" />
          </span>
          ProofPass Earn
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-700">
            <Link href="/" className="hover:text-ink">
              {t.nav.home}
            </Link>
            <Link href="/admin/events" className="hover:text-ink">
              {t.nav.events}
            </Link>
            <Link href="/cert/proof_xZ0Nb0iY9yMUf1" className="hover:text-ink">
              {t.nav.demo}
            </Link>
            <Link href="/web3-roadmap" className="hover:text-ink">
              {t.nav.roadmap}
            </Link>
          </nav>
          <div className="flex rounded-full border border-slate-200 bg-white p-1 text-xs font-bold shadow-sm" aria-label="Landing page language">
            {(["ja", "en"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setLanguage(option)}
                className={cn(
                  "min-h-8 rounded-full px-3 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
                  language === option ? "bg-ink text-white" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {option === "ja" ? "日本語" : "English"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="grid items-center gap-8 lg:grid-cols-[1.04fr_0.96fr]">
        <div className="space-y-7">
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="success">{t.hero.badge}</StatusPill>
            <StatusPill tone="info">{t.badges[1]}</StatusPill>
          </div>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal text-ink sm:text-5xl lg:text-6xl">
              {t.hero.title}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-700">{t.hero.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/admin/events/new">
              {t.hero.primary}
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/cert/proof_xZ0Nb0iY9yMUf1" variant="secondary">
              {t.hero.secondary}
            </ButtonLink>
            <Link href="/web3-roadmap" className="inline-flex min-h-11 items-center text-sm font-semibold text-mint hover:text-ink">
              {t.hero.roadmap}
            </Link>
          </div>
        </div>

        <Card className="overflow-hidden p-0 shadow-lift">
          <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
            <p className="text-sm font-semibold text-slate-500">{t.preview.label}</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">{t.preview.event}</h2>
          </div>
          <div className="space-y-5 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Participant</p>
                <p className="mt-1 text-xl font-bold text-ink">{t.preview.participant}</p>
              </div>
              <StatusPill tone="success">Valid</StatusPill>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-paper p-4">
                <p className="text-sm font-semibold text-slate-500">Proof type</p>
                <p className="mt-1 font-bold text-ink">{t.preview.role}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-paper p-4">
                <p className="text-sm font-semibold text-slate-500">Status</p>
                <p className="mt-1 font-bold text-ink">Public URL ready</p>
              </div>
            </div>
            <div className="rounded-lg bg-ink p-4 text-white">
              <p className="text-sm font-semibold text-white/70">Proof URL</p>
              <p className="mt-2 break-all text-sm font-semibold">{t.preview.url}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {t.badges.map((badge, index) => (
                <StatusPill key={badge} tone={index === 3 ? "testnet" : "neutral"}>
                  {badge}
                </StatusPill>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {t.steps.map((step, index) => {
          const Icon = stepIcons[index];
          return (
            <Card key={step} className="p-5">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-mint/10 text-mint">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold text-slate-500">{index + 1}</p>
              <h2 className="mt-1 text-xl font-bold text-ink">{step}</h2>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mint">{t.whoLabel}</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">{t.whoTitle}</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {t.audiences.map((audience) => (
            <div key={audience} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-soft">
              <Users className="h-5 w-5 text-mint" />
              <span className="text-sm font-bold text-slate-800">{audience}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mint">{t.proofLabel}</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">{t.proofTitle}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.proofTypes.map((type) => (
            <Card key={type} className="p-5">
              <StatusPill tone="success">{type}</StatusPill>
              <p className="mt-4 text-sm leading-6 text-slate-700">{language === "ja" ? "イベントでの役割を公開証明として残せます。" : "Record this role as a public proof page."}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-soft">
        <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mint">{t.whyLabel}</p>
            <h2 className="mt-2 text-2xl font-bold text-ink">
              {language === "ja" ? "イベント後にも残る証明を、かんたんに。" : "Useful proof, without extra participant work."}
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {t.reasons.map((reason, index) => {
              const Icon = reasonIcons[index];
              return (
                <div key={reason} className="rounded-xl border border-slate-200 bg-paper p-4">
                  <Icon className="h-5 w-5 text-mint" />
                  <p className="mt-3 text-sm font-bold leading-6 text-ink">{reason}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-violet-200/70 bg-white/90 p-6 shadow-soft">
        <div className="grid gap-5 md:grid-cols-[0.65fr_1.35fr]">
          <div>
            <StatusPill tone="testnet">Advanced</StatusPill>
            <h2 className="mt-3 text-2xl font-bold text-ink">{t.advanced.heading}</h2>
          </div>
          <p className="text-sm leading-7 text-slate-700">{t.advanced.body}</p>
        </div>
      </section>

      <PublicFooter />
    </PageShell>
  );
}
