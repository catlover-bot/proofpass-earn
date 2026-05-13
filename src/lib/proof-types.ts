import type { Language } from "@/lib/i18n";
import type { CertificateType, ParticipantRole } from "@/lib/supabase/types";

export const ROLE_CERTIFICATE_TYPE: Record<ParticipantRole, CertificateType> = {
  attendee: "attendance",
  speaker: "speaking",
  contributor: "contribution",
  organizer: "organizing"
};

const proofTypeLabels = {
  en: {
    attendance: "Attendance proof",
    speaking: "Speaker proof",
    contribution: "Contribution proof",
    organizing: "Organizer proof",
    speaker: "Speaker proof",
    contributor: "Contribution proof",
    organizer: "Organizer proof"
  },
  ja: {
    attendance: "参加証明",
    speaking: "登壇証明",
    contribution: "貢献証明",
    organizing: "主催証明",
    speaker: "登壇証明",
    contributor: "貢献証明",
    organizer: "主催証明"
  }
} satisfies Record<Language, Record<CertificateType, string>>;

export function labelProofType(lang: Language, certificateType: string) {
  const labels: Record<string, string> = proofTypeLabels[lang];

  return labels[certificateType] ?? certificateType.charAt(0).toUpperCase() + certificateType.slice(1);
}
