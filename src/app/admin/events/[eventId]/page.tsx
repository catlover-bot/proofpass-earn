import Link from "next/link";
import { Award, CheckCircle2, ExternalLink, LinkIcon, MapPin, MessageSquareText, Users } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { QrCodePanel } from "@/components/QrCodePanel";
import { SiteHeader } from "@/components/SiteHeader";
import { SetupError } from "@/components/SetupError";
import { ButtonLink, Card, PageShell, StatusPill } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { commonCopy, getLanguageFromSearchParams, labelForValue, type SearchParamsLike, withLanguage } from "@/lib/i18n";
import { getAppUrl, getMissingEnv, getSupabaseClient } from "@/lib/supabase/client";
import { isValidUuid } from "@/lib/validation/uuid";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<SearchParamsLike>;
}) {
  const { eventId } = await params;
  const lang = getLanguageFromSearchParams(await searchParams);
  const common = commonCopy[lang];
  const copy = {
    en: {
      invalidTitle: "Invalid event id",
      invalidText: "This event link is not valid. Open the event from the event list or create a new event.",
      notFoundTitle: "Event not found",
      notFoundText: "This event ID does not match an existing event.",
      unableEvent: "Unable to load event",
      unableParticipants: "Unable to load participants",
      unableProofs: "Unable to load proofs",
      unablePoints: "Unable to load points",
      dateTime: "Date and time",
      ends: "Ends",
      participants: "Participants",
      checkedInSoFar: "Checked in so far",
      helper: "Display this QR code at the venue or share the link in an online meeting.",
      starts: "Starts",
      checkinUrl: "Check-in URL",
      copyCheckin: "Copy check-in URL",
      copiedCheckin: "Check-in URL copied",
      checklist: "Pilot event checklist",
      beforeSharing: "Before sharing",
      beforeText: "Open the check-in URL once, confirm the event details, and keep this page open during the event.",
      publicPages: "Public pages",
      publicText: "The check-in page and proof pages are public. Public proof pages do not show participant email.",
      organizerMessage: "Organizer message",
      copyMessage: "Copy message",
      copiedMessage: "Message copied",
      shareText: (url: string) =>
        `Please check in here to receive your public participation proof: ${url}. Your email is used by the organizer and will not appear on the public proof page.`,
      participantNote:
        "Participant email is hidden here and on public proof pages. Use this list to confirm check-ins, proof links, and points.",
      noParticipantsTitle: "No participants yet",
      noParticipantsText: "Share the QR code to start issuing proofs.",
      name: "Name",
      checkedIn: "Checked in",
      notIssued: "Not issued"
    },
    ja: {
      invalidTitle: "イベントIDが無効です",
      invalidText: "このイベントリンクは有効ではありません。イベント一覧から開くか、新しいイベントを作成してください。",
      notFoundTitle: "イベントが見つかりません",
      notFoundText: "このイベントIDに一致するイベントはありません。",
      unableEvent: "イベントを読み込めません",
      unableParticipants: "参加者を読み込めません",
      unableProofs: "証明を読み込めません",
      unablePoints: "ポイントを読み込めません",
      dateTime: "日時",
      ends: "終了",
      participants: "参加者",
      checkedInSoFar: "チェックイン済み",
      helper: "会場でこのQRコードを表示するか、オンラインミーティングでリンクを共有してください。",
      starts: "開始",
      checkinUrl: "チェックインURL",
      copyCheckin: "チェックインURLをコピー",
      copiedCheckin: "チェックインURLをコピーしました",
      checklist: "パイロットイベントチェックリスト",
      beforeSharing: "共有前",
      beforeText: "チェックインURLを一度開き、イベント情報を確認して、イベント中はこのページを開いておきます。",
      publicPages: "公開ページ",
      publicText: "チェックインページと証明ページは公開されます。公開証明ページには参加者のメールアドレスは表示されません。",
      organizerMessage: "主催者向け共有文",
      copyMessage: "共有文をコピー",
      copiedMessage: "共有文をコピーしました",
      shareText: (url: string) =>
        `参加証明を受け取るため、こちらからチェックインしてください: ${url}。メールアドレスは主催者側の管理に使用されますが、公開証明ページには表示されません。`,
      participantNote:
        "参加者のメールアドレスはこの画面と公開証明ページには表示していません。この一覧でチェックイン、証明リンク、ポイントを確認できます。",
      noParticipantsTitle: "まだ参加者はいません",
      noParticipantsText: "QRコードを共有して参加証明の発行を始めましょう。",
      name: "名前",
      checkedIn: "チェックイン日時",
      notIssued: "未発行"
    }
  }[lang];

  if (!isValidUuid(eventId)) {
    return (
      <PageShell className="space-y-6">
        <SiteHeader lang={lang} />
        <Card>
          <h1 className="text-2xl font-bold text-ink">{copy.invalidTitle}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {copy.invalidText}
          </p>
          <ButtonLink href={withLanguage("/admin/events", lang)} className="mt-5" variant="secondary">
            {common.backToEvents}
          </ButtonLink>
        </Card>
      </PageShell>
    );
  }

  const missing = getMissingEnv();
  if (missing.length > 0) {
    return (
      <PageShell className="space-y-8">
        <SiteHeader lang={lang} />
        <SetupError missing={missing} />
      </PageShell>
    );
  }

  const supabase = getSupabaseClient();
  const appUrl = getAppUrl();

  if (!supabase || !appUrl) {
    return (
      <PageShell className="space-y-8">
        <SiteHeader lang={lang} />
        <SetupError message="Supabase or the app URL is not configured yet." />
      </PageShell>
    );
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id,title,description,location,starts_at,ends_at,checkin_code")
    .eq("id", eventId)
    .maybeSingle();

  if (eventError) {
    return (
      <PageShell className="space-y-8">
        <SiteHeader lang={lang} />
        <SetupError title={copy.unableEvent} message={eventError.message} />
      </PageShell>
    );
  }

  if (!event) {
    return (
      <PageShell className="space-y-6">
        <SiteHeader lang={lang} />
        <Card>
          <h1 className="text-2xl font-bold text-ink">{copy.notFoundTitle}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {copy.notFoundText}
          </p>
          <ButtonLink href={withLanguage("/admin/events", lang)} className="mt-5" variant="secondary">
            {common.backToEvents}
          </ButtonLink>
        </Card>
      </PageShell>
    );
  }

  const { data: participants, error: participantsError } = await supabase
    .from("participants")
    .select("id,name,role,checked_in_at")
    .eq("event_id", event.id)
    .order("checked_in_at", { ascending: false });

  if (participantsError) {
    return (
      <PageShell className="space-y-8">
        <SiteHeader lang={lang} />
        <SetupError title={copy.unableParticipants} message={participantsError.message} />
      </PageShell>
    );
  }

  const participantIds = participants.map((participant) => participant.id);
  const certificatesByParticipant = new Map<string, { public_slug: string; status: string }>();
  const pointsByParticipant = new Map<string, number>();

  if (participantIds.length > 0) {
    const { data: certificates, error: certificatesError } = await supabase
      .from("certificates")
      .select("participant_id,public_slug,status")
      .eq("event_id", event.id)
      .in("participant_id", participantIds);

    if (certificatesError) {
      return (
        <PageShell className="space-y-8">
          <SiteHeader lang={lang} />
          <SetupError title={copy.unableProofs} message={certificatesError.message} />
        </PageShell>
      );
    }

    certificates.forEach((certificate) => {
      certificatesByParticipant.set(certificate.participant_id, {
        public_slug: certificate.public_slug,
        status: certificate.status
      });
    });

    const { data: points, error: pointsError } = await supabase
      .from("point_ledger")
      .select("participant_id,points")
      .eq("event_id", event.id)
      .in("participant_id", participantIds);

    if (pointsError) {
      return (
        <PageShell className="space-y-8">
          <SiteHeader lang={lang} />
          <SetupError title={copy.unablePoints} message={pointsError.message} />
        </PageShell>
      );
    }

    points.forEach((entry) => {
      pointsByParticipant.set(entry.participant_id, (pointsByParticipant.get(entry.participant_id) ?? 0) + entry.points);
    });
  }

  const checkinUrl = `${appUrl}/checkin/${event.checkin_code}?lang=${lang}`;
  const organizerShareText = copy.shareText(checkinUrl);

  return (
    <PageShell className="space-y-8">
      <SiteHeader lang={lang} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-mint">{common.eventDashboard}</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">{event.title}</h1>
          <p className="mt-2 max-w-3xl text-slate-700">{event.description}</p>
        </div>
        <ButtonLink href={withLanguage("/admin/events", lang)} variant="secondary">
          {common.backToEvents}
        </ButtonLink>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-paper/70 p-5 shadow-none">
          <p className="text-sm font-semibold text-slate-500">{copy.dateTime}</p>
          <p className="mt-2 font-bold text-ink">{formatDateTime(event.starts_at)}</p>
          <p className="mt-1 text-sm text-slate-600">{copy.ends} {formatDateTime(event.ends_at)}</p>
        </Card>
        <Card className="bg-paper/70 p-5 shadow-none">
          <p className="text-sm font-semibold text-slate-500">{common.location}</p>
          <p className="mt-2 flex items-start gap-2 font-bold text-ink">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
            {event.location}
          </p>
        </Card>
        <Card className="bg-paper/70 p-5 shadow-none">
          <p className="text-sm font-semibold text-slate-500">{copy.participants}</p>
          <p className="mt-2 text-3xl font-bold text-ink">{participants.length}</p>
          <p className="mt-1 text-sm text-slate-600">{copy.checkedInSoFar}</p>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-5 shadow-lift">
          <div>
            <h2 className="text-xl font-bold text-ink">{common.shareCheckIn}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {copy.helper}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-slate-500">{copy.starts}</p>
              <p className="mt-1 text-base font-semibold text-ink">{formatDateTime(event.starts_at)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">{copy.ends}</p>
              <p className="mt-1 text-base font-semibold text-ink">{formatDateTime(event.ends_at)}</p>
            </div>
          </div>

          <p className="flex items-center gap-2 text-sm text-slate-700">
            <MapPin className="h-4 w-4" />
            {event.location}
          </p>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <LinkIcon className="h-4 w-4" />
              {copy.checkinUrl}
            </div>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="break-all text-sm font-semibold text-ink">{checkinUrl}</p>
              <CopyButton value={checkinUrl} label={copy.copyCheckin} copiedLabel={copy.copiedCheckin} />
            </div>
          </div>
        </Card>

        <QrCodePanel value={checkinUrl} />
      </div>

      <Card className="space-y-5">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-mint" />
          <h2 className="text-xl font-bold text-ink">{copy.checklist}</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            <p className="font-semibold text-ink">{copy.beforeSharing}</p>
            <p className="mt-2">{copy.beforeText}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            <p className="font-semibold text-ink">{copy.publicPages}</p>
            <p className="mt-2">{copy.publicText}</p>
          </div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <MessageSquareText className="h-4 w-4" />
            {copy.organizerMessage}
          </div>
          <p className="mt-3 text-sm leading-6 text-ink">{organizerShareText}</p>
          <div className="mt-4">
            <CopyButton value={organizerShareText} label={copy.copyMessage} copiedLabel={copy.copiedMessage} />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-mint" />
              <h2 className="text-xl font-bold text-ink">{common.checkedInParticipants}</h2>
            </div>
            <p className="mt-2 text-sm text-slate-700">
              {copy.participantNote}
            </p>
          </div>
          <StatusPill>{participants.length} {copy.checkedInSoFar}</StatusPill>
        </div>

        {participants.length === 0 ? (
          <div className="mt-6 rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <Award className="mx-auto h-8 w-8 text-slate-400" />
            <h3 className="mt-3 text-lg font-bold text-ink">{copy.noParticipantsTitle}</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-700">
              {copy.noParticipantsText}
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4 font-semibold">{copy.name}</th>
                  <th className="py-3 pr-4 font-semibold">{common.role}</th>
                  <th className="py-3 pr-4 font-semibold">{copy.checkedIn}</th>
                  <th className="py-3 pr-4 font-semibold">{common.proof}</th>
                  <th className="py-3 pr-4 text-right font-semibold">{common.points}</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => {
                  const certificate = certificatesByParticipant.get(participant.id);
                  const points = pointsByParticipant.get(participant.id) ?? 0;

                  return (
                    <tr key={participant.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-4 pr-4 font-semibold text-ink">{participant.name}</td>
                      <td className="py-4 pr-4 text-slate-700">{labelForValue(lang, participant.role)}</td>
                      <td className="py-4 pr-4 text-slate-700">{formatDateTime(participant.checked_in_at)}</td>
                      <td className="py-4 pr-4">
                        {certificate ? (
                          <div className="flex flex-wrap items-center gap-3">
                            <StatusPill tone={certificate.status === "valid" ? "success" : "danger"}>
                              {labelForValue(lang, certificate.status)}
                            </StatusPill>
                            <Link
                              href={withLanguage(`/cert/${certificate.public_slug}`, lang)}
                              className="inline-flex items-center gap-2 font-semibold text-mint hover:text-ink"
                            >
                              {common.openProof}
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </div>
                        ) : (
                          <span className="text-slate-500">{copy.notIssued}</span>
                        )}
                      </td>
                      <td className="py-4 pr-4 text-right font-bold text-ink">{points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageShell>
  );
}
