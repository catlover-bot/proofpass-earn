import { PublicFooter } from "@/components/PublicFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, PageShell } from "@/components/ui";
import { commonCopy, getLanguageFromSearchParams, type Language, type SearchParamsLike } from "@/lib/i18n";

const copy = {
  en: {
    label: "Roadmap",
    title: "Web3 roadmap",
    intro:
      "ProofPass Earn starts with practical off-chain proof and keeps Web3 support optional, non-speculative, and privacy-first.",
    phases: [
      {
        title: "Today",
        body: "Wallet-free off-chain proof pages for event participation and contribution."
      },
      {
        title: "Next",
        body: "Structured proof metadata for proof pages, without participant email or sensitive personal data."
      },
      {
        title: "Later",
        body: "Open Badges and Verifiable Credentials support for portable proof records."
      },
      {
        title: "Optional future",
        body: "Non-transferable SBT issuance for selected events, with personal information kept off-chain."
      }
    ],
    positioningTitle: "Positioning",
    positioning:
      "There are no speculative tokens, no token exchange, and no financial asset positioning. Any future SBT support should represent non-transferable attendance, speaking, or contribution proof only.",
    privacy: "No personal information should be placed on-chain.",
    prototypeTitle: "Testnet SBT prototype",
    prototype:
      "A testnet-only prototype can be used for optional experiments with non-transferable proof tokens. This is not production minting, not a financial asset, and not required for the current wallet-free MVP.",
    validated:
      "The first manual Base Sepolia mint has been validated with proof metadata and locked(tokenId) returning true.",
    noWallet: "The app does not include a mint button, wallet login, or client-side wallet connection."
  },
  ja: {
    label: "ロードマップ",
    title: "Web3ロードマップ",
    intro:
      "ProofPass Earnは実用的なオフチェーン証明から始め、Web3対応は任意・非投機的・プライバシー重視の拡張として扱います。",
    phases: [
      {
        title: "現在",
        body: "イベント参加と貢献のための、ウォレット不要のオフチェーン証明ページ。"
      },
      {
        title: "次の段階",
        body: "参加者メールアドレスや機微な個人情報を含まない、証明ページ向けの構造化メタデータ。"
      },
      {
        title: "将来",
        body: "持ち運び可能な証明記録のためのOpen BadgesやVerifiable Credentials対応。"
      },
      {
        title: "任意の将来拡張",
        body: "個人情報をオフチェーンに保ったまま、選択されたイベントで譲渡不可SBTを発行。"
      }
    ],
    positioningTitle: "位置づけ",
    positioning:
      "投機的なトークン、トークン交換、金融資産としての位置づけはありません。将来のSBT対応も、参加・登壇・貢献を示す譲渡不可の証明に限定されるべきです。",
    privacy: "個人情報をオンチェーンに載せるべきではありません。",
    prototypeTitle: "テストネットSBTプロトタイプ",
    prototype:
      "譲渡不可の証明トークンを使った任意の実験として、テストネット限定プロトタイプを利用できます。これは本番発行ではなく、金融資産でもなく、現在のウォレット不要MVPには必須ではありません。",
    validated:
      "最初のBase Sepolia手動発行では、証明メタデータとlocked(tokenId)がtrueを返すことを確認済みです。",
    noWallet: "アプリには発行ボタン、ウォレットログイン、クライアント側ウォレット接続は含まれていません。"
  }
} satisfies Record<Language, {
  label: string;
  title: string;
  intro: string;
  phases: { title: string; body: string }[];
  positioningTitle: string;
  positioning: string;
  privacy: string;
  prototypeTitle: string;
  prototype: string;
  validated: string;
  noWallet: string;
}>;

export default async function Web3RoadmapPage({
  searchParams
}: {
  searchParams: Promise<SearchParamsLike>;
}) {
  const lang = getLanguageFromSearchParams(await searchParams);
  const t = copy[lang];
  const common = commonCopy[lang];

  return (
    <PageShell className="max-w-4xl space-y-8">
      <SiteHeader lang={lang} />

      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-mint">{t.label}</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">{common.web3Roadmap}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-700">{t.intro}</p>
      </div>

      <div className="grid gap-4">
        {t.phases.map((phase) => (
          <Card key={phase.title}>
            <p className="text-sm font-semibold uppercase tracking-wider text-mint">{phase.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{phase.body}</p>
          </Card>
        ))}
      </div>

      <Card className="space-y-3 text-sm leading-6 text-slate-700">
        <h2 className="text-xl font-bold text-ink">{t.positioningTitle}</h2>
        <p>{t.positioning}</p>
        <p>{t.privacy}</p>
      </Card>

      <Card className="space-y-3 text-sm leading-6 text-slate-700">
        <h2 className="text-xl font-bold text-ink">{t.prototypeTitle}</h2>
        <p>{t.prototype}</p>
        <p>{t.validated}</p>
        <p>{t.noWallet}</p>
      </Card>

      <PublicFooter lang={lang} />
    </PageShell>
  );
}
