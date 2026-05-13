import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { AUTH_ACCESS_COOKIE, AUTH_REFRESH_COOKIE } from "@/lib/auth-cookies";
import { normalizeEmail } from "@/lib/email";
import { defaultLanguage, type Language, withLanguage } from "@/lib/i18n";
import { getSupabaseClient, getSupabaseClientForAccessToken } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

export type OrganizerContext = {
  user: {
    id: string;
    email: string;
  };
  accessToken: string;
  organizationIds: string[];
};

type OrganizerMemberRecord = {
  id: string;
  organization_id: string;
  email: string;
  user_id?: string | null;
};

const COOKIE_OPTIONS = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production"
};

function isMissingUserIdColumn(error: { message?: string } | null | undefined) {
  return (error?.message ?? "").includes("user_id");
}

function organizationNameFromEmail(email: string) {
  const localPart = email.split("@")[0]?.replace(/[._-]+/g, " ").trim();
  const baseName = localPart ? localPart.replace(/\b\w/g, (match) => match.toUpperCase()) : "ProofPass Organizer";

  return `${baseName} Organization`;
}

export function sanitizeAdminRedirect(value: FormDataEntryValue | string | null | undefined) {
  const rawValue = typeof value === "string" ? value : "";

  if (!rawValue.startsWith("/admin")) {
    return "/admin/events";
  }

  if (rawValue.startsWith("//") || rawValue.includes("://")) {
    return "/admin/events";
  }

  return rawValue;
}

export async function setAuthCookies(input: {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}) {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_ACCESS_COOKIE, input.accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: input.expiresIn ?? 60 * 60
  });
  cookieStore.set(AUTH_REFRESH_COOKIE, input.refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 30
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete(AUTH_ACCESS_COOKIE);
  cookieStore.delete(AUTH_REFRESH_COOKIE);
}

async function findMembershipByUserId(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<{ member: OrganizerMemberRecord | null; userIdColumnAvailable: boolean }> {
  const { data, error } = await supabase
    .from("organizer_members")
    .select("id,organization_id,email,user_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (isMissingUserIdColumn(error)) {
    return { member: null, userIdColumnAvailable: false };
  }

  if (error) {
    throw new Error(error.message);
  }

  return { member: data, userIdColumnAvailable: true };
}

async function findMembershipByEmail(supabase: SupabaseClient<Database>, email: string) {
  const { data, error } = await supabase
    .from("organizer_members")
    .select("id,organization_id,email")
    .eq("email", email)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function getOrCreateOrganization(supabase: SupabaseClient<Database>, email: string, organizationName?: string) {
  const { data: existing, error: existingError } = await supabase
    .from("organizations")
    .select("id")
    .eq("contact_email", email)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    return existing.id;
  }

  const { data: created, error: createError } = await supabase
    .from("organizations")
    .insert({
      name: organizationName?.trim() || organizationNameFromEmail(email),
      contact_email: email
    })
    .select("id")
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  if (!created?.id) {
    throw new Error("Organization was not created correctly.");
  }

  return created.id;
}

export async function ensureOrganizerMembershipForUser(
  user: Pick<User, "id" | "email">,
  organizationName?: string,
  supabaseInput?: SupabaseClient<Database>
) {
  if (!user.email) {
    throw new Error("Organizer account does not have an email address.");
  }

  const supabase = supabaseInput ?? getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const email = normalizeEmail(user.email);
  const byUserId = await findMembershipByUserId(supabase, user.id);

  if (byUserId.member) {
    return byUserId.member.organization_id;
  }

  const byEmail = await findMembershipByEmail(supabase, email);

  if (byEmail) {
    if (byUserId.userIdColumnAvailable) {
      await supabase.from("organizer_members").update({ user_id: user.id }).eq("id", byEmail.id);
    }

    return byEmail.organization_id;
  }

  const organizationId = await getOrCreateOrganization(supabase, email, organizationName);
  const insertPayload: Database["public"]["Tables"]["organizer_members"]["Insert"] = {
    organization_id: organizationId,
    email,
    role: "owner"
  };

  if (byUserId.userIdColumnAvailable) {
    insertPayload.user_id = user.id;
  }

  const { error } = await supabase.from("organizer_members").insert(insertPayload);

  if (error) {
    throw new Error(error.message);
  }

  return organizationId;
}

export async function getCurrentOrganizer(): Promise<OrganizerContext | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_ACCESS_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  const supabase = getSupabaseClientForAccessToken(accessToken);
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser(accessToken);
  const email = data.user?.email ? normalizeEmail(data.user.email) : null;

  if (error || !data.user || !email) {
    return null;
  }

  await ensureOrganizerMembershipForUser(data.user, undefined, supabase);

  const byUserId = await findMembershipByUserId(supabase, data.user.id);
  let memberships: OrganizerMemberRecord[] = [];

  if (byUserId.userIdColumnAvailable) {
    const { data: userMemberships, error: membershipError } = await supabase
      .from("organizer_members")
      .select("id,organization_id,email,user_id")
      .eq("user_id", data.user.id);

    if (membershipError) {
      throw new Error(membershipError.message);
    }

    memberships = userMemberships ?? [];
  }

  const { data: emailMemberships, error: emailMembershipError } = await supabase
    .from("organizer_members")
    .select("id,organization_id,email")
    .eq("email", email);

  if (emailMembershipError) {
    throw new Error(emailMembershipError.message);
  }

  const organizationIds = Array.from(
    new Set([...memberships, ...(emailMemberships ?? [])].map((membership) => membership.organization_id))
  );

  return {
    user: {
      id: data.user.id,
      email
    },
    accessToken,
    organizationIds
  };
}

export async function requireOrganizer(lang: Language = defaultLanguage) {
  const organizer = await getCurrentOrganizer();

  if (!organizer) {
    redirect(withLanguage("/login", lang));
  }

  return organizer;
}

export function getOrganizerSupabaseClient(organizer: OrganizerContext) {
  return getSupabaseClientForAccessToken(organizer.accessToken) ?? getSupabaseClient();
}

export async function assertOrganizerCanAccessEvent(
  supabase: SupabaseClient<Database>,
  organizer: OrganizerContext,
  eventId: string
) {
  if (organizer.organizationIds.length === 0) {
    return false;
  }

  const { data, error } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .in("organization_id", organizer.organizationIds)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}
