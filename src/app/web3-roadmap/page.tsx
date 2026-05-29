import { PublicFooter } from "@/components/PublicFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, PageShell } from "@/components/ui";
import { getLanguageFromSearchParams, type Language, type SearchParamsLike } from "@/lib/i18n";

const copy = {
  en: {
    label: "Roadmap",
    title: "Proof roadmap",
    intro:
      "ProofPass starts with shareable proof pages and strengthens them through organizer confirmation, evidence checks, and optional digital proof storage.",
    phases: [
      {
        title: "Today",
        body: "QR participation confirmation, shareable proof pages, and proof cards for attendance and event activity."
      },
      {
        title: "Next",
        body: "Organizer-confirmed labels for speaking, contribution, support, mentoring, and awards."
      },
      {
        title: "Later",
        body: "Evidence-checked proofs and collection views that help participants share their activity history."
      },
      {
        title: "Optional extension",
        body: "Confirmed proofs can be saved as optional digital proof records. Personal information should stay private."
      }
    ],
    positioningTitle: "Positioning",
    positioning:
      "ProofPass is a proof product for attendance, speaking, contribution, and learning activity. Technical extensions are optional and come after organizer confirmation.",
    privacy: "Personal information should not be included in public technical records.",
    prototypeTitle: "Digital proof extension",
    prototype:
      "Advanced pilots can save confirmed proofs as optional digital proof records. The default flow remains wallet-free and does not save digital proof records automatically.",
    validated:
      "A first pilot record has been checked with public proof information and a non-transferable status.",
    noWallet: "Participants do not need wallet login for the default flow."
  },
  ja: {
    label: "ロードマップ",
    title: "証明ロードマップ",
    intro:
      "ProofPassは、共有できる証明ページから始め、主催者確認・提出内容の確認・必要に応じたデジタル証明保存によって、証明の信頼性を高めていきます。",
    phases: [
      {
        title: "現在",
        body: "参加証明とイベント活動のための、QRでの参加確認、共有できる証明ページ、共有しやすい証明カード。"
      },
      {
        title: "次の段階",
        body: "登壇・貢献・サポート・メンター・受賞の活動を、主催者が確認したラベル。"
      },
      {
        title: "将来",
        body: "提出内容を確認した証明と、参加者が活動履歴として共有しやすい証明コレクション。"
      },
      {
        title: "任意の拡張",
        body: "確認済みの証明を、必要に応じてデジタル証明として保存できます。個人情報は公開記録に含めません。"
      }
    ],
    positioningTitle: "位置づけ",
    positioning:
      "ProofPassは、参加証明・登壇証明・貢献証明・学習活動のための証明プロダクトです。技術的な拡張は、主催者が確認した証明に必要な場合だけ使います。",
    privacy: "個人情報を公開用の技術記録に含めないことが大切です。",
    prototypeTitle: "デジタル証明として保存する拡張",
    prototype:
      "高度なパイロットでは、確認済みの証明を任意でデジタル証明として保存できます。標準フローはウォレット不要で、自動保存はされません。",
    validated:
      "最初のパイロット記録では、公開証明情報と譲渡不可の状態を確認済みです。",
    noWallet: "標準フローでは、参加者のウォレットログインは不要です。"
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
