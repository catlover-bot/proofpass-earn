import Link from "next/link";
import { ArrowRight, BadgeCheck, ClipboardCheck, EyeOff, Layers3, Link2, QrCode, Users } from "lucide-react";
import { AchievementBadgeList } from "@/components/AchievementBadgeList";
import { PublicFooter } from "@/components/PublicFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ButtonLink, Card, PageShell, StatusPill, cn } from "@/components/ui";
import { getAchievementCatalog } from "@/lib/achievements";
import { commonCopy, type Language, withLanguage } from "@/lib/i18n";

const demoProofHref = "/cert/proof_xZ0Nb0iY9yMUf1";

const copy = {
  en: {
    hero: {
      badge: "No wallet required",
      title: "Trusted Proof Cards for events and community activity",
      subtitle:
        "Create an event, share a QR check-in, and issue wallet-free public proof pages for attendance, speaking, contribution, and learning activity.",
      primary: "Create an event",
      secondary: "View demo proof",
      pilot: "Try public pilot",
      roadmap: "Proof roadmap"
    },
    preview: {
      label: "Proof collection preview",
      event: "Research Systems Night",
      participant: "Demo Participant",
      role: "Organizer-approved speaker proof",
      status: "Proof image ready",
      participantLabel: "Participant",
      proofTypeLabel: "Proof type",
      proofUrlLabel: "Proof URL"
    },
    stepsLabel: "How it works",
    steps: ["Create an event", "Share the QR code", "Issue proof pages"],
    whoLabel: "Who it is for",
    whoTitle: "Built for practical community formats.",
    audiences: ["Research events", "Study groups", "Hackathons", "Community meetups", "Internal workshops"],
    proofLabel: "Proof labels",
    proofTitle: "Issue proof records for the activity that makes events work.",
    whyLabel: "Why use this?",
    whyTitle: "Useful proof, without extra participant work.",
    reasons: [
      "Replace manual attendance lists",
      "Give participants a proof collection URL",
      "Keep participant email off public pages",
      "Keep stronger labels organizer-approved"
    ],
    collection: {
      label: "Proof collection",
      heading: "Public proof cards first",
      body:
        "A participant can share Proof Cards and public proof pages while staying wallet-free by default. Stronger labels are added only after organizer approval."
    },
    advanced: {
      label: "Optional extension",
      heading: "Proof infrastructure that can grow with your community",
      body:
        "ProofPass starts as a wallet-free proof page. For advanced pilots, organizer-approved or evidence-verified proofs can later support structured metadata and optional SBT/NFT extensions."
    },
    badges: ["Wallet-free", "Public proof page", "Email hidden on public pages", "Optional SBT/NFT extension"]
  },
  ja: {
    hero: {
      badge: "ウォレット不要",
      title: "イベント参加・活動を信頼できるProof Cardに",
      subtitle:
        "イベントを作成し、QRチェックインを共有するだけで、参加証明・登壇証明・貢献証明・学習活動の公開証明ページをウォレット不要で発行できます。",
      primary: "イベントを作成する",
      secondary: "デモ証明を見る",
      pilot: "公開パイロットを試す",
      roadmap: "証明ロードマップ"
    },
    preview: {
      label: "証明カードプレビュー",
      event: "Research Systems Night",
      participant: "デモ参加者",
      role: "主催者承認済みの登壇証明",
      status: "証明画像準備済み",
      participantLabel: "参加者",
      proofTypeLabel: "証明タイプ",
      proofUrlLabel: "証明URL"
    },
    stepsLabel: "使い方",
    steps: ["イベントを作成", "QRコードを共有", "参加証明ページを発行"],
    whoLabel: "対象イベント",
    whoTitle: "研究・学習・コミュニティの現場で使いやすい形です。",
    audiences: ["研究会", "勉強会", "ハッカソン", "コミュニティイベント", "社内ワークショップ"],
    proofLabel: "証明ラベル",
    proofTitle: "イベントを支える活動を証明記録として残せます。",
    whyLabel: "使う理由",
    whyTitle: "参加者に余計な手間を増やさず、イベント後にも残る証明を発行できます。",
    reasons: [
      "手作業の参加者リストを減らす",
      "参加者に証明コレクションURLを渡せる",
      "公開ページにメールアドレスを表示しない",
      "強いラベルは主催者承認後に付与できる"
    ],
    collection: {
      label: "証明コレクション",
      heading: "まずはウォレット不要の公開証明カード",
      body:
        "参加者はProof Cardと公開証明ページをウォレット不要で共有できます。登壇・貢献などの強いラベルは、主催者承認後に追加されます。"
    },
    advanced: {
      label: "任意の拡張",
      heading: "必要に応じて拡張できる証明インフラ",
      body:
        "ProofPassはまずウォレット不要の証明ページとして使えます。主催者承認済み・提出物確認済みの証明は、将来的に構造化メタデータや任意のSBT/NFT化へ拡張できます。"
    },
    badges: ["ウォレット不要", "公開証明ページ", "メール非公開", "任意のSBT/NFT拡張"]
  }
} as const satisfies Record<Language, object>;

const stepIcons = [BadgeCheck, QrCode, Link2];
const reasonIcons = [ClipboardCheck, Link2, EyeOff, Layers3];

function LandingHeroTitle({ lang, title }: { lang: Language; title: string }) {
  if (lang === "ja") {
    return (
      <>
        <span className="inline-block">イベント参加・活動を</span>
        <span className="inline-block">信頼できる</span>
        <span className="inline-block whitespace-nowrap">Proof Cardに</span>
      </>
    );
  }

  return title;
}

export function LandingPage({ lang }: { lang: Language }) {
  const t = copy[lang];
  const common = commonCopy[lang];
  const achievementCatalog = getAchievementCatalog(lang);

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
            <h1
              className={cn(
                "font-bold leading-[1.08] tracking-normal text-ink",
                lang === "ja"
                  ? "max-w-[42rem] text-[2.35rem] [word-break:keep-all] sm:text-[2.7rem] lg:text-[3.05rem] xl:text-[3.2rem]"
                  : "max-w-3xl text-4xl sm:text-[2.8rem] lg:text-[3.35rem] xl:text-[3.55rem]"
              )}
            >
              <LandingHeroTitle lang={lang} title={t.hero.title} />
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
            <ButtonLink href={withLanguage("/pilot", lang)} variant="subtle">
              {t.hero.pilot}
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
              <AchievementBadgeList badges={achievementCatalog.slice(1, 6)} />
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievementCatalog.map((badge) => (
            <Card key={badge.key} className="p-5">
              <AchievementBadgeList badges={[badge]} />
              <p className="mt-4 text-sm leading-6 text-slate-700">{badge.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-cyan-200 bg-white/95 p-6 shadow-soft">
        <div className="grid gap-5 md:grid-cols-[0.65fr_1.35fr]">
          <div>
            <StatusPill tone="info">{t.collection.label}</StatusPill>
            <h2 className="mt-3 text-2xl font-bold text-ink">{t.collection.heading}</h2>
          </div>
          <p className="text-sm leading-7 text-slate-700">{t.collection.body}</p>
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
