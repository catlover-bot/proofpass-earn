"use server";

import { redirect } from "next/navigation";
import { normalizeEmail } from "@/lib/email";
import {
  clearAuthCookies,
  ensureOrganizerMembershipForUser,
  sanitizeAdminRedirect,
  setAuthCookies
} from "@/lib/organizer-auth";
import { getSupabaseClient } from "@/lib/supabase/client";
import { normalizeLanguage, withLanguage } from "@/lib/i18n";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function authRedirect(path: string, lang: "en" | "ja", params: Record<string, string>): never {
  const url = new URL(withLanguage(path, lang), "https://proofpass.local");

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  redirect(`${url.pathname}${url.search}`);
}

export async function loginAction(formData: FormData) {
  const lang = normalizeLanguage(formData.get("lang"));
  const next = sanitizeAdminRedirect(formData.get("next"));
  const email = normalizeEmail(getString(formData, "email"));
  const password = getString(formData, "password");
  const supabase = getSupabaseClient();

  if (!supabase) {
    authRedirect("/login", lang, { error: "setup", next });
  }

  if (!email || !password) {
    authRedirect("/login", lang, { error: "missing", next });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.session || !data.user.email) {
    authRedirect("/login", lang, { error: "invalid", next });
  }

  await setAuthCookies({
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresIn: data.session.expires_in
  });
  await ensureOrganizerMembershipForUser(data.user);

  redirect(withLanguage(next, lang));
}

export async function signupAction(formData: FormData) {
  const lang = normalizeLanguage(formData.get("lang"));
  const email = normalizeEmail(getString(formData, "email"));
  const password = getString(formData, "password");
  const organizationName = getString(formData, "organizationName");
  const supabase = getSupabaseClient();

  if (!supabase) {
    authRedirect("/signup", lang, { error: "setup" });
  }

  if (!email || password.length < 6) {
    authRedirect("/signup", lang, { error: "missing" });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        organization_name: organizationName || undefined
      }
    }
  });

  if (error || !data.user?.email) {
    authRedirect("/signup", lang, { error: "invalid" });
  }

  await ensureOrganizerMembershipForUser(data.user, organizationName);

  if (data.session) {
    await setAuthCookies({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in
    });
    redirect(withLanguage("/admin/events", lang));
  }

  authRedirect("/login", lang, { message: "confirm" });
}

export async function logoutAction(formData: FormData) {
  const lang = normalizeLanguage(formData.get("lang"));

  await clearAuthCookies();
  authRedirect("/login", lang, { message: "logged_out" });
}
