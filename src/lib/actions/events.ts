"use server";

import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { eventFormSchema, type EventFormValues } from "@/lib/validation/event";
import { normalizeLanguage, withLanguage } from "@/lib/i18n";
import { getMissingEnv, getSupabaseClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

export type ActionResult = {
  error?: string;
  fieldErrors?: Partial<Record<keyof EventFormValues, string[]>>;
};

const EVENT_RETURN_HELP =
  "Check Supabase RLS: event creation needs both insert and select permission on events when returning the created id.";

function formatCreateError(message: string) {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("row-level security") ||
    lowerMessage.includes("permission") ||
    lowerMessage.includes("0 rows") ||
    lowerMessage.includes("no rows")
  ) {
    return `${message} ${EVENT_RETURN_HELP}`;
  }

  return message;
}

async function ensureOrganization(supabase: SupabaseClient<Database>) {
  const { data: existing, error: existingError } = await supabase
    .from("organizations")
    .select("id")
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
      name: "ProofPass Earn Demo Organization",
      contact_email: "organizer@example.invalid"
    })
    .select("id")
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  if (!created?.id) {
    throw new Error("Organization was not created correctly. No organization id was returned.");
  }

  return created.id;
}

export async function createEventAction(values: EventFormValues): Promise<ActionResult | void> {
  const parsed = eventFormSchema.safeParse(values);
  const lang = normalizeLanguage(values.lang);

  if (!parsed.success) {
    return {
      error: "Review the event details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  const missing = getMissingEnv();
  if (missing.length > 0) {
    return {
      error: `Missing setup values: ${missing.join(", ")}.`
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      error: "Supabase is not configured yet."
    };
  }

  let eventId: string;

  try {
    const organizationId = await ensureOrganization(supabase);
    const { data, error } = await supabase
      .from("events")
      .insert({
        organization_id: organizationId,
        title: parsed.data.title,
        description: parsed.data.description,
        location: parsed.data.location,
        starts_at: new Date(parsed.data.starts_at).toISOString(),
        ends_at: new Date(parsed.data.ends_at).toISOString(),
        checkin_code: `evt_${nanoid(12)}`,
        checkin_mode: parsed.data.checkin_mode
      })
      .select("id")
      .single();

    if (error) {
      return {
        error: formatCreateError(error.message)
      };
    }

    if (!data?.id) {
      return {
        error: `Event was not created correctly. No event id was returned. ${EVENT_RETURN_HELP}`
      };
    }

    eventId = data.id;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to create the event."
    };
  }

  redirect(withLanguage(`/admin/events/${eventId}`, lang));
}
