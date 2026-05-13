import type { ReactNode } from "react";
import { requireOrganizer } from "@/lib/organizer-auth";
import { getMissingEnv } from "@/lib/supabase/client";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (getMissingEnv().length === 0) {
    await requireOrganizer();
  }

  return children;
}
