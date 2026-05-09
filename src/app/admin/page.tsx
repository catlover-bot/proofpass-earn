import { ArrowRight, CalendarDays } from "lucide-react";
import { ButtonLink, Card, PageShell } from "@/components/ui";

export default function AdminPage() {
  return (
    <PageShell className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-mint">Admin</p>
        <h1 className="text-3xl font-bold text-ink">ProofPass Earn dashboard</h1>
        <p className="max-w-2xl text-slate-700">
          Manage events, create check-in links, and review participant proof status.
        </p>
      </div>

      <Card>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-md bg-mint/10 p-3 text-mint">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-ink">Event management</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Create events, display QR check-in links, and inspect participants.
              </p>
            </div>
          </div>
          <ButtonLink href="/admin/events">
            Open events
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </Card>
    </PageShell>
  );
}
