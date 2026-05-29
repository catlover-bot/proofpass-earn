import type { Language } from "@/lib/i18n";
import { isProofLabelKey } from "@/lib/proof-types";

export type AchievementKey =
  | "attendance"
  | "qr_checked_in"
  | "speaker"
  | "contributor"
  | "supporter"
  | "mentor"
  | "winner"
  | "organizer"
  | "early_supporter"
  | "testnet_sbt_minted";

export type AchievementTone = "success" | "info" | "warning" | "testnet" | "pilot";

export type AchievementBadge = {
  key: AchievementKey;
  label: string;
  description: string;
  tone: AchievementTone;
};

const achievementTone: Record<AchievementKey, AchievementTone> = {
  attendance: "success",
  qr_checked_in: "info",
  speaker: "info",
  contributor: "warning",
  supporter: "success",
  mentor: "pilot",
  winner: "warning",
  organizer: "pilot",
  early_supporter: "success",
  testnet_sbt_minted: "testnet"
};

const achievementCopy = {
  en: {
    attendance: {
      label: "Attendance",
      description: "Checked in and received a public participation proof."
    },
    qr_checked_in: {
      label: "QR checked in",
      description: "Confirmed by the event QR check-in flow."
    },
    speaker: {
      label: "Speaker",
      description: "Shared knowledge with the community."
    },
    contributor: {
      label: "Contributor",
      description: "Made a visible community contribution."
    },
    supporter: {
      label: "Supporter",
      description: "Recognized by the organizer as an event supporter."
    },
    mentor: {
      label: "Mentor",
      description: "Recognized by the organizer for mentoring others."
    },
    winner: {
      label: "Winner",
      description: "Recognized by the organizer as an award recipient."
    },
    organizer: {
      label: "Organizer",
      description: "Helped make the event possible."
    },
    early_supporter: {
      label: "Early supporter",
      description: "Joined during the ProofPass pilot."
    },
    testnet_sbt_minted: {
      label: "Digital proof saved",
      description: "Saved as an optional digital proof record."
    }
  },
  ja: {
    attendance: {
      label: "参加",
      description: "チェックインし、公開参加証明を受け取りました。"
    },
    qr_checked_in: {
      label: "QRチェックイン済み",
      description: "イベントのQRチェックインで確認されました。"
    },
    speaker: {
      label: "登壇者",
      description: "コミュニティに知見を共有しました。"
    },
    contributor: {
      label: "貢献者",
      description: "見える形でコミュニティに貢献しました。"
    },
    supporter: {
      label: "サポーター",
      description: "イベントのサポーターとして主催者に承認されました。"
    },
    mentor: {
      label: "メンター",
      description: "メンタリングの貢献として主催者に承認されました。"
    },
    winner: {
      label: "受賞者",
      description: "受賞者として主催者に承認されました。"
    },
    organizer: {
      label: "主催者",
      description: "イベントの実現を支えました。"
    },
    early_supporter: {
      label: "初期サポーター",
      description: "ProofPassパイロットに参加しました。"
    },
    testnet_sbt_minted: {
      label: "デジタル証明として保存済み",
      description: "必要に応じて、デジタル証明として保存されています。"
    }
  }
} satisfies Record<Language, Record<AchievementKey, { label: string; description: string }>>;

export const achievementOrder: AchievementKey[] = [
  "attendance",
  "qr_checked_in",
  "speaker",
  "contributor",
  "supporter",
  "mentor",
  "winner",
  "organizer",
  "early_supporter",
  "testnet_sbt_minted"
];

export function getAchievementBadge(lang: Language, key: AchievementKey): AchievementBadge {
  return {
    key,
    ...achievementCopy[lang][key],
    tone: achievementTone[key]
  };
}

export function getAchievementCatalog(lang: Language) {
  return achievementOrder.map((key) => getAchievementBadge(lang, key));
}

export function achievementKeyForCertificateType(value: string | null | undefined): AchievementKey {
  switch (value) {
    case "speaking":
    case "speaker":
      return "speaker";
    case "contribution":
    case "contributor":
      return "contributor";
    case "organizing":
    case "organizer":
      return "organizer";
    default:
      return "attendance";
  }
}

export function achievementKeyForParticipantRole(value: string | null | undefined): AchievementKey {
  switch (value) {
    case "speaker":
      return "speaker";
    case "contributor":
      return "contributor";
    case "organizer":
      return "organizer";
    default:
      return "attendance";
  }
}

export function getProofAchievementBadges(
  lang: Language,
  input: {
    certificateType?: string | null;
    participantRole?: string | null;
    proofLabels?: Array<string | null | undefined>;
    verificationLevel?: string | null;
    hasTestnetSbt?: boolean;
    includeEarlySupporter?: boolean;
  }
) {
  const keys = new Set<AchievementKey>();
  const proofLabels = input.proofLabels?.filter(isProofLabelKey) ?? [];

  keys.add("attendance");

  proofLabels.forEach((label) => {
    keys.add(label);
  });

  if (proofLabels.length === 0) {
    keys.add("qr_checked_in");
  }

  if (input.includeEarlySupporter) {
    keys.add("early_supporter");
  }

  if (input.hasTestnetSbt) {
    keys.add("testnet_sbt_minted");
  }

  return achievementOrder.filter((key) => keys.has(key)).map((key) => getAchievementBadge(lang, key));
}
