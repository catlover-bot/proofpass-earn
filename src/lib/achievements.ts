import type { Language } from "@/lib/i18n";

export type AchievementKey =
  | "attendance"
  | "speaker"
  | "contributor"
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
  speaker: "info",
  contributor: "warning",
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
    speaker: {
      label: "Speaker",
      description: "Shared knowledge with the community."
    },
    contributor: {
      label: "Contributor",
      description: "Made a visible community contribution."
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
      label: "Testnet SBT minted",
      description: "Recorded as a non-transferable SBT on testnet."
    }
  },
  ja: {
    attendance: {
      label: "参加",
      description: "チェックインし、公開参加証明を受け取りました。"
    },
    speaker: {
      label: "登壇者",
      description: "コミュニティに知見を共有しました。"
    },
    contributor: {
      label: "貢献者",
      description: "見える形でコミュニティに貢献しました。"
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
      label: "テストネットSBT記録済み",
      description: "譲渡不可SBTとしてテストネットに記録されました。"
    }
  }
} satisfies Record<Language, Record<AchievementKey, { label: string; description: string }>>;

export const achievementOrder: AchievementKey[] = [
  "attendance",
  "speaker",
  "contributor",
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
    hasTestnetSbt?: boolean;
    includeEarlySupporter?: boolean;
  }
) {
  const keys = new Set<AchievementKey>();
  keys.add(
    input.certificateType
      ? achievementKeyForCertificateType(input.certificateType)
      : achievementKeyForParticipantRole(input.participantRole)
  );

  if (input.includeEarlySupporter) {
    keys.add("early_supporter");
  }

  if (input.hasTestnetSbt) {
    keys.add("testnet_sbt_minted");
  }

  return achievementOrder.filter((key) => keys.has(key)).map((key) => getAchievementBadge(lang, key));
}
