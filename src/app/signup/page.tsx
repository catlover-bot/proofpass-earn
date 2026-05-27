import Link from "next/link";
import { UserPlus } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SetupError } from "@/components/SetupError";
import { Button, Card, PageShell } from "@/components/ui";
import { signupAction } from "@/lib/actions/auth";
import { getLanguageFromSearchParams, type Language, type SearchParamsLike, withLanguage } from "@/lib/i18n";
import { getMissingEnv } from "@/lib/supabase/client";

const copy = {
  en: {
    label: "Organizer signup",
    title: "Create an organizer account",
    email: "Email",
    password: "Password",
    submit: "Create account",
    hasAccount: "Already have an account?",
    login: "Log in",
    errors: {
      setup: "Supabase setup is missing.",
      missing: "Enter an email and a password with at least 6 characters.",
      invalid: "Unable to create this organizer account."
    }
  },
  ja: {
    label: "主催者アカウント作成",
    title: "主催者アカウントを作成",
    email: "メールアドレス",
    password: "パスワード",
    submit: "アカウント作成",
    hasAccount: "すでにアカウントがありますか？",
    login: "ログイン",
    errors: {
      setup: "Supabase設定が不足しています。",
      missing: "メールアドレスと6文字以上のパスワードを入力してください。",
      invalid: "この主催者アカウントを作成できません。"
    }
  }
} satisfies Record<Language, {
  label: string;
  title: string;
  email: string;
  password: string;
  submit: string;
  hasAccount: string;
  login: string;
  errors: Record<string, string>;
}>;

function getParam(searchParams: SearchParamsLike, key: string) {
  if (!searchParams || searchParams instanceof URLSearchParams) {
    return searchParams?.get(key) ?? "";
  }

  const value = searchParams[key];

  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getCopyValue<T extends Record<string, string>>(values: T, key: string) {
  return Object.prototype.hasOwnProperty.call(values, key) ? values[key as keyof T] : undefined;
}

export default async function SignupPage({
  searchParams
}: {
  searchParams: Promise<SearchParamsLike>;
}) {
  const resolvedSearchParams = await searchParams;
  const lang = getLanguageFromSearchParams(resolvedSearchParams);
  const t = copy[lang];
  const error = getCopyValue(t.errors, getParam(resolvedSearchParams, "error"));
  const missing = getMissingEnv();

  return (
    <PageShell className="max-w-3xl space-y-8">
      <SiteHeader lang={lang} />

      <Card className="shadow-lift">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-mint">{t.label}</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">{t.title}</h1>
        </div>

        {missing.length > 0 ? (
          <SetupError missing={missing} />
        ) : (
          <form action={signupAction} className="space-y-5">
            <input type="hidden" name="lang" value={lang} />

            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                {error}
              </p>
            ) : null}

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">{t.email}</span>
              <input
                required
                name="email"
                type="email"
                autoComplete="email"
                className="w-full rounded-lg border border-slate-300 px-3 py-3 text-ink shadow-sm focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">{t.password}</span>
              <input
                required
                name="password"
                type="password"
                minLength={6}
                autoComplete="new-password"
                className="w-full rounded-lg border border-slate-300 px-3 py-3 text-ink shadow-sm focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20"
              />
            </label>

            <Button type="submit" className="w-full">
              <UserPlus className="h-4 w-4" />
              {t.submit}
            </Button>
          </form>
        )}

        <div className="mt-6 text-sm">
          <p className="text-slate-600">
            {t.hasAccount}{" "}
            <Link href={withLanguage("/login", lang)} className="font-bold text-mint hover:text-ink">
              {t.login}
            </Link>
          </p>
        </div>
      </Card>
    </PageShell>
  );
}
