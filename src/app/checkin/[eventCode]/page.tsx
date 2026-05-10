import { CalendarDays, MapPin } from "lucide-react";
import { CheckinForm } from "@/components/CheckinForm";
import { SetupError } from "@/components/SetupError";
import { Card, PageShell } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { getMissingEnv, getSupabaseClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default async function CheckinPage({
  params
}: {
  params: Promise<{ eventCode: string }>;
}) {
  const { eventCode } = await params;

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

  const { data: event, error } = await supabase
    .from("events")
    .select("id,title,description,location,starts_at,ends_at,checkin_code")
    .eq("checkin_code", eventCode)
    .maybeSingle();

  if (error) {
    return (
      <PageShell>
        <SetupError title="Unable to load check-in" message={error.message} />
      </PageShell>
    );
  }

  if (!event) {
    return (
      <PageShell>
        <Card>
          <h1 className="text-2xl font-bold text-ink">Invalid check-in link</h1>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            This event code is not active. Ask the organizer for the current QR check-in link.
          </p>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="space-y-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-mint">Check in</p>
        <div>
          <h1 className="text-3xl font-bold text-ink">{event.title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-700">{event.description}</p>
        </div>
        <div className="space-y-3 text-sm text-slate-700">
          <p className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-mint" />
            {formatDateTime(event.starts_at)} to {formatDateTime(event.ends_at)}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-mint" />
            {event.location}
          </p>
        </div>
      </Card>

      <div className="space-y-5">
        <Card className="space-y-3 bg-slate-50 shadow-none">
          <h2 className="text-lg font-bold text-ink">Before you check in</h2>
          <p className="text-sm leading-6 text-slate-700">
            Your email is used for duplicate handling and organizer-side management. It is not displayed on
            public certificate pages.
          </p>
          <p className="text-sm leading-6 text-slate-700">
            If you check in again with the same email, ProofPass Earn will return your existing proof when possible.
          </p>
        </Card>
        <Card>
        <CheckinForm eventCode={event.checkin_code} />
        </Card>
      </div>
    </PageShell>
  );
}
