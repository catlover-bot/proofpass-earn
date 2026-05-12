import Link from "next/link";

const footerLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
  { href: "/web3-roadmap", label: "Web3 roadmap" }
];

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 pt-6 text-sm text-slate-600">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>ProofPass Earn pilot</p>
        <nav className="flex flex-wrap gap-4 font-semibold">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
