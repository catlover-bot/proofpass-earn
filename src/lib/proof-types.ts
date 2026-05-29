import type { Language } from "@/lib/i18n";
import type {
  CertificateApprovalStatus,
  CertificateType,
  CertificateVerificationLevel,
  ParticipantRole
} from "@/lib/supabase/types";

export const ROLE_CERTIFICATE_TYPE: Record<ParticipantRole, CertificateType> = {
  attendee: "attendance",
  speaker: "speaking",
  contributor: "contribution",
  organizer: "organizing"
};

export const PROOF_LABEL_KEYS = ["speaker", "contributor", "supporter", "mentor", "winner"] as const;
export type ProofLabelKey = (typeof PROOF_LABEL_KEYS)[number];

export const PROOF_LABEL_CERTIFICATE_TYPE: Record<ProofLabelKey, CertificateType> = {
  speaker: "speaking",
  contributor: "contribution",
  supporter: "attendance",
  mentor: "attendance",
  winner: "attendance"
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

const verificationLevelLabels = {
  en: {
    checkin: "QR participation confirmed",
    organizer_approved: "Organizer confirmed",
    evidence_verified: "Evidence checked",
    onchain_sbt: "Digital proof saved"
  },
  ja: {
    checkin: "QRで参加確認済み",
    organizer_approved: "主催者が確認済み",
    evidence_verified: "提出内容を確認済み",
    onchain_sbt: "デジタル証明として保存済み"
  }
} satisfies Record<Language, Record<CertificateVerificationLevel, string>>;

const verificationLevelSummaries = {
  en: {
    checkin: "This proof shows the participant checked in with the event QR link.",
    organizer_approved: "The organizer has confirmed the activity shown on this proof.",
    evidence_verified: "The organizer has reviewed supporting information for this activity.",
    onchain_sbt: "This confirmed proof has also been saved as a digital proof record."
  },
  ja: {
    checkin: "この証明は、QRチェックインによって参加が確認された記録です。",
    organizer_approved: "この証明は、イベント主催者によって活動内容が確認された記録です。",
    evidence_verified: "この証明は、提出内容を主催者が確認した記録です。",
    onchain_sbt: "この確認済みの証明は、デジタル証明としても保存されています。"
  }
} satisfies Record<Language, Record<CertificateVerificationLevel, string>>;

const approvalStatusLabels = {
  en: {
    approved: "Confirmed",
    pending: "Waiting for confirmation",
    rejected: "Not confirmed"
  },
  ja: {
    approved: "確認済み",
    pending: "確認待ち",
    rejected: "未確認"
  }
} satisfies Record<Language, Record<CertificateApprovalStatus, string>>;

export function labelProofType(lang: Language, certificateType: string) {
  const labels: Record<string, string> = proofTypeLabels[lang];

  return labels[certificateType] ?? certificateType.charAt(0).toUpperCase() + certificateType.slice(1);
}

export function isProofLabelKey(value: string | null | undefined): value is ProofLabelKey {
  return PROOF_LABEL_KEYS.includes(value as ProofLabelKey);
}

export function labelVerificationLevel(lang: Language, verificationLevel: string | null | undefined) {
  const value = isVerificationLevel(verificationLevel) ? verificationLevel : "checkin";

  return verificationLevelLabels[lang][value];
}

export function summarizeVerificationLevel(lang: Language, verificationLevel: string | null | undefined) {
  const value = isVerificationLevel(verificationLevel) ? verificationLevel : "checkin";

  return verificationLevelSummaries[lang][value];
}

export function labelApprovalStatus(lang: Language, approvalStatus: string | null | undefined) {
  const value = isApprovalStatus(approvalStatus) ? approvalStatus : "approved";

  return approvalStatusLabels[lang][value];
}

export function canOfferSbtUpgrade(verificationLevel: string | null | undefined) {
  return verificationLevel === "organizer_approved" || verificationLevel === "evidence_verified";
}

function isVerificationLevel(value: string | null | undefined): value is CertificateVerificationLevel {
  return value === "checkin" || value === "organizer_approved" || value === "evidence_verified" || value === "onchain_sbt";
}

function isApprovalStatus(value: string | null | undefined): value is CertificateApprovalStatus {
  return value === "approved" || value === "pending" || value === "rejected";
}
