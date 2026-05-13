import type { ParticipantRole } from "@/lib/supabase/types";

export const ROLE_ACHIEVEMENT_WEIGHT: Record<ParticipantRole, number> = {
  attendee: 10,
  speaker: 50,
  contributor: 30,
  organizer: 40
};

export function labelRole(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
