import { NextResponse } from "next/server";
import { getAchievementBadge } from "@/lib/achievements";
import { getLanguageFromSearchParams, type Language } from "@/lib/i18n";
import { getCurrentOrganizer, getOrganizerSupabaseClient } from "@/lib/organizer-auth";
import { PROOF_LABEL_KEYS, isProofLabelKey, labelVerificationLevel } from "@/lib/proof-types";
import { getSupabaseClient } from "@/lib/supabase/client";
import { isValidUuid } from "@/lib/validation/uuid";

export const dynamic = "force-dynamic";

type CertificateExportRow = {
  participant_id: string;
  public_slug: string;
  verification_level?: string | null;
};

type BadgeExportRow = {
  participant_id: string;
  badge_type: string;
};

function isMissingVerificationColumn(message: string) {
  return message.includes("verification_level");
}

function csvCell(value: string | number | null | undefined) {
  const normalized = String(value ?? "");

  return `"${normalized.replace(/"/g, '""')}"`;
}

function csvLine(values: Array<string | number | null | undefined>) {
  return values.map(csvCell).join(",");
}

function labelsForCsv(lang: Language, badgeTypes: string[]) {
  return badgeTypes
    .filter(isProofLabelKey)
    .map((badgeType) => getAchievementBadge(lang, badgeType).label)
    .join(" | ");
}

export async function GET(
  request: Request,
  {
    params
  }: {
    params: Promise<{ eventId: string }>;
  }
) {
  const { eventId } = await params;
  const url = new URL(request.url);
  const lang = getLanguageFromSearchParams(url.searchParams);

  if (!isValidUuid(eventId)) {
    return NextResponse.json({ error: "Invalid event id." }, { status: 400 });
  }

  const organizer = await getCurrentOrganizer();
  if (!organizer) {
    return NextResponse.json({ error: "Organizer login is required." }, { status: 401 });
  }

  if (organizer.organizationIds.length === 0) {
    return NextResponse.json({ error: "No organizer organization is available." }, { status: 403 });
  }

  const supabase = getOrganizerSupabaseClient(organizer) ?? getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id,title")
    .eq("id", eventId)
    .in("organization_id", organizer.organizationIds)
    .maybeSingle();

  if (eventError) {
    return NextResponse.json({ error: eventError.message }, { status: 500 });
  }

  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const { data: participants, error: participantError } = await supabase
    .from("participants")
    .select("id,name,email,role,checked_in_at")
    .eq("event_id", event.id)
    .order("checked_in_at", { ascending: false });

  if (participantError) {
    return NextResponse.json({ error: participantError.message }, { status: 500 });
  }

  const participantRows = participants ?? [];
  const participantIds = participantRows.map((participant) => participant.id);
  const certificatesByParticipant = new Map<string, CertificateExportRow>();
  const badgesByParticipant = new Map<string, string[]>();

  if (participantIds.length > 0) {
    const certificateResult = await supabase
      .from("certificates")
      .select("participant_id,public_slug,verification_level")
      .eq("event_id", event.id)
      .in("participant_id", participantIds);

    if (certificateResult.error && !isMissingVerificationColumn(certificateResult.error.message)) {
      return NextResponse.json({ error: certificateResult.error.message }, { status: 500 });
    }

    let certificateRows = (certificateResult.data ?? []) as CertificateExportRow[];

    if (certificateResult.error && isMissingVerificationColumn(certificateResult.error.message)) {
      const fallbackCertificateResult = await supabase
        .from("certificates")
        .select("participant_id,public_slug")
        .eq("event_id", event.id)
        .in("participant_id", participantIds);

      if (fallbackCertificateResult.error) {
        return NextResponse.json({ error: fallbackCertificateResult.error.message }, { status: 500 });
      }

      certificateRows = (fallbackCertificateResult.data ?? []) as CertificateExportRow[];
    }

    certificateRows.forEach((certificate) => {
      certificatesByParticipant.set(certificate.participant_id, certificate);
    });

    const { data: badgeRows, error: badgeError } = await supabase
      .from("badges")
      .select("participant_id,badge_type")
      .in("participant_id", participantIds)
      .in("badge_type", [...PROOF_LABEL_KEYS]);

    if (badgeError) {
      return NextResponse.json({ error: badgeError.message }, { status: 500 });
    }

    ((badgeRows ?? []) as BadgeExportRow[]).forEach((badge) => {
      const existing = badgesByParticipant.get(badge.participant_id) ?? [];

      badgesByParticipant.set(badge.participant_id, [...existing, badge.badge_type]);
    });
  }

  const header = [
    "participant_name",
    "participant_email",
    "role",
    "proof_labels",
    "certificate_slug",
    "checked_in_at",
    "verification_label"
  ];
  const lines = [
    csvLine(header),
    ...participantRows.map((participant) => {
      const certificate = certificatesByParticipant.get(participant.id);
      const verificationLevel = certificate?.verification_level ?? "checkin";

      return csvLine([
        participant.name,
        participant.email,
        participant.role,
        labelsForCsv(lang, badgesByParticipant.get(participant.id) ?? []),
        certificate?.public_slug,
        participant.checked_in_at,
        labelVerificationLevel(lang, verificationLevel)
      ]);
    })
  ];

  return new Response(`\uFEFF${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="proofpass-${event.id}-participants.csv"`,
      "Cache-Control": "no-store"
    }
  });
}
