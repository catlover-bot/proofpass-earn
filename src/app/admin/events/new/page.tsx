import { EventForm } from "@/components/EventForm";
import { SetupError } from "@/components/SetupError";
import { ButtonLink, Card, PageShell } from "@/components/ui";
import { getMissingEnv } from "@/lib/supabase/client";

export default function NewEventPage() {
  const missing = getMissingEnv();

  return (
    <PageShell className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-mint">New event</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Create an event</h1>
          <p className="mt-2 max-w-2xl text-slate-700">
            Add event details, then generate a unique QR check-in link.
          </p>
        </div>
        <ButtonLink href="/admin/events" variant="secondary">
          Back to events
        </ButtonLink>
      </div>

      {missing.length > 0 ? (
        <SetupError missing={missing} />
      ) : (
        <Card>
          <EventForm />
        </Card>
      )}
    </PageShell>
  );
}
