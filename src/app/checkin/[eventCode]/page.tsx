import { BadgeCheck, CalendarDays, MapPin, ShieldCheck } from "lucide-react";
import { CheckinForm } from "@/components/CheckinForm";
import { SiteHeader } from "@/components/SiteHeader";
import { SetupError } from "@/components/SetupError";
import { Card, PageShell, StatusPill } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { commonCopy, getLanguageFromSearchParams, type SearchParamsLike } from "@/lib/i18n";
import { getMissingEnv, getSupabaseClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default async function CheckinPage({
  params,
  searchParams
}: {
  params: Promise<{ eventCode: string }>;
  searchParams: Promise<SearchParamsLike>;
}) {
  const { eventCode } = await params;
  const lang = getLanguageFromSearchParams(await searchParams);
  const common = commonCopy[lang];
  const copy = {
    en: {
      invalidTitle: "Invalid check-in link",
      invalidText: "This event code is not active. Ask the organizer for the current QR check-in link.",
      title: "Check in to receive your proof",
      privacy:
        "Enter your name and email. Your email is used by the organizer and is not shown on the public proof page.",
      beforeTitle: "Before you check in",
      duplicate: "Duplicate check-ins with the same email return the existing proof when possible.",
      points:
        "Choose the role that best matches how you participated. Points are shown for organizer summaries during the pilot.",
      to: "to"
    },
    ja: {
      invalidTitle: "チェックインリンクが無効です",
      invalidText: "このイベントコードは有効ではありません。現在のQRチェックインリンクを主催者に確認してください。",
      title: "チェックインして参加証明を受け取る",
      privacy:
        "名前とメールアドレスを入力してください。メールアドレスは主催者側の管理と重複確認に使用され、公開証明ページには表示されません。",
      beforeTitle: "チェックイン前の確認",
      duplicate: "同じメールアドレスで再度チェックインした場合は、可能な限り既存の証明ページへ移動します。",
      points: "参加方法に最も近い役割を選んでください。ポイントはパイロット中の主催者向け集計に使われます。",
      to: "から"
    }
  }[lang];

  const missing = getMissingEnv();
  if (missing.length > 0) {
    return (
      <PageShell className="space-y-8">
        <SiteHeader lang={lang} />
        <SetupError missing={missing} />
      </PageShell>
    );
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return (
      <PageShell className="space-y-8">
        <SiteHeader lang={lang} />
        <SetupError message="Supabase is not configured yet." />
      </PageShell>
    );
  }

  const { data: event, error } = await supabase
    .from("events")
    .select("id,title,description,location,starts_at,ends_at,checkin_code")
    .eq("checkin_code", eventCode)
    .maybeSingle();

  if (error) {
    return (
      <PageShell className="space-y-8">
        <SiteHeader lang={lang} />
        <SetupError title="Unable to load check-in" message={error.message} />
      </PageShell>
    );
  }

  if (!event) {
    return (
      <PageShell className="space-y-8">
        <SiteHeader lang={lang} />
        <Card>
          <h1 className="text-2xl font-bold text-ink">{copy.invalidTitle}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {copy.invalidText}
          </p>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell className="space-y-8">
      <SiteHeader lang={lang} />

      <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <Card className="space-y-5 shadow-lift">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-mint">{common.checkIn}</p>
            <StatusPill tone="success">{common.walletFree}</StatusPill>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-ink">{copy.title}</h1>
            <p className="mt-3 text-xl font-bold text-slate-800">{event.title}</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{event.description}</p>
          </div>
          <div className="space-y-3 text-sm text-slate-700">
            <p className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-mint" />
              {formatDateTime(event.starts_at)} {copy.to} {formatDateTime(event.ends_at)}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-mint" />
              {event.location}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm leading-6 text-slate-700">
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
              {copy.privacy}
            </p>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="space-y-3 bg-paper/80 shadow-none">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-mint" />
              <h2 className="text-lg font-bold text-ink">{copy.beforeTitle}</h2>
            </div>
            <p className="text-sm leading-6 text-slate-700">{copy.duplicate}</p>
            <p className="text-sm leading-6 text-slate-700">{copy.points}</p>
          </Card>
          <Card className="shadow-lift">
            <CheckinForm eventCode={event.checkin_code} lang={lang} />
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
