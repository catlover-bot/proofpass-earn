import Link from "next/link";
import { Suspense } from "react";
import { BadgeCheck } from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { logoutAction } from "@/lib/actions/auth";
import { maskEmail } from "@/lib/email";
import { commonCopy, type Language, withLanguage } from "@/lib/i18n";

export function SiteHeader({ lang, adminEmail }: { lang: Language; adminEmail?: string }) {
  const t = commonCopy[lang];

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <Link href={withLanguage("/", lang)} className="flex items-center gap-2 text-lg font-bold text-ink">
        <span className="rounded-lg bg-ink p-2 text-white">
          <BadgeCheck className="h-5 w-5" />
        </span>
        ProofPass
      </Link>
      <div className="flex flex-wrap items-center gap-4">
        <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-700">
          <Link href={withLanguage("/", lang)} className="hover:text-ink">
            {t.home}
          </Link>
          <Link href={withLanguage("/admin/events", lang)} className="hover:text-ink">
            {t.events}
          </Link>
          <Link href={withLanguage("/cert/proof_xZ0Nb0iY9yMUf1", lang)} className="hover:text-ink">
            {t.demoProof}
          </Link>
          <Link href={withLanguage("/pricing", lang)} className="hover:text-ink">
            {t.pricing}
          </Link>
          <Link href={withLanguage("/web3-roadmap", lang)} className="hover:text-ink">
            {t.web3Roadmap}
          </Link>
        </nav>
        <Suspense
          fallback={
            <div className="h-10 w-36 rounded-full border border-slate-200 bg-white shadow-sm" />
          }
        >
          <LanguageToggle lang={lang} />
        </Suspense>
        {adminEmail ? (
          <form action={logoutAction} className="flex items-center gap-2">
            <input type="hidden" name="lang" value={lang} />
            <span className="hidden max-w-48 truncate text-xs font-semibold text-slate-500 sm:inline">
              {maskEmail(adminEmail)}
            </span>
            <button
              type="submit"
              className="inline-flex min-h-10 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-ink shadow-sm transition hover:bg-slate-50"
            >
              {t.logout}
            </button>
          </form>
        ) : null}
      </div>
    </header>
  );
}
