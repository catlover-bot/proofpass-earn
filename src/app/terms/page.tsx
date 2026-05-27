import { PublicFooter } from "@/components/PublicFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, PageShell } from "@/components/ui";
import { commonCopy, getLanguageFromSearchParams, type Language, type SearchParamsLike } from "@/lib/i18n";

const copy = {
  en: {
    title: "Pilot terms",
    intro: "ProofPass is a pilot service for event proof and community contribution records.",
    paragraphs: [
      "Proof pages are participation, achievement, and community contribution records. They do not create ownership, payment, or transfer rights.",
      "The service has no payment flow or wallet custody. Organizers are responsible for using the service appropriately for their events.",
      "Public proof URLs may be accessible to anyone with the link. The service may change during the pilot phase as organizer and participant feedback is reviewed.",
      "Future SBT/NFT support, if added, should be an optional non-transferable extension for approved proofs. Personal information should not be placed on-chain."
    ]
  },
  ja: {
    title: "パイロット利用規約",
    intro: "ProofPassは、イベント参加証明とコミュニティ貢献記録のためのパイロットサービスです。",
    paragraphs: [
      "証明ページは参加、達成、コミュニティ貢献の記録です。所有権、決済上の権利、譲渡権を発生させるものではありません。",
      "このサービスには決済フローやウォレット管理はありません。主催者は、自分たちのイベントに適した形でサービスを利用する責任があります。",
      "公開証明URLは、リンクを知っている人がアクセスできる場合があります。サービスはパイロット期間中、主催者と参加者のフィードバックに基づいて変更される場合があります。",
      "将来SBT/NFT対応を追加する場合も、承認済み証明の任意かつ譲渡不可の拡張であるべきです。個人情報をオンチェーンに載せるべきではありません。"
    ]
  }
} satisfies Record<Language, { title: string; intro: string; paragraphs: string[] }>;

export default async function TermsPage({
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
        <p className="text-sm font-semibold uppercase tracking-wider text-mint">{common.terms}</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">{t.title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-700">{t.intro}</p>
      </div>

      <Card className="space-y-4 text-sm leading-6 text-slate-700">
        {t.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </Card>

      <PublicFooter lang={lang} />
    </PageShell>
  );
}
