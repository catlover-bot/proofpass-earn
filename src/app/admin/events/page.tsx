import Link from "next/link";
import { CalendarPlus, CheckCircle2, MapPin, Users } from "lucide-react";
import { SetupError } from "@/components/SetupError";
import { ButtonLink, Card, PageShell, StatusPill } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { getMissingEnv, getSupabaseClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const missing = getMissingEnv();
  if (missing.length > 0) {
    return (
      <PageShell>
        <SetupError missing={missing} />
      </PageShell>
    );
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return (
      <PageShell>
        <SetupError message="Supabase is not configured yet." />
      </PageShell>
    );
  }

  const { data: events, error } = await supabase
    .from("events")
    .select("id,title,description,location,starts_at,ends_at,checkin_code")
    .order("starts_at", { ascending: false });

  if (error) {
    return (
      <PageShell>
        <SetupError title="Unable to load events" message={error.message} />
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
        <PageShell>
          <SetupError title="Unable to load participant counts" message={participantCountError.message} />
        </PageShell>
      );
    }

    participants.forEach((participant) => {
      participantCounts.set(participant.event_id, (participantCounts.get(participant.event_id) ?? 0) + 1);
    });
  }

  return (
    <PageShell className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-mint">Events</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Event dashboard</h1>
          <p className="mt-2 max-w-2xl text-slate-700">
            Create QR check-ins and manage issued proof pages.
          </p>
        </div>
        <ButtonLink href="/admin/events/new">
          <CalendarPlus className="h-4 w-4" />
          New event
        </ButtonLink>
      </div>

      <Card className="border-amber-200 bg-amber-50 p-4 shadow-none">
        <p className="text-sm font-semibold text-amber-950">
          Admin access currently uses temporary Basic Auth for the pilot.
        </p>
      </Card>

      {events.length === 0 ? (
        <Card className="text-center">
          <h2 className="text-xl font-bold text-ink">Create your first event</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-700">
            Generate a QR check-in and start issuing proof pages.
          </p>
          <ButtonLink href="/admin/events/new" className="mt-5">
            Create event
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
                      <StatusPill tone="success">Check-in ready</StatusPill>
                      <StatusPill>{participantCount} participants</StatusPill>
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
                    <p>Ends {formatDateTime(event.ends_at)}</p>
                    <p className="flex items-center gap-2 font-semibold text-slate-700">
                      <Users className="h-4 w-4 text-mint" />
                      {participantCount} checked in
                    </p>
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    >
                      Open dashboard
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
