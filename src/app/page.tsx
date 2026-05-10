import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  CalendarDays,
  ClipboardCheck,
  Layers3,
  QrCode,
  ShieldCheck,
  Users
} from "lucide-react";
import { PublicFooter } from "@/components/PublicFooter";
import { ButtonLink, Card, PageShell } from "@/components/ui";

const proofTypes = [
  "Attendance",
  "Speaker",
  "Contributor",
  "Organizer"
];

const personas = [
  "Study group organizers",
  "Research event organizers",
  "Hackathon organizers",
  "Technical community managers"
];

export default function Home() {
  return (
    <PageShell className="space-y-16 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-ink">
          <BadgeCheck className="h-6 w-6 text-mint" />
          ProofPass Earn
        </Link>
        <nav className="flex items-center gap-3 text-sm font-semibold text-slate-700">
          <Link href="/admin" className="hover:text-ink">
            Admin
          </Link>
          <Link href="/admin/events" className="hover:text-ink">
            Events
          </Link>
        </nav>
      </header>

      <section className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-mint/30 bg-white px-3 py-1 text-sm font-semibold text-mint">
            <ShieldCheck className="h-4 w-4" />
            Off-chain proof for real communities
          </div>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-4xl font-bold tracking-normal text-ink sm:text-5xl">
              Digital proof and contribution tracking for research events.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-700">
              ProofPass Earn helps organizers create events, run QR check-in, issue public proof pages,
              and assign role-based points without speculative crypto positioning.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/admin/events/new">
              Create an event
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/admin/events" variant="secondary">
              View events
            </ButtonLink>
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
                <div key={type} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-500">Proof</p>
                  <p className="mt-1 text-lg font-bold text-ink">{type}</p>
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
            Issue public certificate pages for attendance, speaker, contributor, and organizer records.
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

      <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="text-2xl font-bold text-ink">Built for organizers who need practical proof.</h2>
          <p className="mt-4 text-sm leading-6 text-slate-700">
            The MVP is designed for communities that need clear records now and may add non-transferable
            proof layers later.
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
        <div className="grid gap-6 md:grid-cols-[0.7fr_1.3fr]">
          <div className="flex items-start gap-3">
            <CalendarDays className="h-6 w-6 text-mint" />
            <div>
              <h2 className="text-xl font-bold text-ink">SBT-ready direction</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Future support can add non-transferable proof records, but the current product keeps all
                points, badges, and certificates off-chain.
              </p>
            </div>
          </div>
          <p className="text-sm leading-6 text-slate-700">
            ProofPass Earn is not a token exchange, payment product, wallet experience, or speculative crypto
            application. It is a practical operating layer for event proof, participant records, and community
            contribution tracking.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="grid gap-6 md:grid-cols-[0.7fr_1.3fr]">
          <div className="flex items-start gap-3">
            <Layers3 className="h-6 w-6 text-mint" />
            <div>
              <h2 className="text-xl font-bold text-ink">Web3-ready, not speculative</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                No wallet is required today. Future optional SBTs should be non-transferable proof of attendance,
                speaking, or contribution.
              </p>
            </div>
          </div>
          <p className="text-sm leading-6 text-slate-700">
            ProofPass Earn has no tradable tokens, no payments, and no investment product. Personal information
            should stay off-chain, including in any future proof metadata or SBT flow.
          </p>
        </div>
      </section>

      <PublicFooter />
    </PageShell>
  );
}
