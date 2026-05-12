import { PublicFooter } from "@/components/PublicFooter";
import { Card, PageShell } from "@/components/ui";

export default function TermsPage() {
  return (
    <PageShell className="max-w-4xl space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-mint">Terms</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Pilot terms</h1>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          ProofPass Earn is a pilot service for event proof and contribution records.
        </p>
      </div>

      <Card className="space-y-4 text-sm leading-6 text-slate-700">
        <p>
          Proof pages are participation and contribution records. They are not financial assets, investment
          products, payment instruments, tradable rewards, or token exchange items.
        </p>
        <p>
          The service has no token exchange, no payment flow, and no investment product. Organizers are
          responsible for using the service appropriately for their events.
        </p>
        <p>
          Public proof URLs may be accessible to anyone with the link. The service may change during the pilot
          phase as organizer and participant feedback is reviewed.
        </p>
        <p>
          Future SBT support, if added, should be optional and non-transferable. Personal information should not
          be placed on-chain.
        </p>
      </Card>

      <PublicFooter />
    </PageShell>
  );
}
