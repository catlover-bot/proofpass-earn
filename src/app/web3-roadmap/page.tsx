import { PublicFooter } from "@/components/PublicFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, PageShell } from "@/components/ui";
import { getLanguageFromSearchParams, type Language, type SearchParamsLike } from "@/lib/i18n";

const copy = {
  en: {
    label: "Roadmap",
    title: "Proof roadmap",
    intro:
      "ProofPass starts with wallet-free proof pages and strengthens them through organizer approval, evidence verification, and optional SBT/NFT extensions.",
    phases: [
      {
        title: "Today",
        body: "QR check-in confirmation, public proof pages, and Proof Cards for attendance and event activity."
      },
      {
        title: "Next",
        body: "Organizer-approved labels for speaking, contribution, support, mentoring, and awards."
      },
      {
        title: "Later",
        body: "Evidence-verified proofs, Open Badges, Verifiable Credentials, and proof collection views for portable activity history."
      },
      {
        title: "Optional extension",
        body: "Optional non-transferable SBT/NFT records for approved proofs, with personal information kept off-chain."
      }
    ],
    positioningTitle: "Positioning",
    positioning:
      "ProofPass is a trustworthy proof product for attendance, speaking, contribution, and learning activity. SBT/NFT support is treated as an optional extension for approved or evidence-verified proofs.",
    privacy: "No personal information should be placed on-chain.",
    prototypeTitle: "Optional SBT/NFT extension prototype",
    prototype:
      "A testnet-only prototype can be used for optional experiments with non-transferable proof records. The default flow remains wallet-free and does not issue SBT/NFT records automatically.",
    validated:
      "The first manual Base Sepolia proof record has been validated with public proof metadata and a non-transferable status check.",
    noWallet: "The app does not include wallet login or a client-side wallet connection."
  },
  ja: {
    label: "ロードマップ",
    title: "証明ロードマップ",
    intro:
      "ProofPassはウォレット不要の公開証明ページから始め、主催者承認・提出物確認・任意のSBT/NFT拡張によって証明の信頼性を高めていきます。",
    phases: [
      {
        title: "現在",
        body: "参加証明とイベント活動のための、QRチェックイン確認、公開証明ページ、Proof Card。"
      },
      {
        title: "次の段階",
        body: "登壇・貢献・サポート・メンター・受賞のための、主催者承認済みラベル。"
      },
      {
        title: "将来",
        body: "提出物確認済み証明、Open Badges、Verifiable Credentials、活動履歴として使える証明コレクション。"
      },
      {
        title: "任意の拡張",
        body: "承認済み証明のための任意の譲渡不可SBT/NFT記録。個人情報はオフチェーンに保ちます。"
      }
    ],
    positioningTitle: "位置づけ",
    positioning:
      "ProofPassは、参加証明・登壇証明・貢献証明・学習活動のための信頼できる証明プロダクトです。SBT/NFT化は、主催者承認済みまたは提出物確認済み証明の任意拡張として扱います。",
    privacy: "個人情報をオンチェーンに載せるべきではありません。",
    prototypeTitle: "任意のSBT/NFT拡張プロトタイプ",
    prototype:
      "譲渡不可の証明記録を使った任意の実験として、テストネット限定プロトタイプを利用できます。標準フローはウォレット不要で、SBT/NFT記録は自動発行されません。",
    validated:
      "最初のBase Sepolia手動証明記録では、公開証明メタデータと譲渡不可ステータスを確認済みです。",
    noWallet: "アプリにはウォレットログイン、クライアント側ウォレット接続は含まれていません。"
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

  return (
    <PageShell className="max-w-4xl space-y-8">
      <SiteHeader lang={lang} />

      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-mint">{t.label}</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">{t.title}</h1>
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
