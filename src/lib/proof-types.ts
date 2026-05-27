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
    checkin: "QR check-in confirmed",
    organizer_approved: "Organizer approved",
    evidence_verified: "Evidence verified",
    onchain_sbt: "SBT issued"
  },
  ja: {
    checkin: "QRチェックイン確認",
    organizer_approved: "主催者承認済み",
    evidence_verified: "提出物確認済み",
    onchain_sbt: "SBT発行済み"
  }
} satisfies Record<Language, Record<CertificateVerificationLevel, string>>;

const verificationLevelSummaries = {
  en: {
    checkin: "QR check-in only",
    organizer_approved: "Organizer approved proof",
    evidence_verified: "Organizer reviewed submitted evidence",
    onchain_sbt: "Organizer-approved proof with an issued SBT"
  },
  ja: {
    checkin: "QRチェックインのみ",
    organizer_approved: "主催者が承認した証明",
    evidence_verified: "提出物を確認済み",
    onchain_sbt: "SBT発行済みの承認証明"
  }
} satisfies Record<Language, Record<CertificateVerificationLevel, string>>;

const approvalStatusLabels = {
  en: {
    approved: "Approved",
    pending: "Pending",
    rejected: "Rejected"
  },
  ja: {
    approved: "承認済み",
    pending: "承認待ち",
    rejected: "却下"
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
