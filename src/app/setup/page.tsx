import { CheckCircle2, CircleAlert } from "lucide-react";
import { Card, PageShell, StatusPill } from "@/components/ui";
import { REQUIRED_ENV } from "@/lib/supabase/client";
import { ADMIN_BASIC_AUTH_ENV } from "@/lib/admin-env";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function SetupPage() {
  const statuses = [
    ...REQUIRED_ENV.map((name) => ({
      name,
      scope: "Public browser variable",
      isSet: Boolean(process.env[name])
    })),
    ...ADMIN_BASIC_AUTH_ENV.map((name) => ({
      name,
      scope: "Server-only variable",
      isSet: Boolean(process.env[name])
    }))
  ];

  return (
    <PageShell className="max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-mint">Setup</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Environment diagnostics</h1>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          This page only reports whether required local environment variables are set. It does not display
          secret values.
        </p>
      </div>

      <Card>
        <div className="divide-y divide-slate-100">
          {statuses.map((status) => (
            <div key={status.name} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {status.isSet ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <CircleAlert className="h-5 w-5 text-amber-600" />
                )}
                <code className="break-all rounded bg-slate-100 px-2 py-1 text-sm font-semibold text-ink">
                  {status.name}
                </code>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">{status.scope}</span>
                <StatusPill tone={status.isSet ? "success" : "warning"}>
                  {status.isSet ? "Set" : "Missing"}
                </StatusPill>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}
