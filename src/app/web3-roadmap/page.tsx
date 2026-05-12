import { PublicFooter } from "@/components/PublicFooter";
import { Card, PageShell } from "@/components/ui";

const phases = [
  {
    title: "Today",
    body: "Wallet-free off-chain proof pages for event participation and contribution."
  },
  {
    title: "Next",
    body: "Structured proof metadata for certificate pages, without participant email or sensitive personal data."
  },
  {
    title: "Later",
    body: "Open Badges and Verifiable Credentials support for portable proof records."
  },
  {
    title: "Optional future",
    body: "Non-transferable SBT issuance for selected events, with personal information kept off-chain."
  }
];

export default function Web3RoadmapPage() {
  return (
    <PageShell className="max-w-4xl space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-mint">Roadmap</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Web3 roadmap</h1>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          ProofPass Earn starts with practical off-chain proof and keeps Web3 support optional, non-speculative,
          and privacy-first.
        </p>
      </div>

      <div className="grid gap-4">
        {phases.map((phase) => (
          <Card key={phase.title}>
            <p className="text-sm font-semibold uppercase tracking-wider text-mint">{phase.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{phase.body}</p>
          </Card>
        ))}
      </div>

      <Card className="space-y-3 text-sm leading-6 text-slate-700">
        <h2 className="text-xl font-bold text-ink">Positioning</h2>
        <p>
          There are no speculative tokens, no token exchange, and no financial asset positioning. Any future
          SBT support should represent non-transferable attendance, speaking, or contribution proof only.
        </p>
        <p>No personal information should be placed on-chain.</p>
      </Card>

      <Card className="space-y-3 text-sm leading-6 text-slate-700">
        <h2 className="text-xl font-bold text-ink">Testnet SBT prototype</h2>
        <p>
          A testnet-only prototype can be used for optional experiments with non-transferable proof tokens. This
          is not production minting, not a financial asset, and not required for the current wallet-free MVP.
        </p>
        <p>
          The first manual Base Sepolia mint has been validated with certificate metadata and
          <code className="mx-1 rounded bg-slate-100 px-1 py-0.5 text-xs font-semibold">locked(tokenId)</code>
          returning true.
        </p>
        <p>The app does not include a mint button, wallet login, or client-side wallet connection.</p>
      </Card>

      <PublicFooter />
    </PageShell>
  );
}
