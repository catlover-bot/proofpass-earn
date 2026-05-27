import Link from "next/link";
import { LogIn } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SetupError } from "@/components/SetupError";
import { Button, Card, PageShell } from "@/components/ui";
import { loginAction } from "@/lib/actions/auth";
import { getLanguageFromSearchParams, type Language, type SearchParamsLike, withLanguage } from "@/lib/i18n";
import { getMissingEnv } from "@/lib/supabase/client";

const copy = {
  en: {
    label: "Organizer login",
    title: "Log in to ProofPass",
    email: "Email",
    password: "Password",
    submit: "Log in",
    noAccount: "Need an organizer account?",
    signup: "Create account",
    messages: {
      confirm: "Check your email to confirm the account, then log in.",
      logged_out: "You have been logged out."
    },
    errors: {
      setup: "Supabase setup is missing.",
      missing: "Enter your organizer email and password.",
      invalid: "Unable to log in with those credentials.",
      membership: "We could not finish setting up your organizer access. Please try again."
    }
  },
  ja: {
    label: "主催者ログイン",
    title: "ProofPassにログイン",
    email: "メールアドレス",
    password: "パスワード",
    submit: "ログイン",
    noAccount: "主催者アカウントが必要ですか？",
    signup: "アカウント作成",
    messages: {
      confirm: "メールを確認してアカウントを有効化してからログインしてください。",
      logged_out: "ログアウトしました。"
    },
    errors: {
      setup: "Supabase設定が不足しています。",
      missing: "主催者メールアドレスとパスワードを入力してください。",
      invalid: "この認証情報ではログインできません。",
      membership: "主催者アクセスの設定を完了できませんでした。もう一度お試しください。"
    }
  }
} satisfies Record<Language, {
  label: string;
  title: string;
  email: string;
  password: string;
  submit: string;
  noAccount: string;
  signup: string;
  messages: Record<string, string>;
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

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<SearchParamsLike>;
}) {
  const resolvedSearchParams = await searchParams;
  const lang = getLanguageFromSearchParams(resolvedSearchParams);
  const t = copy[lang];
  const errorKey = getParam(resolvedSearchParams, "error");
  const error = getCopyValue(t.errors, errorKey) ?? getCopyValue(copy.en.errors, errorKey);
  const message = getCopyValue(t.messages, getParam(resolvedSearchParams, "message"));
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
          <form action={loginAction} className="space-y-5">
            <input type="hidden" name="lang" value={lang} />

            {message ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
                {message}
              </p>
            ) : null}
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
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-300 px-3 py-3 text-ink shadow-sm focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20"
              />
            </label>

            <Button type="submit" className="w-full">
              <LogIn className="h-4 w-4" />
              {t.submit}
            </Button>
          </form>
        )}

        <div className="mt-6 text-sm">
          <p className="text-slate-600">
            {t.noAccount}{" "}
            <Link href={withLanguage("/signup", lang)} className="font-bold text-mint hover:text-ink">
              {t.signup}
            </Link>
          </p>
        </div>
      </Card>
    </PageShell>
  );
}
