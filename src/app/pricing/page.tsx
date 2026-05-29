import { ArrowRight, BadgeCheck, CheckCircle2, MessageCircle, Users } from "lucide-react";
import { PublicFooter } from "@/components/PublicFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ButtonLink, Card, PageShell, StatusPill, cn } from "@/components/ui";
import { commonCopy, getLanguageFromSearchParams, type Language, type SearchParamsLike, withLanguage } from "@/lib/i18n";
import { planOrder, plans, type PlanLimit } from "@/lib/plans";

const copy = {
  en: {
    label: "Plans",
    title: "Start small, then keep event proof records running.",
    intro:
      "ProofPass helps organizers keep event participation, speaking, and contribution as shareable proof pages. Small events can try it for free during the pilot. For ongoing organizers, ProofPass will expand proof capacity, management features, and community-level achievement pages.",
    pilotNote: "ProofPass is currently in pilot. Payment and billing are not implemented yet.",
    freeCta: "Create an event",
    contactCta: "Discuss ongoing or community use",
    limits: {
      events: "Events",
      proofs: "Proofs per event",
      members: "Organizer members",
      custom: "Custom"
    },
    features: "Included direction",
    recommendedFor: "Recommended for",
    operationsTitle: "Built as a proof layer after events",
    operationsText:
      "ProofPass is not a full event management suite. It focuses on the proof layer that remains after check-in, speaking, contribution, learning, and organizer confirmation."
  },
  ja: {
    label: "プラン",
    title: "イベント証明を、小さく始めて継続運用へ",
    intro:
      "ProofPassは、イベント参加・登壇・貢献を共有できる証明として残すサービスです。小規模イベントは無料で試せます。継続的にイベントを運営する主催者向けに、証明数・管理機能・コミュニティ単位の実績ページを拡張していきます。",
    pilotNote: "ProofPassは現在パイロット段階です。決済や請求機能はまだ実装していません。",
    freeCta: "イベントを作成する",
    contactCta: "継続利用・コミュニティ利用について相談する",
    limits: {
      events: "イベント数",
      proofs: "各イベントの証明数",
      members: "主催者アカウント",
      custom: "個別相談"
    },
    features: "拡張予定・利用範囲",
    recommendedFor: "向いている利用",
    operationsTitle: "イベント後に残る証明レイヤーとして",
    operationsText:
      "ProofPassはイベント管理そのものではなく、チェックイン・登壇・貢献・学習活動・主催者確認のあとに残る証明レイヤーに集中します。"
  }
} satisfies Record<Language, {
  label: string;
  title: string;
  intro: string;
  pilotNote: string;
  freeCta: string;
  contactCta: string;
  limits: {
    events: string;
    proofs: string;
    members: string;
    custom: string;
  };
  features: string;
  recommendedFor: string;
  operationsTitle: string;
  operationsText: string;
}>;

function formatLimit(lang: Language, value: PlanLimit) {
  if (value === "custom") {
    return copy[lang].limits.custom;
  }

  return value.toLocaleString(lang === "ja" ? "ja-JP" : "en-US");
}

export default async function PricingPage({
  searchParams
}: {
  searchParams: Promise<SearchParamsLike>;
}) {
  const lang = getLanguageFromSearchParams(await searchParams);
  const t = copy[lang];
  const common = commonCopy[lang];

  return (
    <PageShell className="space-y-10">
      <SiteHeader lang={lang} />

      <section className="grid gap-7 lg:grid-cols-[1fr_0.72fr] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-mint">{t.label}</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold leading-tight text-ink sm:text-4xl [word-break:keep-all]">
            {t.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-700">{t.intro}</p>
        </div>
        <Card className="border-cyan-200 bg-cyan-50/55 p-5 shadow-none">
          <div className="flex items-start gap-3">
            <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700" />
            <p className="text-sm font-semibold leading-6 text-cyan-950">{t.pilotNote}</p>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-4" aria-label={t.label}>
        {planOrder.map((planKey) => {
          const plan = plans[planKey];
          const featured = plan.key === "organizer_pro";

          return (
            <Card
              key={plan.key}
              className={cn(
                "flex flex-col p-5",
                featured ? "border-mint/50 shadow-lift" : "shadow-soft"
              )}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xl font-bold text-ink">{plan.name[lang]}</h2>
                  {featured ? <StatusPill tone="success">{common.walletFree}</StatusPill> : null}
                </div>
                <p className="min-h-16 text-sm leading-6 text-slate-700">{plan.description[lang]}</p>
                <p className="text-lg font-bold text-ink">{plan.monthlyPriceLabel[lang]}</p>
              </div>

              <dl className="mt-5 grid gap-2 text-sm">
                <div className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2">
                  <dt className="text-slate-600">{t.limits.events}</dt>
                  <dd className="font-bold text-ink">{formatLimit(lang, plan.eventLimit)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2">
                  <dt className="text-slate-600">{t.limits.proofs}</dt>
                  <dd className="font-bold text-ink">{formatLimit(lang, plan.proofLimitPerEvent)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2">
                  <dt className="text-slate-600">{t.limits.members}</dt>
                  <dd className="font-bold text-ink">{formatLimit(lang, plan.memberLimit)}</dd>
                </div>
              </dl>

              <div className="mt-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t.features}</p>
                <ul className="space-y-2 text-sm leading-6 text-slate-700">
                  {plan.features[lang].map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-mint" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t.recommendedFor}</p>
                <div className="flex flex-wrap gap-2">
                  {plan.recommendedFor[lang].map((item) => (
                    <StatusPill key={item} tone="neutral">
                      {item}
                    </StatusPill>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      <Card className="border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="rounded-lg bg-mint/10 p-3 text-mint">
              <BadgeCheck className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-ink">{t.operationsTitle}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{t.operationsText}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={withLanguage("/admin/events/new", lang)} variant="secondary">
              <Users className="h-4 w-4" />
              {t.freeCta}
            </ButtonLink>
            <ButtonLink href={withLanguage("/contact", lang)}>
              {t.contactCta}
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </Card>

      <PublicFooter lang={lang} />
    </PageShell>
  );
}
