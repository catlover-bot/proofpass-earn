"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { commonCopy, type Language, normalizeLanguage } from "@/lib/i18n";
import { cn } from "@/components/ui";

export function LanguageToggle({ lang }: { lang: Language }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeLang = normalizeLanguage(searchParams.get("lang") ?? lang);

  function switchLanguage(nextLang: Language) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", nextLang);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div
      className="flex rounded-full border border-slate-200 bg-white p-1 text-xs font-bold shadow-sm"
      aria-label="Language"
    >
      {(["ja", "en"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => switchLanguage(option)}
          aria-pressed={activeLang === option}
          aria-label={option === "ja" ? "日本語に切り替え" : "Switch to English"}
          className={cn(
            "min-h-8 rounded-full px-3 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
            activeLang === option ? "bg-ink text-white" : "text-slate-600 hover:bg-slate-100"
          )}
        >
          {option === "ja" ? "日本語" : "English"}
          <span className="sr-only">
            {activeLang === option ? ` ${commonCopy[activeLang].selected}` : ""}
          </span>
        </button>
      ))}
    </div>
  );
}
