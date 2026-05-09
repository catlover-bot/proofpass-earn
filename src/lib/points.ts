import type { CertificateType, ParticipantRole } from "@/lib/supabase/types";

export const ROLE_POINTS: Record<ParticipantRole, number> = {
  attendee: 10,
  speaker: 50,
  contributor: 100,
  organizer: 100
};

export const ROLE_CERTIFICATE_TYPE: Record<ParticipantRole, CertificateType> = {
  attendee: "attendance",
  speaker: "speaker",
  contributor: "contributor",
  organizer: "organizer"
};

export function labelRole(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
