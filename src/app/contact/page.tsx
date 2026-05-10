import { PublicFooter } from "@/components/PublicFooter";
import { Card, PageShell } from "@/components/ui";

export default function ContactPage() {
  return (
    <PageShell className="max-w-4xl space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-mint">Contact</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Contact</h1>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          For event-specific questions, contact the event organizer.
        </p>
      </div>

      <Card className="space-y-3 text-sm leading-6 text-slate-700">
        <h2 className="text-xl font-bold text-ink">Pilot feedback</h2>
        <p>Contact the ProofPass Earn team or the event organizer.</p>
      </Card>

      <PublicFooter />
    </PageShell>
  );
}
