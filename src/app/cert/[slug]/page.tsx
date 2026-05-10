import { Award, ShieldAlert, ShieldCheck } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { PublicFooter } from "@/components/PublicFooter";
import { SetupError } from "@/components/SetupError";
import { Card, PageShell, StatusPill } from "@/components/ui";
import { formatDate, formatDateTime } from "@/lib/format";
import { labelRole } from "@/lib/points";
import { getAppUrl, getMissingEnv, getSupabaseClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default async function CertificatePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const missing = getMissingEnv();
  if (missing.length > 0) {
    return (
      <PageShell className="space-y-6">
        <SetupError missing={missing} />
        <PublicFooter />
      </PageShell>
    );
  }

  const supabase = getSupabaseClient();
  const appUrl = getAppUrl();
  if (!supabase) {
    return (
      <PageShell className="space-y-6">
        <SetupError message="Supabase is not configured yet." />
        <PublicFooter />
      </PageShell>
    );
  }

  const { data: certificate, error: certificateError } = await supabase
    .from("certificates")
    .select("id,event_id,participant_id,public_slug,certificate_type,status,issued_at")
    .eq("public_slug", slug)
    .maybeSingle();

  if (certificateError) {
    return (
      <PageShell className="space-y-6">
        <SetupError title="Unable to load certificate" message={certificateError.message} />
        <PublicFooter />
      </PageShell>
    );
  }

  if (!certificate) {
    return (
      <PageShell className="space-y-6">
        <Card>
          <h1 className="text-2xl font-bold text-ink">Certificate not found</h1>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            This proof URL does not match a public certificate.
          </p>
        </Card>
        <PublicFooter />
      </PageShell>
    );
  }

  const [{ data: event, error: eventError }, { data: participant, error: participantError }] =
    await Promise.all([
      supabase
        .from("events")
        .select("title,starts_at,ends_at,location")
        .eq("id", certificate.event_id)
        .maybeSingle(),
      supabase.from("participants").select("name,role").eq("id", certificate.participant_id).maybeSingle()
    ]);

  if (eventError || participantError) {
    return (
      <PageShell className="space-y-6">
        <SetupError
          title="Unable to load certificate details"
          message={eventError?.message ?? participantError?.message}
        />
        <PublicFooter />
      </PageShell>
    );
  }

  if (!event || !participant) {
    return (
      <PageShell className="space-y-6">
        <Card>
          <h1 className="text-2xl font-bold text-ink">Certificate details unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            The proof record exists, but its linked event or participant is missing.
          </p>
        </Card>
        <PublicFooter />
      </PageShell>
    );
  }

  const revoked = certificate.status === "revoked";
  const proofUrl = `${appUrl}/cert/${certificate.public_slug}`;
  const metadataUrl = `${proofUrl}/metadata`;

  return (
    <PageShell className="max-w-4xl space-y-6">
      <Card className={revoked ? "border-red-200 bg-red-50" : "border-mint/30"}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className={revoked ? "rounded-md bg-red-100 p-3 text-red-700" : "rounded-md bg-mint/10 p-3 text-mint"}>
                {revoked ? <ShieldAlert className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Public proof</p>
                <h1 className="text-3xl font-bold text-ink">{event.title}</h1>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">Participant</p>
              <p className="mt-1 text-2xl font-bold text-ink">{participant.name}</p>
            </div>
          </div>

          <StatusPill tone={revoked ? "danger" : "success"}>{certificate.status}</StatusPill>
        </div>

        {revoked ? (
          <div className="mt-6 rounded-md border border-red-200 bg-white p-4 text-sm font-medium text-red-700">
            This proof has been revoked by the issuer and should not be treated as valid.
          </div>
        ) : null}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <Award className="h-6 w-6 text-gold" />
          <p className="mt-4 text-sm font-semibold text-slate-500">Certificate type</p>
          <p className="mt-1 text-xl font-bold text-ink">{labelRole(certificate.certificate_type)}</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-slate-500">Participant role</p>
          <p className="mt-1 text-xl font-bold text-ink">{labelRole(participant.role)}</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-slate-500">Event date</p>
          <p className="mt-1 text-xl font-bold text-ink">{formatDate(event.starts_at)}</p>
          <p className="mt-2 text-sm text-slate-600">{event.location}</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-slate-500">Issued at</p>
          <p className="mt-1 text-xl font-bold text-ink">{formatDateTime(certificate.issued_at)}</p>
        </Card>
      </div>

      <Card>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-slate-500">Issuer</dt>
            <dd className="mt-1 font-bold text-ink">ProofPass Earn organizer</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-500">Proof ID</dt>
            <dd className="mt-1 break-all font-bold text-ink">{certificate.public_slug}</dd>
          </div>
        </dl>
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">Proof URL</p>
          <p className="mt-2 break-all text-sm font-bold text-ink">{proofUrl}</p>
        </div>
        <CopyButton value={proofUrl} label="Copy proof URL" copiedLabel="Proof URL copied" />
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-mint">Web3-ready</p>
          <h2 className="mt-2 text-xl font-bold text-ink">Proof metadata</h2>
        </div>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-slate-500">Current proof type</dt>
            <dd className="mt-1 font-bold text-ink">Off-chain public proof</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-500">Web3 status</dt>
            <dd className="mt-1 font-bold text-ink">SBT-ready metadata available</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-semibold text-slate-500">Metadata URL</dt>
            <dd className="mt-1 break-all font-bold text-mint">
              <a href={metadataUrl}>{metadataUrl}</a>
            </dd>
          </div>
        </dl>
        <p className="text-sm leading-6 text-slate-700">
          This proof is not minted on-chain. Future versions may support optional non-transferable SBT issuance
          without placing personal information on-chain.
        </p>
      </Card>

      <Card className="bg-slate-50 shadow-none">
        <p className="text-sm font-semibold text-slate-700">
          This public proof page does not display participant email.
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          This proof represents event participation or contribution. It is not a financial asset.
        </p>
      </Card>

      <PublicFooter />
    </PageShell>
  );
}
