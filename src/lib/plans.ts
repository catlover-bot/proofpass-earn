import type { Language } from "@/lib/i18n";

export type PlanKey = "free" | "organizer_pro" | "community" | "enterprise";
export type PlanLimit = number | "custom";
export type PlanText = Record<Language, string>;

export type PlanDefinition = {
  key: PlanKey;
  name: PlanText;
  description: PlanText;
  monthlyPriceLabel: PlanText;
  eventLimit: PlanLimit;
  proofLimitPerEvent: PlanLimit;
  memberLimit: PlanLimit;
  features: Record<Language, string[]>;
  recommendedFor: Record<Language, string[]>;
};

export const planOrder: PlanKey[] = ["free", "organizer_pro", "community", "enterprise"];

export const plans: Record<PlanKey, PlanDefinition> = {
  free: {
    key: "free",
    name: {
      en: "Pilot Free",
      ja: "Pilot Free"
    },
    description: {
      en: "For small pilot events that want to try QR check-in and shareable proof pages.",
      ja: "小規模イベントで、QRチェックインと共有できる証明ページを試すためのプランです。"
    },
    monthlyPriceLabel: {
      en: "Free during pilot",
      ja: "パイロット期間は無料"
    },
    eventLimit: 3,
    proofLimitPerEvent: 50,
    memberLimit: 1,
    features: {
      en: ["Up to 3 events per month", "Up to 50 proofs per event", "QR check-in", "Shareable proof pages", "ProofPass logo shown"],
      ja: ["月3イベントまで", "各イベント50証明まで", "QRチェックイン", "共有できる証明ページ", "ProofPassロゴあり"]
    },
    recommendedFor: {
      en: ["Small meetups", "Trial events", "Personal organizers"],
      ja: ["小規模イベント", "お試し利用", "個人主催者"]
    }
  },
  organizer_pro: {
    key: "organizer_pro",
    name: {
      en: "Organizer Pro",
      ja: "Organizer Pro"
    },
    description: {
      en: "For organizers who run events continuously and need more proof capacity.",
      ja: "継続的にイベントを主催し、証明数や管理機能を増やしたい主催者向けです。"
    },
    monthlyPriceLabel: {
      en: "Expected ¥980-¥2,980 / month",
      ja: "月額 980円〜2,980円想定"
    },
    eventLimit: 20,
    proofLimitPerEvent: 300,
    memberLimit: 3,
    features: {
      en: ["More events", "More proofs per event", "CSV export", "Proof Card customization planned"],
      ja: ["イベント数の増加", "証明数の増加", "CSV export", "Proof Cardカスタマイズ予定"]
    },
    recommendedFor: {
      en: ["Recurring event organizers", "Workshop hosts", "Small communities"],
      ja: ["継続的なイベント主催者", "ワークショップ運営者", "小規模コミュニティ"]
    }
  },
  community: {
    key: "community",
    name: {
      en: "Community",
      ja: "Community"
    },
    description: {
      en: "For study groups, research groups, student groups, and communities managing multiple events.",
      ja: "勉強会・DAO・研究会・学生団体など、複数イベントを運営するコミュニティ向けです。"
    },
    monthlyPriceLabel: {
      en: "Consultation during pilot",
      ja: "パイロット中は相談ベース"
    },
    eventLimit: 100,
    proofLimitPerEvent: 1000,
    memberLimit: 10,
    features: {
      en: ["Multiple event management", "Community achievement page", "Multiple organizer accounts", "Community logo display"],
      ja: ["複数イベント管理", "コミュニティ実績ページ", "複数主催者アカウント", "ロゴ表示"]
    },
    recommendedFor: {
      en: ["Study groups", "Research communities", "Student groups", "DAO and community operations"],
      ja: ["勉強会", "研究会", "学生団体", "DAO・コミュニティ運営"]
    }
  },
  enterprise: {
    key: "enterprise",
    name: {
      en: "Enterprise",
      ja: "Enterprise"
    },
    description: {
      en: "For corporate training, recruiting events, university courses, and organizations that need custom operations.",
      ja: "企業研修・採用イベント・大学講義など、個別の運用要件がある組織向けです。"
    },
    monthlyPriceLabel: {
      en: "Custom consultation",
      ja: "個別相談"
    },
    eventLimit: "custom",
    proofLimitPerEvent: "custom",
    memberLimit: "custom",
    features: {
      en: ["Custom limits", "Organization management", "Operational support", "Individual consultation"],
      ja: ["カスタム上限", "組織管理", "サポート", "個別相談"]
    },
    recommendedFor: {
      en: ["Corporate training", "Recruiting events", "University courses", "Large organizations"],
      ja: ["企業研修", "採用イベント", "大学講義", "大規模組織"]
    }
  }
};

export const currentPilotPlan = plans.free;
