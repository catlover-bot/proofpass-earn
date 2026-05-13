import { PublicFooter } from "@/components/PublicFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, PageShell } from "@/components/ui";
import { commonCopy, getLanguageFromSearchParams, type Language, type SearchParamsLike } from "@/lib/i18n";

const copy = {
  en: {
    title: "Contact",
    intro: "For event-specific questions, contact the event organizer.",
    feedbackTitle: "Pilot feedback",
    feedback: "Contact the ProofPass team or the event organizer."
  },
  ja: {
    title: "お問い合わせ",
    intro: "イベントごとの質問は、イベント主催者にお問い合わせください。",
    feedbackTitle: "パイロットへのフィードバック",
    feedback: "ProofPassチームまたはイベント主催者にお問い合わせください。"
  }
} satisfies Record<Language, Record<string, string>>;

export default async function ContactPage({
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
        <p className="text-sm font-semibold uppercase tracking-wider text-mint">{common.contact}</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">{t.title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-700">{t.intro}</p>
      </div>

      <Card className="space-y-3 text-sm leading-6 text-slate-700">
        <h2 className="text-xl font-bold text-ink">{t.feedbackTitle}</h2>
        <p>{t.feedback}</p>
      </Card>

      <PublicFooter lang={lang} />
    </PageShell>
  );
}
