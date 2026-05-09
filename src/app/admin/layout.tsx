import { ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { getMissingAdminBasicAuthEnv } from "@/lib/admin-env";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const showPilotWarning =
    process.env.NODE_ENV !== "production" && getMissingAdminBasicAuthEnv().length > 0;

  return (
    <>
      {showPilotWarning ? (
        <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-amber-950">
          <div className="mx-auto flex max-w-6xl items-start gap-3 text-sm font-medium sm:px-6 lg:px-8">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Pilot mode: admin Basic Auth is not configured locally. Set ADMIN_BASIC_AUTH_USER and
              ADMIN_BASIC_AUTH_PASSWORD before deployment.
            </p>
          </div>
        </div>
      ) : null}
      {children}
    </>
  );
}
