import { SiteHeader } from "@/components/SiteHeader";
import { type Language } from "@/lib/i18n";
import { getCurrentOrganizer } from "@/lib/organizer-auth";

export async function AdminHeader({ lang }: { lang: Language }) {
  const organizer = await getCurrentOrganizer();

  return <SiteHeader lang={lang} adminEmail={organizer?.user.email} />;
}
