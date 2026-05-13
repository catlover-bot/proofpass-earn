import { PublicFooter } from "@/components/PublicFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, PageShell } from "@/components/ui";
import { commonCopy, getLanguageFromSearchParams, type Language, type SearchParamsLike } from "@/lib/i18n";

const copy = {
  en: {
    label: "Roadmap",
    title: "Web3 roadmap",
    intro:
      "ProofPass starts with wallet-free proof pages and adds NFT/SBT-style proof records only where they support event identity.",
    phases: [
      {
        title: "Today",
        body: "Wallet-free public proof pages with NFT-style proof card images for attendance, speaking, contribution, and organizing."
      },
      {
        title: "Next",
        body: "Structured metadata with a proof card image URL, without participant email or sensitive personal data."
      },
      {
        title: "Later",
        body: "Open Badges, Verifiable Credentials, and proof collection views for portable event identity."
      },
      {
        title: "Optional future",
        body: "Optional non-transferable SBT issuance for advanced pilots, with personal information kept off-chain."
      }
    ],
    positioningTitle: "Positioning",
    positioning:
      "ProofPass does not add wallet custody, payment flows, or speculative mechanics. NFT/SBT language is used for proof records only: attendance, speaking, contribution, and organizing.",
    privacy: "No personal information should be placed on-chain.",
    prototypeTitle: "Testnet SBT prototype",
    prototype:
      "A testnet-only prototype can be used for optional experiments with non-transferable proof records. No production mainnet mint UI is included, and the default flow remains wallet-free.",
    validated:
      "The first manual Base Sepolia SBT record has been validated with proof metadata and locked(tokenId) returning true.",
    noWallet: "The app does not include a production mint button, wallet login, or client-side wallet connection."
  },
  ja: {
    label: "ロードマップ",
    title: "Web3ロードマップ",
    intro:
      "ProofPassはウォレット不要の証明ページから始め、必要に応じてNFT/SBTスタイルの証明記録へ拡張できます。",
    phases: [
      {
        title: "現在",
        body: "参加・登壇・貢献・主催のための、NFT風証明カード画像付きウォレット不要の公開証明ページ。"
      },
      {
        title: "次の段階",
        body: "参加者メールアドレスや機微な個人情報を含まない、証明カード画像URL付きの構造化メタデータ。"
      },
      {
        title: "将来",
        body: "持ち運び可能なイベントIDのためのOpen Badges、Verifiable Credentials、証明コレクション表示。"
      },
      {
        title: "任意の将来拡張",
        body: "高度な実証向けに、個人情報をオフチェーンに保ったまま任意の譲渡不可SBTを発行。"
      }
    ],
    positioningTitle: "位置づけ",
    positioning:
      "ProofPassはウォレット管理、決済フロー、投機的な仕組みを追加しません。NFT/SBTという表現は、参加・登壇・貢献・主催の証明記録に限定して使います。",
    privacy: "個人情報をオンチェーンに載せるべきではありません。",
    prototypeTitle: "テストネットSBTプロトタイプ",
    prototype:
      "譲渡不可の証明記録を使った任意の実験として、テストネット限定プロトタイプを利用できます。本番メインネット発行UIは含まず、標準フローはウォレット不要です。",
    validated:
      "最初のBase Sepolia手動SBT記録では、証明メタデータとlocked(tokenId)がtrueを返すことを確認済みです。",
    noWallet: "アプリには本番発行ボタン、ウォレットログイン、クライアント側ウォレット接続は含まれていません。"
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
