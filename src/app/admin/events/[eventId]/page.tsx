import Link from "next/link";
import { Award, BadgeCheck, CheckCircle2, ExternalLink, LinkIcon, MapPin, MessageSquareText, Users, X } from "lucide-react";
import { AchievementBadgeList } from "@/components/AchievementBadgeList";
import { AdminHeader } from "@/components/AdminHeader";
import { CopyButton } from "@/components/CopyButton";
import { EventInvitationForm } from "@/components/EventInvitationForm";
import { QrCodePanel } from "@/components/QrCodePanel";
import { SetupError } from "@/components/SetupError";
import { Button, ButtonLink, Card, PageShell, StatusPill } from "@/components/ui";
import { updateParticipantProofLabelAction } from "@/lib/actions/proof-labels";
import { formatDateTime } from "@/lib/format";
import { getAchievementBadge, getProofAchievementBadges } from "@/lib/achievements";
import { commonCopy, getLanguageFromSearchParams, labelForValue, type SearchParamsLike, withLanguage } from "@/lib/i18n";
import { getOrganizerSupabaseClient, requireOrganizer } from "@/lib/organizer-auth";
import {
  PROOF_LABEL_KEYS,
  labelApprovalStatus,
  labelProofType,
  labelVerificationLevel,
  type ProofLabelKey
} from "@/lib/proof-types";
import { getAppUrl, getMissingEnv, getSupabaseClient } from "@/lib/supabase/client";
import { isValidUuid } from "@/lib/validation/uuid";

export const dynamic = "force-dynamic";

type InvitationRecord = {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  invite_token: string;
  status: string;
  invited_at: string;
  checked_in_at: string | null;
};

type ParticipantCertificate = {
  public_slug: string;
  status: string;
  certificate_type: string;
  verification_level: string;
  approval_status: string;
  contract_address?: string | null;
  token_id?: string | null;
  minted_at?: string | null;
};

type ParticipantCertificateRow = ParticipantCertificate & {
  participant_id: string;
};

type ParticipantBadgeRow = {
  participant_id: string;
  badge_type: string;
};

function isInvitationSetupError(message: string) {
  return message.includes("event_invitations") || message.includes("checkin_mode") || message.includes("schema cache");
}

function isMissingOptionalCertificateColumn(message: string) {
  return (
    message.includes("contract_address") ||
    message.includes("token_id") ||
    message.includes("minted_at") ||
    message.includes("verification_level") ||
    message.includes("approval_status")
  );
}

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
      unableLabels: "Unable to load proof labels",
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
      publicText: "Check-in pages and proof pages can be shared. Proof pages do not show participant email.",
      organizerProofTitle: "Organizer activity records",
      organizerProofIntro:
        "Host activity can also be kept as an event activity record for the people who make the event possible.",
      organizerProofItems: ["Organizer activity", "Host record", "Digital proof option"],
      organizerProofNote:
        "For advanced pilots, confirmed records can later be saved as digital proof records. Nothing is saved automatically.",
      organizerMessage: "Organizer message",
      copyMessage: "Copy message",
      copiedMessage: "Message copied",
      shareText: (url: string) =>
        `Please check in here to receive your public participation proof: ${url}. Your email is used by the organizer and will not appear on the public proof page.`,
      participantNote:
        "Participant email is hidden in this list and on public proof pages. Use this list to confirm check-ins, proof links, and proof labels.",
      noParticipantsTitle: "No participants yet",
      noParticipantsText: "Share the QR code to start issuing proofs.",
      name: "Name",
      checkedIn: "Checked in",
      proofStatus: "Proof status",
      proofLink: "Proof link",
      achievements: "Proof labels",
      verification: "How confirmed",
      manageProofLabels: "Manage labels",
      manageProofLabelsTitle: "Proof label management",
      manageProofLabelsHelp:
        "QR check-in starts as attendance proof. Add an organizer-confirmed label after you have checked the participant activity.",
      currentLabel: "Current label",
      noOrganizerLabel: "No organizer label yet",
      proofRecord: "Proof record",
      checkedInProof: "QR participation confirmed",
      organizerApprovedProof: "Organizer confirmed",
      removeLabel: "Remove label",
      labelActions: {
        speaker: "Mark speaker",
        contributor: "Mark contributor",
        supporter: "Mark supporter",
        mentor: "Mark mentor",
        winner: "Mark winner"
      },
      publicMode: "Public QR check-in",
      inviteOnlyMode: "Invite-only check-in",
      invitationsTitle: "Invitations",
      invitationsIntro:
        "Add optional invitations for this event. The app does not send email yet, so copy invite links and share them yourself.",
      invitationPrivacy:
        "Invitation emails are shown only on this admin page. Do not publish invitation or participant lists without consent.",
      inviteSetup: "Invitation setup is not ready. Run supabase/invitations.sql in Supabase.",
      noInvitationsTitle: "No invitations yet",
      noInvitationsText: "Add one invitation or paste a simple list to generate invite links.",
      invitee: "Invitee",
      invitedAt: "Invited",
      inviteLink: "Invite link",
      copyInviteLink: "Copy invite link",
      copiedInviteLink: "Invite link copied",
      invitationStatus: {
        invited: "Invited",
        checked_in: "Checked in",
        revoked: "Revoked"
      },
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
      unableLabels: "証明ラベルを読み込めません",
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
      publicText: "チェックインページと証明ページは共有できます。証明ページには参加者のメールアドレスは表示されません。",
      organizerProofTitle: "主催者の活動記録",
      organizerProofIntro:
        "イベントを実現するホストの活動も、活動記録として残せます。",
      organizerProofItems: ["主催者の活動", "ホスト記録", "デジタル証明の拡張"],
      organizerProofNote:
        "高度な実証では、確認済みの記録を後からデジタル証明として保存できます。自動保存はされません。",
      organizerMessage: "主催者向け共有文",
      copyMessage: "共有文をコピー",
      copiedMessage: "共有文をコピーしました",
      shareText: (url: string) =>
        `参加証明を受け取るため、こちらからチェックインしてください: ${url}。メールアドレスは主催者側の管理に使用されますが、公開証明ページには表示されません。`,
      participantNote:
        "参加者のメールアドレスはこの一覧と証明ページには表示していません。この一覧でチェックイン、証明リンク、証明ラベルを確認できます。",
      noParticipantsTitle: "まだ参加者はいません",
      noParticipantsText: "QRコードを共有して参加証明の発行を始めましょう。",
      name: "名前",
      checkedIn: "チェックイン日時",
      proofStatus: "証明ステータス",
      proofLink: "証明リンク",
      achievements: "証明ラベル",
      verification: "確認方法",
      manageProofLabels: "ラベル管理",
      manageProofLabelsTitle: "証明ラベル管理",
      manageProofLabelsHelp:
        "QRチェックイン直後は参加証明です。活動内容を確認できたら、主催者が確認済みのラベルを付与してください。",
      currentLabel: "現在のラベル",
      noOrganizerLabel: "主催者ラベルなし",
      proofRecord: "証明記録",
      checkedInProof: "QRで参加確認済み",
      organizerApprovedProof: "主催者が確認済み",
      removeLabel: "ラベル削除",
      labelActions: {
        speaker: "登壇者にする",
        contributor: "貢献者にする",
        supporter: "サポーターにする",
        mentor: "メンターにする",
        winner: "受賞者にする"
      },
      publicMode: "公開QRチェックイン",
      inviteOnlyMode: "招待者限定チェックイン",
      invitationsTitle: "招待",
      invitationsIntro:
        "このイベントの招待リンクを作成できます。アプリからメール送信はしないため、招待リンクをコピーして共有してください。",
      invitationPrivacy:
        "招待メールアドレスはこの管理画面でのみ表示されます。同意なく招待者一覧や参加者一覧を公開しないでください。",
      inviteSetup: "招待機能の準備が完了していません。Supabaseで supabase/invitations.sql を実行してください。",
      noInvitationsTitle: "まだ招待はありません",
      noInvitationsText: "1件ずつ追加するか、リストを貼り付けて招待リンクを作成できます。",
      invitee: "招待者",
      invitedAt: "招待日時",
      inviteLink: "招待リンク",
      copyInviteLink: "招待リンクをコピー",
      copiedInviteLink: "招待リンクをコピーしました",
      invitationStatus: {
        invited: "招待済み",
        checked_in: "チェックイン済み",
        revoked: "取り消し済み"
      },
      notIssued: "未発行"
    }
  }[lang];

  if (!isValidUuid(eventId)) {
    return (
      <PageShell className="space-y-6">
        <AdminHeader lang={lang} />
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
        <AdminHeader lang={lang} />
        <SetupError missing={missing} />
      </PageShell>
    );
  }

  const organizer = await requireOrganizer(lang);
  const supabase = getOrganizerSupabaseClient(organizer) ?? getSupabaseClient();
  const appUrl = getAppUrl();

  if (!supabase || !appUrl) {
    return (
      <PageShell className="space-y-8">
        <AdminHeader lang={lang} />
        <SetupError message="Supabase or the app URL is not configured yet." />
      </PageShell>
    );
  }

  let eventResult = await supabase
    .from("events")
    .select("id,title,description,location,starts_at,ends_at,checkin_code,checkin_mode")
    .eq("id", eventId)
    .in("organization_id", organizer.organizationIds)
    .maybeSingle();

  if (eventResult.error && eventResult.error.message.includes("checkin_mode")) {
    eventResult = await supabase
      .from("events")
      .select("id,title,description,location,starts_at,ends_at,checkin_code")
      .eq("id", eventId)
      .in("organization_id", organizer.organizationIds)
      .maybeSingle();
  }

  const event = eventResult.data
    ? {
        ...eventResult.data,
        checkin_mode: "checkin_mode" in eventResult.data ? eventResult.data.checkin_mode : "public"
      }
    : null;
  const eventError = eventResult.error;

  if (eventError) {
    return (
      <PageShell className="space-y-8">
        <AdminHeader lang={lang} />
        <SetupError title={copy.unableEvent} message={eventError.message} />
      </PageShell>
    );
  }

  if (!event) {
    return (
      <PageShell className="space-y-6">
        <AdminHeader lang={lang} />
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
        <AdminHeader lang={lang} />
        <SetupError title={copy.unableParticipants} message={participantsError.message} />
      </PageShell>
    );
  }

  const participantIds = participants.map((participant) => participant.id);
  const certificatesByParticipant = new Map<string, ParticipantCertificate>();
  const badgesByParticipant = new Map<string, string[]>();
  let invitations: InvitationRecord[] = [];
  let invitationErrorMessage: string | null = null;

  if (participantIds.length > 0) {
    const certificateResult = await supabase
      .from("certificates")
      .select(
        "participant_id,public_slug,status,certificate_type,verification_level,approval_status,contract_address,token_id,minted_at"
      )
      .eq("event_id", event.id)
      .in("participant_id", participantIds);

    let certificates = certificateResult.data as ParticipantCertificateRow[] | null;
    let certificatesError = certificateResult.error;

    if (certificateResult.error && isMissingOptionalCertificateColumn(certificateResult.error.message)) {
      const fallbackCertificateResult = await supabase
        .from("certificates")
        .select("participant_id,public_slug,status,certificate_type")
        .eq("event_id", event.id)
        .in("participant_id", participantIds);

      certificates = fallbackCertificateResult.data as ParticipantCertificateRow[] | null;
      certificatesError = fallbackCertificateResult.error;
    }

    if (certificatesError) {
      return (
        <PageShell className="space-y-8">
          <AdminHeader lang={lang} />
          <SetupError title={copy.unableProofs} message={certificatesError.message} />
        </PageShell>
      );
    }

    (certificates ?? []).forEach((certificate) => {
      certificatesByParticipant.set(certificate.participant_id, {
        public_slug: certificate.public_slug,
        status: certificate.status,
        certificate_type: certificate.certificate_type,
        verification_level: "verification_level" in certificate ? certificate.verification_level : "checkin",
        approval_status: "approval_status" in certificate ? certificate.approval_status : "approved",
        contract_address: "contract_address" in certificate ? certificate.contract_address : null,
        token_id: "token_id" in certificate ? certificate.token_id : null,
        minted_at: "minted_at" in certificate ? certificate.minted_at : null
      });
    });

    const { data: badgeRows, error: badgeError } = await supabase
      .from("badges")
      .select("participant_id,badge_type")
      .in("participant_id", participantIds)
      .in("badge_type", [...PROOF_LABEL_KEYS]);

    if (badgeError) {
      return (
        <PageShell className="space-y-8">
          <AdminHeader lang={lang} />
          <SetupError title={copy.unableLabels} message={badgeError.message} />
        </PageShell>
      );
    }

    (badgeRows as ParticipantBadgeRow[] | null)?.forEach((badge) => {
      const existing = badgesByParticipant.get(badge.participant_id) ?? [];

      badgesByParticipant.set(badge.participant_id, [...existing, badge.badge_type]);
    });
  }

  const { data: invitationData, error: invitationError } = await supabase
    .from("event_invitations")
    .select("id,email,name,role,invite_token,status,invited_at,checked_in_at")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false });

  if (invitationError) {
    invitationErrorMessage = isInvitationSetupError(invitationError.message) ? copy.inviteSetup : invitationError.message;
  } else {
    invitations = invitationData;
  }

  const checkinUrl = `${appUrl}/checkin/${event.checkin_code}?lang=${lang}`;
  const organizerShareText = copy.shareText(checkinUrl);
  const labelIcons = {
    speaker: MessageSquareText,
    contributor: CheckCircle2,
    supporter: Users,
    mentor: BadgeCheck,
    winner: Award
  } satisfies Record<ProofLabelKey, typeof Award>;

  return (
    <PageShell className="space-y-8">
      <AdminHeader lang={lang} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-mint">{common.eventDashboard}</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">{event.title}</h1>
          <p className="mt-2 max-w-3xl text-slate-700">{event.description}</p>
          <div className="mt-3">
            <StatusPill tone={event.checkin_mode === "invite_only" ? "warning" : "info"}>
              {event.checkin_mode === "invite_only" ? copy.inviteOnlyMode : copy.publicMode}
            </StatusPill>
          </div>
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

      <Card className="space-y-4 border-violet-200 bg-white">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-mint" />
          <h2 className="text-xl font-bold text-ink">{copy.organizerProofTitle}</h2>
        </div>
        <p className="text-sm leading-6 text-slate-700">{copy.organizerProofIntro}</p>
        <div className="flex flex-wrap gap-2">
          {copy.organizerProofItems.map((item, index) => (
            <StatusPill key={item} tone={index === 2 ? "testnet" : "info"}>
              {item}
            </StatusPill>
          ))}
        </div>
        <p className="rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-950">
          {copy.organizerProofNote}
        </p>
      </Card>

      <Card className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-ink">{copy.invitationsTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">{copy.invitationsIntro}</p>
          <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            {copy.invitationPrivacy}
          </p>
        </div>

        {invitationErrorMessage ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-950">
            {invitationErrorMessage}
          </div>
        ) : (
          <>
            <EventInvitationForm eventId={event.id} lang={lang} />

            {invitations.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <h3 className="text-lg font-bold text-ink">{copy.noInvitationsTitle}</h3>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-700">
                  {copy.noInvitationsText}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-3 pr-4 font-semibold">{copy.invitee}</th>
                      <th className="py-3 pr-4 font-semibold">{common.email}</th>
                      <th className="py-3 pr-4 font-semibold">{common.role}</th>
                      <th className="py-3 pr-4 font-semibold">{common.status}</th>
                      <th className="py-3 pr-4 font-semibold">{copy.invitedAt}</th>
                      <th className="py-3 pr-4 font-semibold">{copy.inviteLink}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitations.map((invitation) => {
                      const inviteUrl = `${appUrl}/checkin/${event.checkin_code}?lang=${lang}&invite=${invitation.invite_token}`;
                      return (
                        <tr key={invitation.id} className="border-b border-slate-100 last:border-0">
                          <td className="py-4 pr-4 font-semibold text-ink">{invitation.name || "-"}</td>
                          <td className="py-4 pr-4 text-slate-700">{invitation.email}</td>
                          <td className="py-4 pr-4 text-slate-700">
                            {invitation.role ? labelForValue(lang, invitation.role) : "-"}
                          </td>
                          <td className="py-4 pr-4">
                            <StatusPill tone={invitation.status === "checked_in" ? "success" : "neutral"}>
                              {copy.invitationStatus[invitation.status as keyof typeof copy.invitationStatus] ??
                                invitation.status}
                            </StatusPill>
                          </td>
                          <td className="py-4 pr-4 text-slate-700">{formatDateTime(invitation.invited_at)}</td>
                          <td className="py-4 pr-4">
                            <CopyButton
                              value={inviteUrl}
                              label={copy.copyInviteLink}
                              copiedLabel={copy.copiedInviteLink}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Card>

      <section className="space-y-5">
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
          <Card className="border-dashed bg-slate-50 text-center shadow-none">
            <Award className="mx-auto h-8 w-8 text-slate-400" />
            <h3 className="mt-3 text-lg font-bold text-ink">{copy.noParticipantsTitle}</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-700">
              {copy.noParticipantsText}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {participants.map((participant) => {
              const certificate = certificatesByParticipant.get(participant.id);
              const proofLabels = badgesByParticipant.get(participant.id) ?? [];
              const currentProofLabel = PROOF_LABEL_KEYS.find((labelKey) => proofLabels.includes(labelKey));
              const badges = getProofAchievementBadges(lang, {
                proofLabels,
                verificationLevel: certificate?.verification_level,
                hasTestnetSbt:
                  certificate?.verification_level === "onchain_sbt" ||
                  Boolean(certificate?.contract_address && certificate.token_id) ||
                  Boolean(certificate?.minted_at)
              });

              return (
                <Card key={participant.id} className="p-5">
                  <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
                    <div className="space-y-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{copy.name}</p>
                          <h3 className="mt-1 text-xl font-bold text-ink">{participant.name}</h3>
                        </div>
                        <StatusPill tone="info">{formatDateTime(participant.checked_in_at)}</StatusPill>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                          <p className="text-xs font-semibold text-slate-500">{common.role}</p>
                          <p className="mt-1 font-bold text-ink">{labelForValue(lang, participant.role)}</p>
                        </div>
                        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                          <p className="text-xs font-semibold text-slate-500">{common.proofType}</p>
                          <p className="mt-1 font-bold text-ink">
                            {certificate ? labelProofType(lang, certificate.certificate_type) : copy.notIssued}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {certificate ? (
                          <>
                            <StatusPill tone={certificate.verification_level === "checkin" ? "info" : "success"}>
                              {labelVerificationLevel(lang, certificate.verification_level)}
                            </StatusPill>
                            <StatusPill tone={certificate.approval_status === "approved" ? "success" : "warning"}>
                              {labelApprovalStatus(lang, certificate.approval_status)}
                            </StatusPill>
                            <StatusPill tone={certificate.status === "valid" ? "success" : "danger"}>
                              {labelForValue(lang, certificate.status)}
                            </StatusPill>
                          </>
                        ) : (
                          <StatusPill>{copy.notIssued}</StatusPill>
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-500">{copy.achievements}</p>
                        <AchievementBadgeList badges={badges} />
                      </div>

                      {certificate ? (
                        <Link
                          href={withLanguage(`/cert/${certificate.public_slug}`, lang)}
                          className="inline-flex items-center gap-2 font-semibold text-mint hover:text-ink"
                        >
                          {common.openProof}
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      ) : null}
                    </div>

                    <div className="rounded-md border border-slate-200 bg-white p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-mint">
                            {copy.manageProofLabels}
                          </p>
                          <h4 className="mt-1 text-lg font-bold text-ink">{copy.manageProofLabelsTitle}</h4>
                          <p className="mt-2 text-sm leading-6 text-slate-700">{copy.manageProofLabelsHelp}</p>
                        </div>
                        <div className="shrink-0">
                          <StatusPill tone={currentProofLabel ? "success" : "info"}>
                            {currentProofLabel ? copy.organizerApprovedProof : copy.checkedInProof}
                          </StatusPill>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
                        <div className="rounded-md bg-slate-50 p-3">
                          <p className="text-xs font-semibold text-slate-500">{copy.currentLabel}</p>
                          <p className="mt-1 font-bold text-ink">
                            {currentProofLabel ? getAchievementBadge(lang, currentProofLabel).label : copy.noOrganizerLabel}
                          </p>
                        </div>
                        <div className="rounded-md bg-slate-50 p-3">
                          <p className="text-xs font-semibold text-slate-500">{copy.proofRecord}</p>
                          <p className="mt-1 font-bold text-ink">
                            {certificate ? labelVerificationLevel(lang, certificate.verification_level) : copy.notIssued}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {PROOF_LABEL_KEYS.map((labelKey) => {
                          const LabelIcon = labelIcons[labelKey];
                          const isSelected = currentProofLabel === labelKey;

                          return (
                            <form key={labelKey} action={updateParticipantProofLabelAction}>
                              <input type="hidden" name="eventId" value={event.id} />
                              <input type="hidden" name="participantId" value={participant.id} />
                              <input type="hidden" name="labelKey" value={labelKey} />
                              <input type="hidden" name="lang" value={lang} />
                              <Button
                                type="submit"
                                variant={isSelected ? "primary" : "secondary"}
                                aria-pressed={isSelected}
                                className="w-full min-h-10 justify-start px-3 text-xs"
                              >
                                <LabelIcon className="h-4 w-4 shrink-0" />
                                {copy.labelActions[labelKey]}
                              </Button>
                            </form>
                          );
                        })}
                        <form action={updateParticipantProofLabelAction}>
                          <input type="hidden" name="eventId" value={event.id} />
                          <input type="hidden" name="participantId" value={participant.id} />
                          <input type="hidden" name="labelKey" value="" />
                          <input type="hidden" name="lang" value={lang} />
                          <Button type="submit" variant="subtle" className="w-full min-h-10 justify-start px-3 text-xs">
                            <X className="h-4 w-4 shrink-0" />
                            {copy.removeLabel}
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </PageShell>
  );
}
