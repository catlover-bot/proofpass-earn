import Link from "next/link";
import { commonCopy, defaultLanguage, type Language, withLanguage } from "@/lib/i18n";

export function PublicFooter({ lang = defaultLanguage }: { lang?: Language }) {
  const t = commonCopy[lang];
  const footerLinks = [
    { href: "/pilot", label: t.pilot },
    { href: "/privacy", label: t.privacy },
    { href: "/terms", label: t.terms },
    { href: "/contact", label: t.contact },
    { href: "/web3-roadmap", label: t.web3Roadmap }
  ];

  return (
    <footer className="border-t border-slate-200 pt-6 text-sm text-slate-600">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>ProofPass pilot</p>
        <nav className="flex flex-wrap gap-4 font-semibold">
          {footerLinks.map((link) => (
            <Link key={link.href} href={withLanguage(link.href, lang)} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
