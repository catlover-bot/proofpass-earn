import { BadgeCheck, CalendarDays, MapPin, ShieldCheck } from "lucide-react";
import { CheckinForm } from "@/components/CheckinForm";
import { SetupError } from "@/components/SetupError";
import { Card, PageShell, StatusPill } from "@/components/ui";
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
    <PageShell className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
      <Card className="space-y-5 shadow-lift">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-mint">Check in</p>
          <StatusPill tone="success">Wallet-free</StatusPill>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-ink">Check in to receive your proof</h1>
          <p className="mt-3 text-xl font-bold text-slate-800">{event.title}</p>
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
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm leading-6 text-slate-700">
          <p className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
            Enter your name and email. Your email is used by the organizer and is not shown on the public proof page.
          </p>
        </div>
      </Card>

      <div className="space-y-5">
        <Card className="space-y-3 bg-paper/80 shadow-none">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-mint" />
            <h2 className="text-lg font-bold text-ink">Before you check in</h2>
          </div>
          <p className="text-sm leading-6 text-slate-700">
            Duplicate check-ins with the same email return the existing proof when possible.
          </p>
          <p className="text-sm leading-6 text-slate-700">
            Choose the role that best matches how you participated. Points are shown for organizer summaries
            during the pilot.
          </p>
        </Card>
        <Card className="shadow-lift">
          <CheckinForm eventCode={event.checkin_code} />
        </Card>
      </div>
    </PageShell>
  );
}
