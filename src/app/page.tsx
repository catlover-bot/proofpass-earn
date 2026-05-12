import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  ClipboardCheck,
  Layers3,
  QrCode,
  ShieldCheck,
  Users
} from "lucide-react";
import { PublicFooter } from "@/components/PublicFooter";
import { ButtonLink, Card, PageShell, StatusPill } from "@/components/ui";

const proofTypes = [
  {
    title: "Attendee",
    body: "Confirm someone joined a study session, meetup, workshop, or hackathon."
  },
  {
    title: "Speaker",
    body: "Recognize talks, demos, lectures, and research presentations."
  },
  {
    title: "Contributor",
    body: "Record help with projects, notes, code, review, logistics, or community work."
  },
  {
    title: "Organizer",
    body: "Give organizers a public record for planning and running the event."
  }
];

const personas = [
  "Research events",
  "Study groups",
  "Hackathons",
  "Community meetups",
  "Internal workshops"
];

const steps = [
  {
    title: "Create an event",
    body: "Add the title, schedule, and location participants will recognize."
  },
  {
    title: "Share the QR code",
    body: "Display the QR code at the venue or paste the check-in link into your meeting chat."
  },
  {
    title: "Participants receive proof pages",
    body: "Each participant gets a public proof URL they can save or share."
  }
];

const reasons = [
  "Avoid manual attendance lists",
  "Give participants a shareable proof URL",
  "Keep participant email off public pages",
  "Prepare for future badge/SBT experiments"
];

export default function Home() {
  return (
    <PageShell className="space-y-14 py-8 sm:space-y-16 sm:py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-ink">
          <BadgeCheck className="h-6 w-6 text-mint" />
          ProofPass Earn
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-700">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <Link href="/admin/events" className="hover:text-ink">
            Events
          </Link>
          <Link href="/cert/proof_xZ0Nb0iY9yMUf1" className="hover:text-ink">
            Demo proof
          </Link>
          <Link href="/web3-roadmap" className="hover:text-ink">
            Web3 roadmap
          </Link>
        </nav>
      </header>

      <section className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-mint/30 bg-white px-3 py-1 text-sm font-semibold text-mint shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            No wallet required
          </div>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-4xl font-bold tracking-normal text-ink sm:text-5xl lg:text-6xl">
              QR check-in and proof pages for community events
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-700">
              Create an event, share a QR check-in, and issue public participation proofs without requiring
              participants to use a wallet.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/admin/events/new">
              Create an event
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/cert/proof_xZ0Nb0iY9yMUf1" variant="secondary">
              View demo proof
            </ButtonLink>
            <Link href="/web3-roadmap" className="inline-flex min-h-10 items-center text-sm font-semibold text-mint hover:text-ink">
              How Web3 support works
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Live event</p>
                <h2 className="mt-1 text-xl font-bold text-ink">Research Systems Night</h2>
              </div>
              <QrCode className="h-8 w-8 text-mint" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {proofTypes.map((type) => (
                <div key={type.title} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-500">Proof</p>
                  <p className="mt-1 text-lg font-bold text-ink">{type.title}</p>
                </div>
              ))}
            </div>

            <div className="rounded-md bg-ink p-4 text-white">
              <p className="text-sm font-semibold text-white/70">Participant proof URL</p>
              <p className="mt-2 break-all text-sm">/cert/proof_7mP3sQ1kA9r2Lz</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <Card key={step.title} className="relative overflow-hidden">
            <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-mint/10 text-sm font-bold text-mint">
              {index + 1}
            </div>
            <h2 className="text-xl font-bold text-ink">{step.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{step.body}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <Card>
          <QrCode className="h-7 w-7 text-mint" />
          <h2 className="mt-5 text-xl font-bold text-ink">QR check-in</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            Generate an event-specific URL, display it as a QR code, and let participants submit their
            name, email, and role.
          </p>
        </Card>
        <Card>
          <Award className="h-7 w-7 text-gold" />
          <h2 className="mt-5 text-xl font-bold text-ink">Public proof pages</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            Issue public proof pages for attendees, speakers, contributors, and organizers.
          </p>
        </Card>
        <Card>
          <ClipboardCheck className="h-7 w-7 text-sky-600" />
          <h2 className="mt-5 text-xl font-bold text-ink">Points and badges</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            Track off-chain contribution points for community reputation and future recognition workflows.
          </p>
        </Card>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-mint">Proof types</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">Recognize the roles that make events work.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {proofTypes.map((type) => (
            <Card key={type.title} className="p-5">
              <StatusPill tone="success">{type.title}</StatusPill>
              <p className="mt-4 text-sm leading-6 text-slate-700">{type.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="text-2xl font-bold text-ink">Made for real event formats.</h2>
          <p className="mt-4 text-sm leading-6 text-slate-700">
            ProofPass Earn fits the small and medium events where attendance and contribution records are
            useful after the session ends.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {personas.map((persona) => (
            <div key={persona} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-4">
              <Users className="h-5 w-5 text-mint" />
              <span className="text-sm font-semibold text-slate-800">{persona}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="flex items-start gap-3">
            <Layers3 className="h-6 w-6 text-mint" />
            <div>
              <h2 className="text-xl font-bold text-ink">Why use this?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Replace scattered attendance notes with proof pages participants can keep, share, and verify.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {reasons.map((point) => (
              <div key={point} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-ink">{point}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-5 text-sm leading-6 text-slate-700">
          Advanced: proofs can include structured metadata and optional Base Sepolia testnet SBT records for pilots.
          The default participant flow stays wallet-free.
        </p>
      </section>

      <PublicFooter />
    </PageShell>
  );
}
