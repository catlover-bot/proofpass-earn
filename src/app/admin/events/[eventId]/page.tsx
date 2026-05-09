import Link from "next/link";
import { Award, ExternalLink, LinkIcon, MapPin, Users } from "lucide-react";
import { QrCodePanel } from "@/components/QrCodePanel";
import { SetupError } from "@/components/SetupError";
import { ButtonLink, Card, PageShell, StatusPill } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { getAppUrl, getMissingEnv, getSupabaseClient } from "@/lib/supabase/client";
import { labelRole } from "@/lib/points";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params
}: {
  params: { eventId: string };
}) {
  const missing = getMissingEnv();
  if (missing.length > 0) {
    return (
      <PageShell>
        <SetupError missing={missing} />
      </PageShell>
    );
  }

  const supabase = getSupabaseClient();
  const appUrl = getAppUrl();

  if (!supabase || !appUrl) {
    return (
      <PageShell>
        <SetupError message="Supabase or the app URL is not configured yet." />
      </PageShell>
    );
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id,title,description,location,starts_at,ends_at,checkin_code")
    .eq("id", params.eventId)
    .maybeSingle();

  if (eventError) {
    return (
      <PageShell>
        <SetupError title="Unable to load event" message={eventError.message} />
      </PageShell>
    );
  }

  if (!event) {
    return (
      <PageShell className="space-y-6">
        <Card>
          <h1 className="text-2xl font-bold text-ink">Event not found</h1>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            This event ID does not match an existing event.
          </p>
          <ButtonLink href="/admin/events" className="mt-5" variant="secondary">
            Back to events
          </ButtonLink>
        </Card>
      </PageShell>
    );
  }

  const { data: participants, error: participantsError } = await supabase
    .from("participants")
    .select("id,name,role,checked_in_at")
    .eq("event_id", event.id)
    .order("checked_in_at", { ascending: false });

  if (participantsError) {
    return (
      <PageShell>
        <SetupError title="Unable to load participants" message={participantsError.message} />
      </PageShell>
    );
  }

  const participantIds = participants.map((participant) => participant.id);
  const certificatesByParticipant = new Map<string, { public_slug: string; status: string }>();
  const pointsByParticipant = new Map<string, number>();

  if (participantIds.length > 0) {
    const { data: certificates, error: certificatesError } = await supabase
      .from("certificates")
      .select("participant_id,public_slug,status")
      .eq("event_id", event.id)
      .in("participant_id", participantIds);

    if (certificatesError) {
      return (
        <PageShell>
          <SetupError title="Unable to load certificates" message={certificatesError.message} />
        </PageShell>
      );
    }

    certificates.forEach((certificate) => {
      certificatesByParticipant.set(certificate.participant_id, {
        public_slug: certificate.public_slug,
        status: certificate.status
      });
    });

    const { data: points, error: pointsError } = await supabase
      .from("point_ledger")
      .select("participant_id,points")
      .eq("event_id", event.id)
      .in("participant_id", participantIds);

    if (pointsError) {
      return (
        <PageShell>
          <SetupError title="Unable to load points" message={pointsError.message} />
        </PageShell>
      );
    }

    points.forEach((entry) => {
      pointsByParticipant.set(entry.participant_id, (pointsByParticipant.get(entry.participant_id) ?? 0) + entry.points);
    });
  }

  const checkinUrl = `${appUrl}/checkin/${event.checkin_code}`;

  return (
    <PageShell className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-mint">Event detail</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">{event.title}</h1>
          <p className="mt-2 max-w-3xl text-slate-700">{event.description}</p>
        </div>
        <ButtonLink href="/admin/events" variant="secondary">
          Back to events
        </ButtonLink>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-slate-500">Starts</p>
              <p className="mt-1 text-base font-semibold text-ink">{formatDateTime(event.starts_at)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Ends</p>
              <p className="mt-1 text-base font-semibold text-ink">{formatDateTime(event.ends_at)}</p>
            </div>
          </div>

          <p className="flex items-center gap-2 text-sm text-slate-700">
            <MapPin className="h-4 w-4" />
            {event.location}
          </p>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <LinkIcon className="h-4 w-4" />
              Check-in URL
            </div>
            <p className="mt-2 break-all text-sm font-semibold text-ink">{checkinUrl}</p>
          </div>
        </Card>

        <QrCodePanel value={checkinUrl} />
      </div>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-mint" />
              <h2 className="text-xl font-bold text-ink">Participants</h2>
            </div>
            <p className="mt-2 text-sm text-slate-700">
              Participant email is kept out of this event view for the MVP surface.
            </p>
          </div>
          <StatusPill>{participants.length} checked in</StatusPill>
        </div>

        {participants.length === 0 ? (
          <div className="mt-6 rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <Award className="mx-auto h-8 w-8 text-slate-400" />
            <h3 className="mt-3 text-lg font-bold text-ink">No participants yet</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-700">
              Share the check-in QR code during the event. Participants will appear here after they submit the form.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4 font-semibold">Name</th>
                  <th className="py-3 pr-4 font-semibold">Role</th>
                  <th className="py-3 pr-4 font-semibold">Checked in</th>
                  <th className="py-3 pr-4 font-semibold">Certificate</th>
                  <th className="py-3 pr-4 text-right font-semibold">Points</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => {
                  const certificate = certificatesByParticipant.get(participant.id);
                  const points = pointsByParticipant.get(participant.id) ?? 0;

                  return (
                    <tr key={participant.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-4 pr-4 font-semibold text-ink">{participant.name}</td>
                      <td className="py-4 pr-4 text-slate-700">{labelRole(participant.role)}</td>
                      <td className="py-4 pr-4 text-slate-700">{formatDateTime(participant.checked_in_at)}</td>
                      <td className="py-4 pr-4">
                        {certificate ? (
                          <Link
                            href={`/cert/${certificate.public_slug}`}
                            className="inline-flex items-center gap-2 font-semibold text-mint hover:text-ink"
                          >
                            {certificate.status}
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        ) : (
                          <span className="text-slate-500">Not issued</span>
                        )}
                      </td>
                      <td className="py-4 pr-4 text-right font-bold text-ink">{points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageShell>
  );
}
