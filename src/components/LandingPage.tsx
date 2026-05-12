import Link from "next/link";
import { ArrowRight, BadgeCheck, ClipboardCheck, EyeOff, Layers3, Link2, QrCode, Users } from "lucide-react";
import { PublicFooter } from "@/components/PublicFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ButtonLink, Card, PageShell, StatusPill } from "@/components/ui";
import { commonCopy, type Language, withLanguage } from "@/lib/i18n";

const demoProofHref = "/cert/proof_xZ0Nb0iY9yMUf1";

const copy = {
  en: {
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
      status: "Public URL ready",
      participantLabel: "Participant",
      proofTypeLabel: "Proof type",
      proofUrlLabel: "Proof URL"
    },
    stepsLabel: "How it works",
    steps: ["Create an event", "Share the QR code", "Issue proof pages"],
    whoLabel: "Who it is for",
    whoTitle: "Built for practical community formats.",
    audiences: ["Research events", "Study groups", "Hackathons", "Community meetups", "Internal workshops"],
    proofLabel: "Proof types",
    proofTitle: "Recognize the roles that make events work.",
    proofTypes: ["Attendee", "Speaker", "Contributor", "Organizer"],
    proofTypeBody: "Record this role as a public proof page.",
    whyLabel: "Why use this?",
    whyTitle: "Useful proof, without extra participant work.",
    reasons: [
      "Replace manual attendance lists",
      "Give participants a shareable proof URL",
      "Keep participant email off public pages",
      "Prepare for future badge and SBT experiments"
    ],
    advanced: {
      label: "Advanced",
      heading: "Advanced proof infrastructure, when your community needs it",
      body:
        "ProofPass starts as a wallet-free proof page. For pilots, the same proof can expose structured metadata and optional Base Sepolia testnet SBT records."
    },
    badges: ["Wallet-free", "Public proof URL", "Email hidden on public pages", "Optional testnet SBT"]
  },
  ja: {
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
      role: "登壇証明",
      status: "公開URL発行済み",
      participantLabel: "参加者",
      proofTypeLabel: "証明タイプ",
      proofUrlLabel: "証明URL"
    },
    stepsLabel: "使い方",
    steps: ["イベントを作成", "QRコードを共有", "参加証明ページを発行"],
    whoLabel: "対象イベント",
    whoTitle: "研究・学習・コミュニティの現場で使いやすい形です。",
    audiences: ["研究会", "勉強会", "ハッカソン", "コミュニティイベント", "社内ワークショップ"],
    proofLabel: "証明タイプ",
    proofTitle: "イベントを支える役割を証明として残せます。",
    proofTypes: ["参加者", "登壇者", "貢献者", "主催者"],
    proofTypeBody: "この役割を公開参加証明として記録します。",
    whyLabel: "使う理由",
    whyTitle: "参加者に余計な手間を増やさず、イベント後にも残る証明を発行できます。",
    reasons: [
      "手作業の参加者リストを減らす",
      "参加者に共有できる証明URLを渡せる",
      "公開ページにメールアドレスを表示しない",
      "将来のバッジやSBT実験に拡張できる"
    ],
    advanced: {
      label: "高度な証明",
      heading: "必要に応じて拡張できる証明インフラ",
      body:
        "ProofPassはまずウォレット不要の証明ページとして使えます。実証では、同じ証明を構造化メタデータやBase Sepolia上のテストネットSBT記録に拡張できます。"
    },
    badges: ["ウォレット不要", "公開証明URL", "メール非公開", "任意のテストネットSBT"]
  }
} as const satisfies Record<Language, object>;

const stepIcons = [BadgeCheck, QrCode, Link2];
const reasonIcons = [ClipboardCheck, Link2, EyeOff, Layers3];

export function LandingPage({ lang }: { lang: Language }) {
  const t = copy[lang];
  const common = commonCopy[lang];

  return (
    <PageShell className="space-y-14 py-7 sm:space-y-16 sm:py-10">
      <SiteHeader lang={lang} />

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
            <ButtonLink href={withLanguage("/admin/events/new", lang)}>
              {t.hero.primary}
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href={withLanguage(demoProofHref, lang)} variant="secondary">
              {t.hero.secondary}
            </ButtonLink>
            <Link
              href={withLanguage("/web3-roadmap", lang)}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-mint hover:text-ink"
            >
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
                <p className="text-sm font-semibold text-slate-500">{t.preview.participantLabel}</p>
                <p className="mt-1 text-xl font-bold text-ink">{t.preview.participant}</p>
              </div>
              <StatusPill tone="success">{common.valid}</StatusPill>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-paper p-4">
                <p className="text-sm font-semibold text-slate-500">{t.preview.proofTypeLabel}</p>
                <p className="mt-1 font-bold text-ink">{t.preview.role}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-paper p-4">
                <p className="text-sm font-semibold text-slate-500">{common.status}</p>
                <p className="mt-1 font-bold text-ink">{t.preview.status}</p>
              </div>
            </div>
            <div className="rounded-lg bg-ink p-4 text-white">
              <p className="text-sm font-semibold text-white/70">{t.preview.proofUrlLabel}</p>
              <p className="mt-2 break-all text-sm font-semibold">{demoProofHref}</p>
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

      <section className="grid gap-4 md:grid-cols-3" aria-label={t.stepsLabel}>
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
              <p className="mt-4 text-sm leading-6 text-slate-700">{t.proofTypeBody}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-soft">
        <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mint">{t.whyLabel}</p>
            <h2 className="mt-2 text-2xl font-bold text-ink">{t.whyTitle}</h2>
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
            <StatusPill tone="testnet">{t.advanced.label}</StatusPill>
            <h2 className="mt-3 text-2xl font-bold text-ink">{t.advanced.heading}</h2>
          </div>
          <p className="text-sm leading-7 text-slate-700">{t.advanced.body}</p>
        </div>
      </section>

      <PublicFooter lang={lang} />
    </PageShell>
  );
}
