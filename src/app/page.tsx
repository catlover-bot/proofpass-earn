import { LandingPage } from "@/components/LandingPage";
import { getLanguageFromSearchParams, type SearchParamsLike } from "@/lib/i18n";

export default async function Home({
  searchParams
}: {
  searchParams: Promise<SearchParamsLike>;
}) {
  const lang = getLanguageFromSearchParams(await searchParams);

  return <LandingPage lang={lang} />;
}
