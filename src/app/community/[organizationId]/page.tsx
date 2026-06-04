import Link from "next/link";
import {
  Award,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  LinkIcon,
  ShieldCheck,
  Users
} from "lucide-react";
import { PublicFooter } from "@/components/PublicFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SetupError } from "@/components/SetupError";
import { Card, PageShell, StatusPill } from "@/components/ui";
import { getAchievementBadge } from "@/lib/achievements";
import {
  COMMUNITY_PROOF_LABEL_KEYS,
  getCommunityAchievements,
  type CommunityProofLabelKey
} from "@/lib/community-stats";
import { formatDate, formatDateTime } from "@/lib/format";
import { commonCopy, getLanguageFromSearchParams, type Language, type SearchParamsLike, withLanguage } from "@/lib/i18n";
import { labelProofType, labelVerificationLevel } from "@/lib/proof-types";
import { getMissingEnv, getSupabaseClient } from "@/lib/supabase/client";
import { isValidUuid } from "@/lib/validation/uuid";

export const dynamic = "force-dynamic";

const copy = {
  en: {
    pageTitle: "Community Achievements",
    hero:
      "Event participation, speaking, and contribution records collected as shared community achievements.",
    description:
      "This page summarizes event participation and organizer-confirmed activities in this community.",
    notFoundTitle: "Community page not found",
    notFoundText: "This community achievements URL does not match a public community page.",
    unableTitle: "Unable to load community achievements",
    invalidTitle: "Invalid community id",
    invalidText: "Open this page from the organizer dashboard or check the community URL.",
    emptyState:
      "No public achievements are available yet. Create events and issue participation proofs, and they will appear here.",
    stats: {
      events: "Events held",
      participants: "Check-ins",
      proofs: "Issued proofs",
      organizerConfirmed: "Organizer-confirmed proofs",
      qrConfirmed: "QR check-in proofs"
    },
    sections: {
      labelBreakdown: "Proof label breakdown",
      recentEvents: "Recent events",
      recentProofs: "Recent proofs",
      activity: "Community activity records"
    },
    eventParticipants: "participants",
    eventProofs: "issued proofs",
    publicCheckin: "Open check-in page",
    inviteOnly: "Invite-only",
    noRecentEvents: "No recent events yet.",
    noRecentProofs: "No public proofs yet.",
    proofLabel: "Proof label",
    verification: "Verification",
    openProof: "Open proof"
  },
  ja: {
    pageTitle: "コミュニティ実績",
    hero: "イベントでの参加・登壇・貢献を、コミュニティの実績として蓄積します。",
    description:
      "このページでは、コミュニティ内で発行された参加証明・登壇証明・貢献証明を集計し、活動の積み重ねを確認できます。",
    notFoundTitle: "コミュニティ実績ページが見つかりません",
    notFoundText: "このURLに一致する公開コミュニティページはありません。",
    unableTitle: "コミュニティ実績を読み込めません",
    invalidTitle: "コミュニティIDが無効です",
    invalidText: "管理画面から開くか、コミュニティURLを確認してください。",
    emptyState:
      "まだ公開できる実績はありません。イベントを作成し、参加証明を発行するとここに表示されます。",
    stats: {
      events: "開催イベント",
      participants: "参加確認",
      proofs: "発行済み証明",
      organizerConfirmed: "主催者が確認済み",
      qrConfirmed: "QRで参加確認済み"
    },
    sections: {
      labelBreakdown: "証明ラベルの内訳",
      recentEvents: "最近のイベント",
      recentProofs: "最近の証明",
      activity: "コミュニティで蓄積された活動"
    },
    eventParticipants: "参加者",
    eventProofs: "発行済み証明",
    publicCheckin: "チェックインページを見る",
    inviteOnly: "招待制",
    noRecentEvents: "最近のイベントはまだありません。",
    noRecentProofs: "公開できる証明はまだありません。",
    proofLabel: "証明ラベル",
    verification: "確認方法",
    openProof: "証明を見る"
  }
} satisfies Record<Language, {
  pageTitle: string;
  hero: string;
  description: string;
  notFoundTitle: string;
  notFoundText: string;
  unableTitle: string;
  invalidTitle: string;
  invalidText: string;
  emptyState: string;
  stats: {
    events: string;
    participants: string;
    proofs: string;
    organizerConfirmed: string;
    qrConfirmed: string;
  };
  sections: {
    labelBreakdown: string;
    recentEvents: string;
    recentProofs: string;
    activity: string;
  };
  eventParticipants: string;
  eventProofs: string;
  publicCheckin: string;
  inviteOnly: string;
  noRecentEvents: string;
  noRecentProofs: string;
  proofLabel: string;
  verification: string;
  openProof: string;
}>;

function labelForCommunityProof(lang: Language, key: CommunityProofLabelKey) {
  if (key === "participation") {
    return getAchievementBadge(lang, "attendance").label;
  }

  return getAchievementBadge(lang, key).label;
}

function formatNumber(lang: Language, value: number) {
  return value.toLocaleString(lang === "ja" ? "ja-JP" : "en-US");
}

export default async function CommunityAchievementsPage({
  params,
  searchParams
}: {
  params: Promise<{ organizationId: string }>;
  searchParams: Promise<SearchParamsLike>;
}) {
  const { organizationId } = await params;
  const lang = getLanguageFromSearchParams(await searchParams);
  const t = copy[lang];
  const common = commonCopy[lang];

  if (!isValidUuid(organizationId)) {
    return (
      <PageShell className="space-y-8">
        <SiteHeader lang={lang} />
        <Card>
          <h1 className="text-2xl font-bold text-ink">{t.invalidTitle}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-700">{t.invalidText}</p>
        </Card>
        <PublicFooter lang={lang} />
      </PageShell>
    );
  }

  const missing = getMissingEnv();
  if (missing.length > 0) {
    return (
      <PageShell className="space-y-8">
        <SiteHeader lang={lang} />
        <SetupError missing={missing} />
        <PublicFooter lang={lang} />
      </PageShell>
    );
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return (
      <PageShell className="space-y-8">
        <SiteHeader lang={lang} />
        <SetupError message="Supabase is not configured yet." />
        <PublicFooter lang={lang} />
      </PageShell>
    );
  }

  const { data: community, error, publicViewsMissing } = await getCommunityAchievements(supabase, organizationId);

  if (error) {
    const message = publicViewsMissing
      ? `${error.message} Run supabase/community-public-views.sql if RLS blocks direct public table reads.`
      : error.message;

    return (
      <PageShell className="space-y-8">
        <SiteHeader lang={lang} />
        <SetupError title={t.unableTitle} message={message} />
        <PublicFooter lang={lang} />
      </PageShell>
    );
  }

  if (!community) {
    return (
      <PageShell className="space-y-8">
        <SiteHeader lang={lang} />
        <Card>
          <h1 className="text-2xl font-bold text-ink">{t.notFoundTitle}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-700">{t.notFoundText}</p>
        </Card>
        <PublicFooter lang={lang} />
      </PageShell>
    );
  }

  const statCards = [
    { label: t.stats.events, value: community.stats.totalEvents, icon: CalendarDays },
    { label: t.stats.participants, value: community.stats.totalParticipants, icon: Users },
    { label: t.stats.proofs, value: community.stats.totalProofs, icon: BadgeCheck },
    { label: t.stats.organizerConfirmed, value: community.stats.organizerConfirmedProofs, icon: ShieldCheck },
    { label: t.stats.qrConfirmed, value: community.stats.qrCheckinProofs, icon: CheckCircle2 }
  ];
  const hasPublicActivity = community.stats.totalEvents > 0 || community.stats.totalProofs > 0;

  return (
    <PageShell className="space-y-10">
      <SiteHeader lang={lang} />

      <section className="grid gap-7 lg:grid-cols-[1fr_0.72fr] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-mint">{t.pageTitle}</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold leading-tight text-ink sm:text-4xl [word-break:keep-all]">
            {community.organization.name}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-700">{t.hero}</p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{t.description}</p>
        </div>
        <Card className="border-cyan-200 bg-cyan-50/55 p-5 shadow-none">
          <div className="flex items-start gap-3">
            <Award className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700" />
            <p className="text-sm font-semibold leading-6 text-cyan-950">{t.sections.activity}</p>
          </div>
        </Card>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label={common.status}>
        {statCards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-4 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-slate-500">{label}</p>
              <span className="rounded-md bg-mint/10 p-2 text-mint">
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-ink">{formatNumber(lang, value)}</p>
          </Card>
        ))}
      </section>

      {!hasPublicActivity ? (
        <Card className="border-dashed bg-white/80 text-center shadow-none">
          <Award className="mx-auto h-8 w-8 text-slate-400" />
          <h2 className="mt-3 text-xl font-bold text-ink">{t.pageTitle}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-700">{t.emptyState}</p>
        </Card>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-mint" />
          <h2 className="text-xl font-bold text-ink">{t.sections.labelBreakdown}</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {COMMUNITY_PROOF_LABEL_KEYS.map((key) => (
            <div key={key} className="rounded-lg border border-slate-200 bg-white/95 p-4 shadow-soft">
              <p className="text-xs font-semibold text-slate-500">{labelForCommunityProof(lang, key)}</p>
              <p className="mt-2 text-2xl font-bold text-ink">{formatNumber(lang, community.proofLabelCounts[key])}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-mint" />
            <h2 className="text-xl font-bold text-ink">{t.sections.recentEvents}</h2>
          </div>

          {community.recentEvents.length === 0 ? (
            <Card className="border-dashed bg-slate-50 text-sm text-slate-700 shadow-none">{t.noRecentEvents}</Card>
          ) : (
            <div className="grid gap-3">
              {community.recentEvents.map((event) => (
                <Card key={event.id} className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-ink">{event.title}</h3>
                      <p className="mt-2 text-sm text-slate-600">{formatDate(event.startsAt)}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <StatusPill tone="info">
                          {formatNumber(lang, event.participantCount)} {t.eventParticipants}
                        </StatusPill>
                        <StatusPill tone="success">
                          {formatNumber(lang, event.proofCount)} {t.eventProofs}
                        </StatusPill>
                      </div>
                    </div>
                    {event.checkinMode === "public" ? (
                      <Link
                        href={withLanguage(`/checkin/${event.checkinCode}`, lang)}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-ink shadow-sm transition hover:bg-slate-50"
                      >
                        <LinkIcon className="h-4 w-4" />
                        {t.publicCheckin}
                      </Link>
                    ) : (
                      <StatusPill tone="warning">{t.inviteOnly}</StatusPill>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-mint" />
            <h2 className="text-xl font-bold text-ink">{t.sections.recentProofs}</h2>
          </div>

          {community.recentProofs.length === 0 ? (
            <Card className="border-dashed bg-slate-50 text-sm text-slate-700 shadow-none">{t.noRecentProofs}</Card>
          ) : (
            <div className="grid gap-3">
              {community.recentProofs.map((proof) => (
                <Card key={proof.id} className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{proof.eventTitle}</p>
                      <h3 className="mt-1 text-lg font-bold text-ink">{proof.participantName}</h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <StatusPill tone={proof.proofLabel === "participation" ? "info" : "success"}>
                          {labelForCommunityProof(lang, proof.proofLabel)}
                        </StatusPill>
                        <StatusPill tone="neutral">{labelProofType(lang, proof.certificateType)}</StatusPill>
                        <StatusPill tone={proof.verificationLevel === "checkin" ? "info" : "success"}>
                          {labelVerificationLevel(lang, proof.verificationLevel)}
                        </StatusPill>
                      </div>
                      <dl className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                        <div>
                          <dt className="font-semibold">{t.proofLabel}</dt>
                          <dd>{labelForCommunityProof(lang, proof.proofLabel)}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold">{t.verification}</dt>
                          <dd>{labelVerificationLevel(lang, proof.verificationLevel)}</dd>
                        </div>
                      </dl>
                      <p className="mt-3 text-xs text-slate-500">{formatDateTime(proof.issuedAt)}</p>
                    </div>
                    <Link
                      href={withLanguage(`/cert/${proof.publicSlug}`, lang)}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-ink px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-navy"
                    >
                      {t.openProof}
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <PublicFooter lang={lang} />
    </PageShell>
  );
}
