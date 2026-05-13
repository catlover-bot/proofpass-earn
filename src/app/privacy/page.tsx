import { PublicFooter } from "@/components/PublicFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, PageShell } from "@/components/ui";
import { commonCopy, getLanguageFromSearchParams, type Language, type SearchParamsLike } from "@/lib/i18n";

const copy = {
  en: {
    title: "Privacy notice",
    intro: "ProofPass is currently for pilot and testing use by event organizers and participants.",
    dataTitle: "Data collected",
    collectedData: [
      "Participant name",
      "Participant email",
      "Selected role",
      "Event participation proof",
      "Check-in timestamp"
    ],
    emailTitle: "How participant email is used",
    emailUse:
      "Participant email is used for organizer-side management and duplicate handling. It is not shown on public proof pages.",
    publicUrls:
      "Public proof URLs may be accessible to anyone with the link. Participants can contact the event organizer to request correction or removal."
  },
  ja: {
    title: "プライバシー通知",
    intro: "ProofPassは現在、イベント主催者と参加者によるパイロットおよびテスト利用を想定しています。",
    dataTitle: "収集するデータ",
    collectedData: [
      "参加者名",
      "参加者のメールアドレス",
      "選択した役割",
      "イベント参加証明",
      "チェックイン日時"
    ],
    emailTitle: "参加者メールアドレスの利用",
    emailUse:
      "参加者のメールアドレスは、主催者側の管理と重複確認に使用されます。公開証明ページには表示されません。",
    publicUrls:
      "公開証明URLは、リンクを知っている人がアクセスできる場合があります。修正や削除を希望する場合は、イベント主催者に連絡してください。"
  }
} satisfies Record<Language, {
  title: string;
  intro: string;
  dataTitle: string;
  collectedData: string[];
  emailTitle: string;
  emailUse: string;
  publicUrls: string;
}>;

export default async function PrivacyPage({
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
        <p className="text-sm font-semibold uppercase tracking-wider text-mint">{common.privacy}</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">{t.title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-700">{t.intro}</p>
      </div>

      <Card className="space-y-4">
        <h2 className="text-xl font-bold text-ink">{t.dataTitle}</h2>
        <ul className="space-y-2 text-sm text-slate-700">
          {t.collectedData.map((item) => (
            <li key={item} className="rounded-md bg-slate-50 px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-3 text-sm leading-6 text-slate-700">
        <h2 className="text-xl font-bold text-ink">{t.emailTitle}</h2>
        <p>{t.emailUse}</p>
        <p>{t.publicUrls}</p>
      </Card>

      <PublicFooter lang={lang} />
    </PageShell>
  );
}
