import { BadgeCheck } from "lucide-react";
import { Card, PageShell } from "@/components/ui";

export default function ProfilePlaceholderPage({
  params
}: {
  params: { emailHash: string };
}) {
  return (
    <PageShell className="max-w-3xl space-y-6">
      <Card>
        <div className="flex items-start gap-4">
          <div className="rounded-md bg-mint/10 p-3 text-mint">
            <BadgeCheck className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-mint">Public profile</p>
            <h1 className="mt-2 text-3xl font-bold text-ink">Proof profile placeholder</h1>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              This MVP does not expose raw email addresses or searchable participant identity data on public
              profile pages.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <p className="text-sm font-semibold text-slate-500">Profile key</p>
        <p className="mt-2 break-all text-sm font-bold text-ink">{params.emailHash}</p>
        <div className="mt-6 rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <h2 className="text-lg font-bold text-ink">No public proofs available</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-700">
            Richer public profiles, privacy controls, and verified proof collections are planned for a later
            release.
          </p>
        </div>
      </Card>
    </PageShell>
  );
}
