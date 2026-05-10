import { PublicFooter } from "@/components/PublicFooter";
import { Card, PageShell } from "@/components/ui";

const collectedData = [
  "Participant name",
  "Participant email",
  "Selected role",
  "Event participation proof",
  "Check-in timestamp"
];

export default function PrivacyPage() {
  return (
    <PageShell className="max-w-4xl space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-mint">Privacy</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Privacy notice</h1>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          ProofPass Earn is currently for pilot and testing use by event organizers and participants.
        </p>
      </div>

      <Card className="space-y-4">
        <h2 className="text-xl font-bold text-ink">Data collected</h2>
        <ul className="space-y-2 text-sm text-slate-700">
          {collectedData.map((item) => (
            <li key={item} className="rounded-md bg-slate-50 px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-3 text-sm leading-6 text-slate-700">
        <h2 className="text-xl font-bold text-ink">How participant email is used</h2>
        <p>
          Participant email is used for organizer-side management and duplicate handling. It is not shown on
          public certificate pages.
        </p>
        <p>
          Public proof URLs may be accessible to anyone with the link. Participants can contact the event
          organizer to request correction or removal.
        </p>
      </Card>

      <PublicFooter />
    </PageShell>
  );
}
