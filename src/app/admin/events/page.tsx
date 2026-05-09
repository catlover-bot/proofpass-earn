import Link from "next/link";
import { CalendarPlus, MapPin } from "lucide-react";
import { SetupError } from "@/components/SetupError";
import { ButtonLink, Card, PageShell } from "@/components/ui";
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

  return (
    <PageShell className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-mint">Events</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Event management</h1>
          <p className="mt-2 text-slate-700">Create QR check-ins and track proof status.</p>
        </div>
        <ButtonLink href="/admin/events/new">
          <CalendarPlus className="h-4 w-4" />
          New event
        </ButtonLink>
      </div>

      {events.length === 0 ? (
        <Card className="text-center">
          <h2 className="text-xl font-bold text-ink">No events yet</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-700">
            Create your first event to generate a check-in link and start issuing proof pages.
          </p>
          <ButtonLink href="/admin/events/new" className="mt-5">
            Create event
          </ButtonLink>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/admin/events/${event.id}`}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-mint/40"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-ink">{event.title}</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{event.description}</p>
                  <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </p>
                </div>
                <div className="min-w-52 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                  <p className="font-semibold text-ink">{formatDateTime(event.starts_at)}</p>
                  <p className="mt-1">Ends {formatDateTime(event.ends_at)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
