import { ArrowRight, CalendarDays } from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { ButtonLink, Card, PageShell } from "@/components/ui";
import { getLanguageFromSearchParams, type Language, type SearchParamsLike, withLanguage } from "@/lib/i18n";

const copy = {
  en: {
    label: "Admin",
    title: "ProofPass dashboard",
    intro: "Manage events, create check-in links, and review participant proof status.",
    cardTitle: "Event management",
    cardText: "Create events, display QR check-in links, and inspect participants.",
    openEvents: "Open events"
  },
  ja: {
    label: "管理",
    title: "ProofPassダッシュボード",
    intro: "イベント管理、チェックインリンク作成、参加者の証明状況確認を行います。",
    cardTitle: "イベント管理",
    cardText: "イベントを作成し、QRチェックインリンクを表示して、参加者を確認します。",
    openEvents: "イベントを開く"
  }
} satisfies Record<Language, Record<string, string>>;

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<SearchParamsLike>;
}) {
  const lang = getLanguageFromSearchParams(await searchParams);
  const t = copy[lang];

  return (
    <PageShell className="space-y-8">
      <AdminHeader lang={lang} />

      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-mint">{t.label}</p>
        <h1 className="text-3xl font-bold text-ink">{t.title}</h1>
        <p className="max-w-2xl text-slate-700">{t.intro}</p>
      </div>

      <Card>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-md bg-mint/10 p-3 text-mint">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-ink">{t.cardTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">{t.cardText}</p>
            </div>
          </div>
          <ButtonLink href={withLanguage("/admin/events", lang)}>
            {t.openEvents}
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </Card>
    </PageShell>
  );
}
