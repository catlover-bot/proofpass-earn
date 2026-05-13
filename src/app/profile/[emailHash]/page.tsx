import Link from "next/link";
import { CalendarDays, ExternalLink, Layers3, MapPin, ShieldCheck } from "lucide-react";
import { AchievementBadgeList } from "@/components/AchievementBadgeList";
import { EventBenefitPlaceholder } from "@/components/EventBenefitPlaceholder";
import { PublicFooter } from "@/components/PublicFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SetupError } from "@/components/SetupError";
import { Card, PageShell, StatusPill } from "@/components/ui";
import { getAchievementCatalog, getProofAchievementBadges } from "@/lib/achievements";
import { formatDate, formatDateTime } from "@/lib/format";
import {
  commonCopy,
  getLanguageFromSearchParams,
  labelForValue,
  type Language,
  type SearchParamsLike,
  withLanguage
} from "@/lib/i18n";
import { labelProofType } from "@/lib/proof-types";
import { getProfileHashForEmail, normalizeProfileHash } from "@/lib/profile";
import { getMissingEnv, getSupabaseClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

type ParticipantRecord = {
  id: string;
  event_id: string;
  name: string;
  role: string;
  checked_in_at: string;
  email: string;
};

type CertificateRecord = {
  id: string;
  event_id: string;
  participant_id: string;
  public_slug: string;
  certificate_type: string;
  status: string;
  issued_at: string;
  contract_address: string | null;
  token_id: string | null;
  minted_at?: string | null;
  sbt_status?: string | null;
};

type CertificateRow = CertificateRecord;

type EventRecord = {
  id: string;
  title: string;
  starts_at: string;
  location: string | null;
};

const BASE_CERTIFICATE_SELECT =
  "id,event_id,participant_id,public_slug,certificate_type,status,issued_at,contract_address,token_id";
const SBT_CERTIFICATE_SELECT = `${BASE_CERTIFICATE_SELECT},minted_at,sbt_status`;

const copy = {
  en: {
    label: "Proof collection",
    title: "Public proof collection",
    intro:
      "A collectible view of public proofs, proof labels, and community contribution records. Participant email is not shown.",
    profileKey: "Collection key",
    owner: "Participant",
    proofs: "Proof cards",
    noProofsTitle: "No public proofs available",
    noProofsText:
      "This collection key does not currently match any public proof cards, or the organizer has not issued proofs yet.",
    unableParticipants: "Unable to load proof collection",
    unableProofs: "Unable to load public proofs",
    unableEvents: "Unable to load proof events",
    achievementsTitle: "Proof labels",
    achievementsIntro: "ProofPass uses non-transferable proof labels for participation and community contribution.",
    proofCard: "Collectible proof card",
    publicName: "Public name",
    issued: "Issued",
    checkedIn: "Checked in",
    viewProof: "Open public proof",
    privacyTitle: "Privacy note",
    privacyText: "This page is built from a hashed profile key. It does not show participant email.",
    sbtNote: "non-transferable SBT"
  },
  ja: {
    label: "証明コレクション",
    title: "公開証明コレクション",
    intro:
      "公開証明、証明ラベル、コミュニティ貢献記録をカード形式で表示します。参加者メールアドレスは表示されません。",
    profileKey: "コレクションキー",
    owner: "参加者",
    proofs: "証明カード",
    noProofsTitle: "公開証明はまだありません",
    noProofsText:
      "このコレクションキーに一致する公開証明カードがないか、主催者がまだ証明を発行していません。",
    unableParticipants: "証明コレクションを読み込めません",
    unableProofs: "公開証明を読み込めません",
    unableEvents: "証明イベントを読み込めません",
    achievementsTitle: "証明ラベル",
    achievementsIntro: "ProofPassは参加とコミュニティ貢献のために、譲渡不可の証明ラベルを使います。",
    proofCard: "コレクション証明カード",
    publicName: "公開名",
    issued: "発行",
    checkedIn: "チェックイン",
    viewProof: "公開証明を開く",
    privacyTitle: "プライバシーについて",
    privacyText: "このページはハッシュ化されたコレクションキーから作成され、参加者メールアドレスは表示しません。",
    sbtNote: "譲渡不可SBT"
  }
} satisfies Record<Language, Record<string, string>>;

function isMissingOptionalSbtColumn(error: { code?: string; message?: string }) {
  const message = error.message ?? "";

  return error.code === "42703" || error.code === "PGRST204" || message.includes("minted_at") || message.includes("sbt_status");
}

function hasTestnetSbt(certificate: CertificateRecord) {
  return Boolean(certificate.contract_address && certificate.token_id) || Boolean(certificate.minted_at);
}

export default async function ProofCollectionPage({
  params,
  searchParams
}: {
  params: Promise<{ emailHash: string }>;
  searchParams: Promise<SearchParamsLike>;
}) {
  const { emailHash } = await params;
  const lang = getLanguageFromSearchParams(await searchParams);
  const common = commonCopy[lang];
  const t = copy[lang];
  const profileKey = normalizeProfileHash(emailHash);
  const achievementCatalog = getAchievementCatalog(lang);

  const missing = getMissingEnv();
  if (missing.length > 0) {
    return (
      <PageShell className="space-y-6">
        <SiteHeader lang={lang} />
        <SetupError missing={missing} />
        <PublicFooter lang={lang} />
      </PageShell>
    );
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return (
      <PageShell className="space-y-6">
        <SiteHeader lang={lang} />
        <SetupError message="Supabase is not configured yet." />
        <PublicFooter lang={lang} />
      </PageShell>
    );
  }

  const { data: allParticipants, error: participantsError } = await supabase
    .from("participants")
    .select("id,event_id,name,role,checked_in_at,email")
    .order("checked_in_at", { ascending: false });

  if (participantsError) {
    return (
      <PageShell className="space-y-6">
        <SiteHeader lang={lang} />
        <SetupError title={t.unableParticipants} message={participantsError.message} />
        <PublicFooter lang={lang} />
      </PageShell>
    );
  }

  const participants = (allParticipants as ParticipantRecord[]).filter(
    (participant) => getProfileHashForEmail(participant.email) === profileKey
  );
  const participantIds = participants.map((participant) => participant.id);
  const participantsById = new Map(participants.map((participant) => [participant.id, participant]));

  let certificates: CertificateRecord[] = [];
  if (participantIds.length > 0) {
    const certificateResult = await supabase
      .from("certificates")
      .select(SBT_CERTIFICATE_SELECT)
      .in("participant_id", participantIds)
      .order("issued_at", { ascending: false });

    let certificateRows = certificateResult.data as CertificateRow[] | null;
    let certificateError = certificateResult.error;

    if (certificateResult.error && isMissingOptionalSbtColumn(certificateResult.error)) {
      const fallbackCertificateResult = await supabase
        .from("certificates")
        .select(BASE_CERTIFICATE_SELECT)
        .in("participant_id", participantIds)
        .order("issued_at", { ascending: false });

      certificateRows = fallbackCertificateResult.data as CertificateRow[] | null;
      certificateError = fallbackCertificateResult.error;
    }

    if (certificateError) {
      return (
        <PageShell className="space-y-6">
          <SiteHeader lang={lang} />
          <SetupError title={t.unableProofs} message={certificateError.message} />
          <PublicFooter lang={lang} />
        </PageShell>
      );
    }

    certificates = certificateRows ?? [];
  }

  const eventIds = Array.from(new Set(certificates.map((certificate) => certificate.event_id)));
  let eventsById = new Map<string, EventRecord>();

  if (eventIds.length > 0) {
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id,title,starts_at,location")
      .in("id", eventIds);

    if (eventsError) {
      return (
        <PageShell className="space-y-6">
          <SiteHeader lang={lang} />
          <SetupError title={t.unableEvents} message={eventsError.message} />
          <PublicFooter lang={lang} />
        </PageShell>
      );
    }

    eventsById = new Map((events as EventRecord[]).map((event) => [event.id, event]));
  }

  const profileName = participants[0]?.name ?? "ProofPass";

  return (
    <PageShell className="max-w-5xl space-y-8">
      <SiteHeader lang={lang} />

      <div className="grid gap-5 lg:grid-cols-[1fr_0.82fr]">
        <Card className="space-y-5 shadow-lift">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone="info">{t.label}</StatusPill>
            <StatusPill tone="testnet">{t.sbtNote}</StatusPill>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-ink">{t.title}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-700">{t.intro}</p>
          </div>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-slate-500">{t.owner}</dt>
              <dd className="mt-1 font-bold text-ink">{profileName}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">{t.profileKey}</dt>
              <dd className="mt-1 break-all font-bold text-ink">{profileKey}</dd>
            </div>
          </dl>
        </Card>

        <Card className="space-y-4 bg-paper/70 shadow-none">
          <div className="flex items-center gap-2">
            <Layers3 className="h-5 w-5 text-mint" />
            <h2 className="text-xl font-bold text-ink">{t.achievementsTitle}</h2>
          </div>
          <p className="text-sm leading-6 text-slate-700">{t.achievementsIntro}</p>
          <AchievementBadgeList badges={achievementCatalog} />
        </Card>
      </div>

      {certificates.length === 0 ? (
        <Card className="border-dashed bg-white/80 text-center shadow-none">
          <ShieldCheck className="mx-auto h-8 w-8 text-slate-400" />
          <h2 className="mt-3 text-xl font-bold text-ink">{t.noProofsTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-700">{t.noProofsText}</p>
        </Card>
      ) : (
        <section className="space-y-4" aria-label={t.proofs}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-ink">{t.proofs}</h2>
            <StatusPill>{certificates.length} {common.proof}</StatusPill>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {certificates.map((certificate) => {
              const participant = participantsById.get(certificate.participant_id);
              const event = eventsById.get(certificate.event_id);
              const badges = getProofAchievementBadges(lang, {
                certificateType: certificate.certificate_type,
                participantRole: participant?.role,
                hasTestnetSbt: hasTestnetSbt(certificate),
                includeEarlySupporter: true
              });

              return (
                <Card key={certificate.id} className="flex flex-col gap-5 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <StatusPill tone="info">{t.proofCard}</StatusPill>
                    <StatusPill tone={certificate.status === "valid" ? "success" : "danger"}>
                      {labelForValue(lang, certificate.status)}
                    </StatusPill>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">{labelProofType(lang, certificate.certificate_type)}</p>
                    <h3 className="mt-1 text-2xl font-bold text-ink">{event?.title ?? common.publicProof}</h3>
                  </div>
                  <AchievementBadgeList badges={badges} />
                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="font-semibold text-slate-500">{t.publicName}</dt>
                      <dd className="mt-1 font-bold text-ink">{participant?.name ?? profileName}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-500">{common.eventDate}</dt>
                      <dd className="mt-1 flex items-center gap-2 font-bold text-ink">
                        <CalendarDays className="h-4 w-4 text-mint" />
                        {event ? formatDate(event.starts_at) : "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-500">{t.issued}</dt>
                      <dd className="mt-1 font-bold text-ink">{formatDateTime(certificate.issued_at)}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-500">{common.location}</dt>
                      <dd className="mt-1 flex items-center gap-2 font-bold text-ink">
                        <MapPin className="h-4 w-4 text-mint" />
                        {event?.location ?? "-"}
                      </dd>
                    </div>
                  </dl>
                  <Link
                    href={withLanguage(`/cert/${certificate.public_slug}`, lang)}
                    className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-mint hover:text-ink"
                  >
                    {t.viewProof}
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      <EventBenefitPlaceholder lang={lang} />

      <Card className="bg-paper/80 shadow-none">
        <h2 className="text-lg font-bold text-ink">{t.privacyTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">{t.privacyText}</p>
      </Card>

      <PublicFooter lang={lang} />
    </PageShell>
  );
}
