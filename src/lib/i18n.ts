export const supportedLanguages = ["en", "ja"] as const;
export type Language = (typeof supportedLanguages)[number];

export const defaultLanguage: Language = "en";

export type SearchParamsLike =
  | URLSearchParams
  | Record<string, string | string[] | undefined>
  | undefined
  | null;

export function normalizeLanguage(value: unknown): Language {
  const raw = Array.isArray(value) ? value[0] : value;

  return raw === "ja" || raw === "en" ? raw : defaultLanguage;
}

export function getLanguageFromSearchParams(searchParams: SearchParamsLike): Language {
  if (!searchParams) {
    return defaultLanguage;
  }

  if (searchParams instanceof URLSearchParams) {
    return normalizeLanguage(searchParams.get("lang"));
  }

  return normalizeLanguage(searchParams.lang);
}

export function languageQuery(lang: Language) {
  return `lang=${lang}`;
}

export function withLanguage(href: string, lang: Language) {
  const separator = href.includes("?") ? "&" : "?";

  return `${href}${separator}${languageQuery(lang)}`;
}

export const commonCopy = {
  en: {
    home: "Home",
    events: "Events",
    demoProof: "Demo proof",
    pilot: "Public pilot",
    web3Roadmap: "Proof roadmap",
    privacy: "Privacy",
    terms: "Terms",
    contact: "Contact",
    createEvent: "Create an event",
    createEventShort: "Create event",
    newEvent: "New event",
    viewDemoProof: "View demo proof",
    copy: "Copy",
    copied: "Copied",
    valid: "Valid",
    revoked: "Revoked",
    publicProof: "Public proof",
    checkIn: "Check in",
    eventDashboard: "Event dashboard",
    shareCheckIn: "Share check-in",
    checkedInParticipants: "Checked-in participants",
    optionalTestnetSbt: "Optional SBT/NFT extension",
    walletFree: "Wallet-free",
    emailHiddenPublic: "Email is not shown publicly",
    participant: "Participant",
    participantRole: "Participant role",
    proofType: "Proof type",
    status: "Status",
    proofUrl: "Proof URL",
    copiedProofUrl: "Proof URL copied",
    copyProofUrl: "Copy proof URL",
    issuedAt: "Issued at",
    location: "Location",
    role: "Role",
    eventDate: "Event date",
    proof: "Proof",
    name: "Name",
    email: "Email",
    description: "Description",
    startsAt: "Starts at",
    endsAt: "Ends at",
    backToEvents: "Back to events",
    openProof: "Open proof",
    viewMetadata: "View metadata",
    selected: "selected",
    logout: "Logout"
  },
  ja: {
    home: "ホーム",
    events: "イベント",
    demoProof: "デモ証明",
    pilot: "公開パイロット",
    web3Roadmap: "証明ロードマップ",
    privacy: "プライバシー",
    terms: "利用規約",
    contact: "お問い合わせ",
    createEvent: "イベントを作成する",
    createEventShort: "イベント作成",
    newEvent: "新規イベント",
    viewDemoProof: "デモ証明を見る",
    copy: "コピー",
    copied: "コピーしました",
    valid: "有効",
    revoked: "取り消し済み",
    publicProof: "公開参加証明",
    checkIn: "チェックイン",
    eventDashboard: "イベントダッシュボード",
    shareCheckIn: "チェックインを共有",
    checkedInParticipants: "チェックイン済み参加者",
    optionalTestnetSbt: "任意のSBT/NFT拡張",
    walletFree: "ウォレット不要",
    emailHiddenPublic: "メールは公開されません",
    participant: "参加者",
    participantRole: "参加者の役割",
    proofType: "証明タイプ",
    status: "ステータス",
    proofUrl: "証明URL",
    copiedProofUrl: "証明URLをコピーしました",
    copyProofUrl: "証明URLをコピー",
    issuedAt: "発行日時",
    location: "場所",
    role: "役割",
    eventDate: "イベント日",
    proof: "証明",
    name: "名前",
    email: "メールアドレス",
    description: "説明",
    startsAt: "開始日時",
    endsAt: "終了日時",
    backToEvents: "イベント一覧に戻る",
    openProof: "証明を開く",
    viewMetadata: "メタデータを見る",
    selected: "選択中",
    logout: "ログアウト"
  }
} satisfies Record<Language, Record<string, string>>;

export const roleCopy = {
  en: {
    attendance: "Attendance",
    attendee: "Attendee",
    speaker: "Speaker",
    contributor: "Contributor",
    organizer: "Organizer",
    valid: "Valid",
    revoked: "Revoked"
  },
  ja: {
    attendance: "参加",
    attendee: "参加者",
    speaker: "登壇者",
    contributor: "貢献者",
    organizer: "主催者",
    valid: "有効",
    revoked: "取り消し済み"
  }
} satisfies Record<Language, Record<string, string>>;

export function labelForValue(lang: Language, value: string) {
  const labels: Record<string, string> = roleCopy[lang];

  return labels[value] ?? value.charAt(0).toUpperCase() + value.slice(1);
}
