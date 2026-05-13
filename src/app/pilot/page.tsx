import { ArrowRight, BadgeCheck, Boxes, FlaskConical, Link2, QrCode, Users } from "lucide-react";
import { PublicFooter } from "@/components/PublicFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ButtonLink, Card, PageShell, StatusPill } from "@/components/ui";
import { commonCopy, getLanguageFromSearchParams, type Language, type SearchParamsLike, withLanguage } from "@/lib/i18n";

const demoProofHref = "/cert/proof_xZ0Nb0iY9yMUf1";
const demoImageHref = "/cert/proof_xZ0Nb0iY9yMUf1/image";
const demoMetadataHref = "/cert/proof_xZ0Nb0iY9yMUf1/metadata";

const copy = {
  en: {
    label: "Public pilot",
    title: "Try ProofPass for your next event",
    intro:
      "ProofPass is a Web3 event proof app. Organizers can create QR check-ins and issue public proof pages for attendance, speaking, contribution, and organizing.",
    walletFree: "The default flow is wallet-free for participants.",
    advanced:
      "Advanced pilots can use NFT-style proof card images, structured metadata, and optional testnet SBT records.",
    positioning:
      "ProofPass is a non-speculative proof product. It does not add payment, token exchange, marketplace, wallet custody, or production mint UI.",
    whoLabel: "Who should try it",
    whoTitle: "Useful for communities that want event activity to be easier to verify and share.",
    who: ["Research events", "Study groups", "Hackathons", "Community meetups", "Internal workshops"],
    tryLabel: "What you can try",
    tryTitle: "Start with QR check-in, then explore proof records.",
    tryItems: [
      "QR check-in",
      "Invite-only check-in",
      "Public proof pages",
      "NFT/SBT-style proof cards",
      "Testnet SBT records"
    ],
    demoLabel: "Demo links",
    demoTitle: "Inspect the public proof surface.",
    demoLinks: [
      { href: demoProofHref, label: "Demo proof page", description: "Public page without participant email." },
      { href: demoImageHref, label: "Proof card image", description: "NFT-style image for sharing and metadata." },
      { href: demoMetadataHref, label: "Proof metadata", description: "Structured JSON with image field." }
    ],
    ctaTitle: "Open a small pilot",
    ctaText: "Create a test event, share the check-in link with a few people, and see how ProofPass feels in a real event flow.",
    createEvent: "Create an event",
    viewDemoProof: "View demo proof",
    contact: "Contact"
  },
  ja: {
    label: "公開パイロット",
    title: "次のイベントでProofPassを試す",
    intro:
      "ProofPassはWeb3イベント証明アプリです。主催者はQRチェックインを作成し、参加・登壇・貢献・主催の公開証明ページを発行できます。",
    walletFree: "標準フローでは、参加者にウォレットは不要です。",
    advanced:
      "高度なパイロットでは、NFTスタイルの証明カード画像、構造化メタデータ、任意のテストネットSBT記録を利用できます。",
    positioning:
      "ProofPassは投機目的ではない証明プロダクトです。決済、トークン交換、マーケットプレイス、ウォレット管理、本番ミントUIは追加しません。",
    whoLabel: "試してほしいイベント",
    whoTitle: "イベント活動を確認しやすく、共有しやすくしたいコミュニティに向いています。",
    who: ["研究イベント", "勉強会", "ハッカソン", "コミュニティミートアップ", "社内ワークショップ"],
    tryLabel: "試せること",
    tryTitle: "まずはQRチェックインから始め、証明記録を確認できます。",
    tryItems: [
      "QRチェックイン",
      "招待者限定チェックイン",
      "公開証明ページ",
      "NFT/SBTスタイル証明カード",
      "テストネットSBT記録"
    ],
    demoLabel: "デモリンク",
    demoTitle: "公開証明の表示を確認できます。",
    demoLinks: [
      { href: demoProofHref, label: "デモ証明ページ", description: "参加者メールアドレスを表示しない公開ページ。" },
      { href: demoImageHref, label: "証明カード画像", description: "共有とメタデータ用のNFTスタイル画像。" },
      { href: demoMetadataHref, label: "証明メタデータ", description: "画像フィールドを含む構造化JSON。" }
    ],
    ctaTitle: "小さなパイロットを始める",
    ctaText: "テストイベントを作成し、数人にチェックインリンクを共有して、実際のイベント導線でProofPassを試せます。",
    createEvent: "イベントを作成する",
    viewDemoProof: "デモ証明を見る",
    contact: "お問い合わせ"
  }
} satisfies Record<Language, {
  label: string;
  title: string;
  intro: string;
  walletFree: string;
  advanced: string;
  positioning: string;
  whoLabel: string;
  whoTitle: string;
  who: string[];
  tryLabel: string;
  tryTitle: string;
  tryItems: string[];
  demoLabel: string;
  demoTitle: string;
  demoLinks: { href: string; label: string; description: string }[];
  ctaTitle: string;
  ctaText: string;
  createEvent: string;
  viewDemoProof: string;
  contact: string;
}>;

const tryIcons = [QrCode, Link2, BadgeCheck, Boxes, FlaskConical];

export default async function PilotPage({
  searchParams
}: {
  searchParams: Promise<SearchParamsLike>;
}) {
  const lang = getLanguageFromSearchParams(await searchParams);
  const t = copy[lang];
  const common = commonCopy[lang];

  return (
    <PageShell className="space-y-10">
      <SiteHeader lang={lang} />

      <section className="grid gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="pilot">{t.label}</StatusPill>
            <StatusPill tone="success">{common.walletFree}</StatusPill>
          </div>
          <div>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal text-ink sm:text-5xl">
              {t.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p>
          </div>
          <div className="grid gap-3 text-sm leading-6 text-slate-700 sm:grid-cols-2">
            <Card className="p-4 shadow-none">
              <p className="font-bold text-ink">{t.walletFree}</p>
            </Card>
            <Card className="p-4 shadow-none">
              <p className="font-bold text-ink">{t.advanced}</p>
            </Card>
          </div>
          <p className="max-w-2xl rounded-xl border border-slate-200 bg-white/80 p-4 text-sm font-semibold leading-6 text-slate-700">
            {t.positioning}
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={withLanguage("/admin/events/new", lang)}>
              {t.createEvent}
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href={withLanguage(demoProofHref, lang)} variant="secondary">
              {t.viewDemoProof}
            </ButtonLink>
            <ButtonLink href={withLanguage("/contact", lang)} variant="subtle">
              {t.contact}
            </ButtonLink>
          </div>
        </div>

        <Card className="space-y-5 shadow-lift">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-mint">{t.demoLabel}</p>
            <h2 className="mt-2 text-2xl font-bold text-ink">{t.demoTitle}</h2>
          </div>
          <div className="space-y-3">
            {t.demoLinks.map((link) => (
              <a
                key={link.href}
                href={withLanguage(link.href, lang)}
                className="block rounded-xl border border-slate-200 bg-paper p-4 transition hover:border-mint/50 hover:bg-white"
              >
                <span className="flex items-center gap-2 text-sm font-bold text-ink">
                  <Link2 className="h-4 w-4 text-mint" />
                  {link.label}
                </span>
                <span className="mt-2 block break-all text-xs font-semibold text-slate-500">{link.href}</span>
                <span className="mt-2 block text-sm leading-6 text-slate-700">{link.description}</span>
              </a>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mint">{t.whoLabel}</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">{t.whoTitle}</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {t.who.map((audience) => (
            <div key={audience} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-soft">
              <Users className="h-5 w-5 text-mint" />
              <span className="text-sm font-bold text-slate-800">{audience}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mint">{t.tryLabel}</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">{t.tryTitle}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {t.tryItems.map((item, index) => {
            const Icon = tryIcons[index];

            return (
              <Card key={item} className="p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-mint/10 text-mint">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-bold leading-6 text-ink">{item}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <Card className="border-cyan-200 bg-cyan-50/45 shadow-none">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ink">{t.ctaTitle}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">{t.ctaText}</p>
          </div>
          <ButtonLink href={withLanguage("/admin/events/new", lang)}>
            {t.createEvent}
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </Card>

      <PublicFooter lang={lang} />
    </PageShell>
  );
}
