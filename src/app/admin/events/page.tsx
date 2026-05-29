import Link from "next/link";
import { CalendarPlus, CheckCircle2, MapPin, QrCode, Users } from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { SetupError } from "@/components/SetupError";
import { ButtonLink, Card, PageShell, StatusPill } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { commonCopy, getLanguageFromSearchParams, type SearchParamsLike, withLanguage } from "@/lib/i18n";
import { getOrganizerSupabaseClient, requireOrganizer } from "@/lib/organizer-auth";
import { getMissingEnv, getSupabaseClient } from "@/lib/supabase/client";
import type { EventCheckinMode } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type EventListRecord = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string;
  checkin_code: string;
  checkin_mode: EventCheckinMode;
};

export default async function EventsPage({
  searchParams
}: {
  searchParams: Promise<SearchParamsLike>;
}) {
  const lang = getLanguageFromSearchParams(await searchParams);
  const common = commonCopy[lang];
  const copy = {
    en: {
      label: "Events",
      subtitle: "Create events, share QR check-ins, and manage participant activity records.",
      newEvent: "New event",
      auth: "Admin access is protected by organizer login.",
      guideTitle: "Pilot workflow",
      guideSteps: ["Create an event", "Share the QR check-in", "Confirm participant activity"],
      emptyTitle: "Create your first event",
      emptyText: "Create a QR check-in and start issuing shareable proof pages.",
      checkinReady: "QR check-in ready",
      participants: "participants",
      ends: "Ends",
      checkedIn: "checked in",
      publicMode: "Public QR check-in",
      inviteOnlyMode: "Invite-only check-in",
      open: "Open dashboard",
      unableEvents: "Unable to load events",
      unableCounts: "Unable to load participant counts"
    },
    ja: {
      label: "イベント",
      subtitle: "イベントを作成し、QRチェックインを共有して、参加・貢献記録を管理します。",
      newEvent: "新規イベント",
      auth: "管理画面は主催者ログインで保護されています。",
      guideTitle: "パイロットの流れ",
      guideSteps: ["イベント作成", "QRチェックイン共有", "参加・貢献を確認"],
      emptyTitle: "最初のイベントを作成",
      emptyText: "QRチェックインを作成して、共有できる証明ページの発行を始めましょう。",
      checkinReady: "QRチェックイン準備済み",
      participants: "参加者",
      ends: "終了",
      checkedIn: "チェックイン済み",
      publicMode: "公開QRチェックイン",
      inviteOnlyMode: "招待者限定チェックイン",
      open: "ダッシュボードを開く",
      unableEvents: "イベントを読み込めません",
      unableCounts: "参加者数を読み込めません"
    }
  }[lang];

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
  if (!supabase) {
    return (
      <PageShell className="space-y-8">
        <AdminHeader lang={lang} />
        <SetupError message="Supabase is not configured yet." />
      </PageShell>
    );
  }

  const eventsResult =
    organizer.organizationIds.length > 0
      ? await supabase
          .from("events")
          .select("id,title,description,location,starts_at,ends_at,checkin_code,checkin_mode")
          .in("organization_id", organizer.organizationIds)
          .order("starts_at", { ascending: false })
      : { data: [], error: null };

  let events: EventListRecord[] = [];
  let error = eventsResult.error;

  if (eventsResult.error && eventsResult.error.message.includes("checkin_mode")) {
    const fallbackResult = await supabase
      .from("events")
      .select("id,title,description,location,starts_at,ends_at,checkin_code")
      .in("organization_id", organizer.organizationIds)
      .order("starts_at", { ascending: false });

    error = fallbackResult.error;
    events = (fallbackResult.data ?? []).map((event) => ({
      ...event,
      checkin_mode: "public"
    }));
  } else {
    events = eventsResult.data ?? [];
  }

  if (error) {
    return (
      <PageShell className="space-y-8">
        <AdminHeader lang={lang} />
        <SetupError title={copy.unableEvents} message={error.message} />
      </PageShell>
    );
  }

  const participantCounts = new Map<string, number>();
  const eventIds = events.map((event) => event.id);

  if (eventIds.length > 0) {
    const { data: participants, error: participantCountError } = await supabase
      .from("participants")
      .select("event_id")
      .in("event_id", eventIds);

    if (participantCountError) {
      return (
        <PageShell className="space-y-8">
          <AdminHeader lang={lang} />
          <SetupError title={copy.unableCounts} message={participantCountError.message} />
        </PageShell>
      );
    }

    participants.forEach((participant) => {
      participantCounts.set(participant.event_id, (participantCounts.get(participant.event_id) ?? 0) + 1);
    });
  }

  return (
    <PageShell className="space-y-8">
      <AdminHeader lang={lang} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-mint">{copy.label}</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">{common.eventDashboard}</h1>
          <p className="mt-2 max-w-2xl text-slate-700">
            {copy.subtitle}
          </p>
        </div>
        <ButtonLink href={withLanguage("/admin/events/new", lang)}>
          <CalendarPlus className="h-4 w-4" />
          {copy.newEvent}
        </ButtonLink>
      </div>

      <Card className="border-amber-200 bg-amber-50 p-4 shadow-none">
        <p className="text-sm font-semibold text-amber-950">
          {copy.auth}
        </p>
      </Card>

      <section className="grid gap-3 md:grid-cols-3" aria-label={copy.guideTitle}>
        {copy.guideSteps.map((step, index) => {
          const Icon = index === 1 ? QrCode : index === 2 ? CheckCircle2 : CalendarPlus;

          return (
            <div key={step} className="rounded-lg border border-slate-200 bg-white/90 p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-mint/10 text-mint">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-500">{index + 1}</p>
                  <p className="font-bold text-ink">{step}</p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {events.length === 0 ? (
        <Card className="text-center">
          <h2 className="text-xl font-bold text-ink">{copy.emptyTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-700">
            {copy.emptyText}
          </p>
          <ButtonLink href={withLanguage("/admin/events/new", lang)} className="mt-5">
            {common.createEventShort}
          </ButtonLink>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => {
            const participantCount = participantCounts.get(event.id) ?? 0;

            return (
              <Card key={event.id} className="p-5 transition hover:-translate-y-0.5 hover:border-mint/40">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <StatusPill tone="success">{copy.checkinReady}</StatusPill>
                      <StatusPill tone={event.checkin_mode === "invite_only" ? "warning" : "info"}>
                        {event.checkin_mode === "invite_only" ? copy.inviteOnlyMode : copy.publicMode}
                      </StatusPill>
                      <StatusPill>
                        {participantCount} {copy.participants}
                      </StatusPill>
                    </div>
                    <h2 className="text-xl font-bold text-ink">{event.title}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{event.description}</p>
                    <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </p>
                  </div>
                  <div className="min-w-56 space-y-3 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                    <p className="font-semibold text-ink">{formatDateTime(event.starts_at)}</p>
                    <p>{copy.ends} {formatDateTime(event.ends_at)}</p>
                    <p className="flex items-center gap-2 font-semibold text-slate-700">
                      <Users className="h-4 w-4 text-mint" />
                      {participantCount} {copy.checkedIn}
                    </p>
                    <Link
                      href={withLanguage(`/admin/events/${event.id}`, lang)}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    >
                      {copy.open}
                      <CheckCircle2 className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
