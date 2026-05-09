import { Card } from "@/components/ui";

export function SetupError({
  title = "Supabase setup needed",
  message,
  missing = []
}: {
  title?: string;
  message?: string;
  missing?: string[];
}) {
  return (
    <Card className="border-amber-200 bg-amber-50 text-amber-950">
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm leading-6">
            {message ??
              "Add the required environment variables and run the Supabase schema before using this page."}
          </p>
        </div>

        {missing.length > 0 ? (
          <div>
            <p className="text-sm font-semibold">Missing values</p>
            <ul className="mt-2 space-y-1 text-sm">
              {missing.map((name) => (
                <li key={name}>
                  <code className="rounded bg-white/70 px-2 py-1">{name}</code>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
