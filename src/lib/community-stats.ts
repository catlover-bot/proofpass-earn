import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { PROOF_LABEL_KEYS, isProofLabelKey } from "@/lib/proof-types";
import type { Database } from "@/lib/supabase/types";

export const COMMUNITY_PROOF_LABEL_KEYS = ["participation", ...PROOF_LABEL_KEYS] as const;
export type CommunityProofLabelKey = (typeof COMMUNITY_PROOF_LABEL_KEYS)[number];

export type CommunityAchievements = {
  organization: {
    id: string;
    name: string;
  };
  stats: {
    totalEvents: number;
    totalParticipants: number;
    totalProofs: number;
    organizerConfirmedProofs: number;
    qrCheckinProofs: number;
  };
  proofLabelCounts: Record<CommunityProofLabelKey, number>;
  recentEvents: CommunityRecentEvent[];
  recentProofs: CommunityRecentProof[];
  usedPublicViews: boolean;
};

export type CommunityRecentEvent = {
  id: string;
  title: string;
  startsAt: string;
  checkinCode: string;
  checkinMode: "public" | "invite_only";
  participantCount: number;
  proofCount: number;
};

export type CommunityRecentProof = {
  id: string;
  publicSlug: string;
  participantName: string;
  eventTitle: string;
  proofLabel: CommunityProofLabelKey;
  certificateType: string;
  verificationLevel: string;
  approvalStatus: string;
  issuedAt: string;
};

type CommunityLoadOutcome = {
  data: CommunityAchievements | null;
  error: PostgrestError | Error | null;
  publicViewsMissing?: boolean;
};

type SafeEventRecord = {
  id: string;
  title: string;
  starts_at: string;
  checkin_code: string;
  checkin_mode: "public" | "invite_only";
};

type LegacySafeEventRecord = Omit<SafeEventRecord, "checkin_mode">;

type SafeParticipantRecord = {
  id: string;
  event_id: string;
  name: string;
};

type SafeCertificateRecord = {
  id: string;
  event_id: string;
  participant_id: string;
  public_slug: string;
  certificate_type: string;
  verification_level: string;
  approval_status: string;
  status: string;
  issued_at: string;
};

type LegacySafeCertificateRecord = Omit<SafeCertificateRecord, "verification_level" | "approval_status">;

type SafeBadgeRecord = {
  participant_id: string;
  badge_type: string;
};

function emptyProofLabelCounts() {
  return COMMUNITY_PROOF_LABEL_KEYS.reduce(
    (counts, key) => ({
      ...counts,
      [key]: 0
    }),
    {} as Record<CommunityProofLabelKey, number>
  );
}

function isMissingPublicViewError(error: PostgrestError | Error | null) {
  const message = error?.message ?? "";
  const code = "code" in (error ?? {}) ? (error as PostgrestError).code : undefined;

  return (
    code === "42P01" ||
    code === "PGRST106" ||
    code === "PGRST205" ||
    message.includes("Could not find the table") ||
    message.includes("schema cache") ||
    message.includes("community_public_")
  );
}

function isMissingOptionalCertificateColumn(error: { message?: string } | null | undefined) {
  const message = error?.message ?? "";

  return message.includes("verification_level") || message.includes("approval_status");
}

function normalizeCheckinMode(value: string | null | undefined): "public" | "invite_only" {
  return value === "invite_only" ? "invite_only" : "public";
}

function normalizeVerificationLevel(value: string | null | undefined) {
  return value || "checkin";
}

function normalizeApprovalStatus(value: string | null | undefined) {
  return value || "approved";
}

function labelKeyForProof(
  proofLabel: string | null | undefined,
  certificateType: string | null | undefined
): CommunityProofLabelKey {
  if (isProofLabelKey(proofLabel)) {
    return proofLabel;
  }

  switch (certificateType) {
    case "speaking":
    case "speaker":
      return "speaker";
    case "contribution":
    case "contributor":
      return "contributor";
    default:
      return "participation";
  }
}

function isOrganizerConfirmed(verificationLevel: string | null | undefined) {
  return normalizeVerificationLevel(verificationLevel) !== "checkin";
}

function sortByNewestDate<T>(items: T[], getDate: (item: T) => string) {
  return [...items].sort((a, b) => new Date(getDate(b)).getTime() - new Date(getDate(a)).getTime());
}

async function loadFromPublicViews(
  supabase: SupabaseClient<Database>,
  organizationId: string
): Promise<CommunityLoadOutcome> {
  const { data: organization, error: organizationError } = await supabase
    .from("community_public_organizations")
    .select("id,name")
    .eq("id", organizationId)
    .maybeSingle();

  if (organizationError) {
    return {
      data: null,
      error: organizationError,
      publicViewsMissing: isMissingPublicViewError(organizationError)
    };
  }

  if (!organization) {
    return { data: null, error: null };
  }

  const [eventsResult, proofsResult, labelCountsResult] = await Promise.all([
    supabase
      .from("community_public_events")
      .select("id,title,starts_at,checkin_code,checkin_mode,participant_count,proof_count")
      .eq("organization_id", organizationId)
      .order("starts_at", { ascending: false }),
    supabase
      .from("community_public_proofs")
      .select(
        "id,public_slug,participant_name,event_title,proof_label,certificate_type,verification_level,approval_status,issued_at"
      )
      .eq("organization_id", organizationId)
      .order("issued_at", { ascending: false }),
    supabase
      .from("community_public_label_counts")
      .select("proof_label,proof_count")
      .eq("organization_id", organizationId)
  ]);

  const firstError = eventsResult.error ?? proofsResult.error ?? labelCountsResult.error;
  if (firstError) {
    return {
      data: null,
      error: firstError,
      publicViewsMissing: isMissingPublicViewError(firstError)
    };
  }

  const events = eventsResult.data ?? [];
  const proofs = proofsResult.data ?? [];
  const proofLabelCounts = emptyProofLabelCounts();

  (labelCountsResult.data ?? []).forEach((row) => {
    const key = labelKeyForProof(row.proof_label, null);
    proofLabelCounts[key] = Number(row.proof_count ?? 0);
  });

  return {
    data: {
      organization,
      stats: {
        totalEvents: events.length,
        totalParticipants: events.reduce((total, event) => total + Number(event.participant_count ?? 0), 0),
        totalProofs: proofs.length,
        organizerConfirmedProofs: proofs.filter((proof) => isOrganizerConfirmed(proof.verification_level)).length,
        qrCheckinProofs: proofs.filter((proof) => normalizeVerificationLevel(proof.verification_level) === "checkin").length
      },
      proofLabelCounts,
      recentEvents: events.slice(0, 6).map((event) => ({
        id: event.id,
        title: event.title,
        startsAt: event.starts_at,
        checkinCode: event.checkin_code,
        checkinMode: normalizeCheckinMode(event.checkin_mode),
        participantCount: Number(event.participant_count ?? 0),
        proofCount: Number(event.proof_count ?? 0)
      })),
      recentProofs: proofs.slice(0, 8).map((proof) => ({
        id: proof.id,
        publicSlug: proof.public_slug,
        participantName: proof.participant_name,
        eventTitle: proof.event_title,
        proofLabel: labelKeyForProof(proof.proof_label, proof.certificate_type),
        certificateType: proof.certificate_type,
        verificationLevel: normalizeVerificationLevel(proof.verification_level),
        approvalStatus: normalizeApprovalStatus(proof.approval_status),
        issuedAt: proof.issued_at
      })),
      usedPublicViews: true
    },
    error: null
  };
}

async function loadFromTables(
  supabase: SupabaseClient<Database>,
  organizationId: string
): Promise<CommunityLoadOutcome> {
  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("id,name")
    .eq("id", organizationId)
    .maybeSingle();

  if (organizationError || !organization) {
    return { data: null, error: organizationError };
  }

  const eventsResult = await supabase
    .from("events")
    .select("id,title,starts_at,checkin_code,checkin_mode")
    .eq("organization_id", organizationId)
    .order("starts_at", { ascending: false });
  let eventRows = eventsResult.data as Array<SafeEventRecord | LegacySafeEventRecord> | null;
  let eventError = eventsResult.error;

  if (eventError && eventError.message.includes("checkin_mode")) {
    const fallbackEventsResult = await supabase
      .from("events")
      .select("id,title,starts_at,checkin_code")
      .eq("organization_id", organizationId)
      .order("starts_at", { ascending: false });

    eventRows = fallbackEventsResult.data as LegacySafeEventRecord[] | null;
    eventError = fallbackEventsResult.error;
  }

  if (eventError) {
    return { data: null, error: eventError };
  }

  const events = (eventRows ?? []).map((event) => ({
    ...event,
    checkin_mode: normalizeCheckinMode("checkin_mode" in event ? event.checkin_mode : "public")
  })) as SafeEventRecord[];
  const eventIds = events.map((event) => event.id);
  let participants: SafeParticipantRecord[] = [];
  let certificates: SafeCertificateRecord[] = [];
  let badges: SafeBadgeRecord[] = [];

  if (eventIds.length > 0) {
    const participantsResult = await supabase
      .from("participants")
      .select("id,event_id,name")
      .in("event_id", eventIds)
      .order("checked_in_at", { ascending: false });

    if (participantsResult.error) {
      return { data: null, error: participantsResult.error };
    }

    participants = participantsResult.data ?? [];

    const certificatesResult = await supabase
      .from("certificates")
      .select("id,event_id,participant_id,public_slug,certificate_type,verification_level,approval_status,status,issued_at")
      .in("event_id", eventIds)
      .eq("status", "valid")
      .order("issued_at", { ascending: false });
    let certificateRows = certificatesResult.data as Array<SafeCertificateRecord | LegacySafeCertificateRecord> | null;
    let certificateError = certificatesResult.error;

    if (certificateError && isMissingOptionalCertificateColumn(certificateError)) {
      const fallbackCertificatesResult = await supabase
        .from("certificates")
        .select("id,event_id,participant_id,public_slug,certificate_type,status,issued_at")
        .in("event_id", eventIds)
        .eq("status", "valid")
        .order("issued_at", { ascending: false });

      certificateRows = fallbackCertificatesResult.data as LegacySafeCertificateRecord[] | null;
      certificateError = fallbackCertificatesResult.error;
    }

    if (certificateError) {
      return { data: null, error: certificateError };
    }

    certificates = (certificateRows ?? []).map((certificate) => ({
      ...certificate,
      verification_level: "verification_level" in certificate ? certificate.verification_level : "checkin",
      approval_status: "approval_status" in certificate ? certificate.approval_status : "approved"
    }));

    const participantIds = participants.map((participant) => participant.id);
    if (participantIds.length > 0) {
      const badgesResult = await supabase
        .from("badges")
        .select("participant_id,badge_type")
        .in("participant_id", participantIds)
        .in("badge_type", [...PROOF_LABEL_KEYS]);

      if (badgesResult.error) {
        return { data: null, error: badgesResult.error };
      }

      badges = badgesResult.data ?? [];
    }
  }

  const participantCountsByEvent = new Map<string, number>();
  const proofCountsByEvent = new Map<string, number>();
  const participantsById = new Map(participants.map((participant) => [participant.id, participant]));
  const eventsById = new Map(events.map((event) => [event.id, event]));
  const labelsByParticipant = new Map<string, string[]>();
  const proofLabelCounts = emptyProofLabelCounts();

  participants.forEach((participant) => {
    participantCountsByEvent.set(participant.event_id, (participantCountsByEvent.get(participant.event_id) ?? 0) + 1);
  });

  badges.forEach((badge) => {
    const current = labelsByParticipant.get(badge.participant_id) ?? [];
    labelsByParticipant.set(badge.participant_id, [...current, badge.badge_type]);
  });

  certificates.forEach((certificate) => {
    proofCountsByEvent.set(certificate.event_id, (proofCountsByEvent.get(certificate.event_id) ?? 0) + 1);
    const label = labelKeyForProof(labelsByParticipant.get(certificate.participant_id)?.[0], certificate.certificate_type);
    proofLabelCounts[label] += 1;
  });

  const recentProofs = sortByNewestDate(certificates, (certificate) => certificate.issued_at)
    .map((certificate) => {
      const participant = participantsById.get(certificate.participant_id);
      const event = eventsById.get(certificate.event_id);

      if (!participant || !event) {
        return null;
      }

      return {
        id: certificate.id,
        publicSlug: certificate.public_slug,
        participantName: participant.name,
        eventTitle: event.title,
        proofLabel: labelKeyForProof(labelsByParticipant.get(certificate.participant_id)?.[0], certificate.certificate_type),
        certificateType: certificate.certificate_type,
        verificationLevel: normalizeVerificationLevel(certificate.verification_level),
        approvalStatus: normalizeApprovalStatus(certificate.approval_status),
        issuedAt: certificate.issued_at
      };
    })
    .filter((proof): proof is CommunityRecentProof => Boolean(proof))
    .slice(0, 8);

  return {
    data: {
      organization,
      stats: {
        totalEvents: events.length,
        totalParticipants: participants.length,
        totalProofs: certificates.length,
        organizerConfirmedProofs: certificates.filter((certificate) => isOrganizerConfirmed(certificate.verification_level)).length,
        qrCheckinProofs: certificates.filter((certificate) => normalizeVerificationLevel(certificate.verification_level) === "checkin").length
      },
      proofLabelCounts,
      recentEvents: events.slice(0, 6).map((event) => ({
        id: event.id,
        title: event.title,
        startsAt: event.starts_at,
        checkinCode: event.checkin_code,
        checkinMode: event.checkin_mode,
        participantCount: participantCountsByEvent.get(event.id) ?? 0,
        proofCount: proofCountsByEvent.get(event.id) ?? 0
      })),
      recentProofs,
      usedPublicViews: false
    },
    error: null
  };
}

export async function getCommunityAchievements(
  supabase: SupabaseClient<Database>,
  organizationId: string
): Promise<CommunityLoadOutcome> {
  const publicViewOutcome = await loadFromPublicViews(supabase, organizationId);

  if (publicViewOutcome.data || !publicViewOutcome.error) {
    return publicViewOutcome;
  }

  const tableOutcome = isMissingPublicViewError(publicViewOutcome.error)
    ? await loadFromTables(supabase, organizationId)
    : publicViewOutcome;

  return {
    ...tableOutcome,
    publicViewsMissing: isMissingPublicViewError(publicViewOutcome.error)
  };
}
