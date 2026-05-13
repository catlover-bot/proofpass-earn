import { Handshake } from "lucide-react";
import { Card, StatusPill } from "@/components/ui";
import type { Language } from "@/lib/i18n";

const copy = {
  en: {
    label: "Optional event benefit",
    title: "Proof holder access",
    example: "Show this proof at the event booth",
    note: "Organizers can replace this with event-specific access information. No code, balance, or transfer is attached."
  },
  ja: {
    label: "任意のイベントベネフィット",
    title: "証明保有者向けアクセス",
    example: "この証明をイベントブースで提示してください",
    note: "主催者はイベント固有のアクセス案内に差し替えられます。コード、残高、譲渡は含みません。"
  }
} satisfies Record<Language, Record<string, string>>;

export function EventBenefitPlaceholder({ lang }: { lang: Language }) {
  const t = copy[lang];

  return (
    <Card className="space-y-4 border-cyan-200 bg-cyan-50/45 shadow-none">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-white p-2 text-cyan-800">
          <Handshake className="h-5 w-5" />
        </div>
        <div>
          <StatusPill tone="info">{t.label}</StatusPill>
          <h2 className="mt-3 text-xl font-bold text-ink">{t.title}</h2>
        </div>
      </div>
      <p className="rounded-lg border border-cyan-200 bg-white px-4 py-3 text-sm font-bold text-cyan-950">
        {t.example}
      </p>
      <p className="text-sm leading-6 text-slate-700">{t.note}</p>
    </Card>
  );
}
