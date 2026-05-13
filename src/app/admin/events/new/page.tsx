import { EventForm } from "@/components/EventForm";
import { AdminHeader } from "@/components/AdminHeader";
import { SetupError } from "@/components/SetupError";
import { ButtonLink, Card, PageShell } from "@/components/ui";
import { commonCopy, getLanguageFromSearchParams, type SearchParamsLike, withLanguage } from "@/lib/i18n";
import { getMissingEnv } from "@/lib/supabase/client";

export default async function NewEventPage({
  searchParams
}: {
  searchParams: Promise<SearchParamsLike>;
}) {
  const lang = getLanguageFromSearchParams(await searchParams);
  const common = commonCopy[lang];
  const copy = {
    en: {
      label: "New event",
      title: "Create an event",
      subtitle: "Set up a QR check-in and proof issuing page."
    },
    ja: {
      label: "新規イベント",
      title: "イベントを作成",
      subtitle: "QRチェックインと参加証明ページを準備します。"
    }
  }[lang];
  const missing = getMissingEnv();

  return (
    <PageShell className="space-y-8">
      <AdminHeader lang={lang} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-mint">{copy.label}</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">{copy.title}</h1>
          <p className="mt-2 max-w-2xl text-slate-700">
            {copy.subtitle}
          </p>
        </div>
        <ButtonLink href={withLanguage("/admin/events", lang)} variant="secondary">
          {common.backToEvents}
        </ButtonLink>
      </div>

      {missing.length > 0 ? (
        <SetupError missing={missing} />
      ) : (
        <Card className="shadow-lift">
          <EventForm lang={lang} />
        </Card>
      )}
    </PageShell>
  );
}
