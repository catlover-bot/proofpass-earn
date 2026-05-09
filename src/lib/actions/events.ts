"use server";

import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { eventFormSchema, type EventFormValues } from "@/lib/validation/event";
import { getMissingEnv, getSupabaseClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

export type ActionResult = {
  error?: string;
  fieldErrors?: Partial<Record<keyof EventFormValues, string[]>>;
};

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

  return created.id;
}

export async function createEventAction(values: EventFormValues): Promise<ActionResult | void> {
  const parsed = eventFormSchema.safeParse(values);

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
        checkin_code: `evt_${nanoid(12)}`
      })
      .select("id")
      .single();

    if (error) {
      return {
        error: error.message
      };
    }

    eventId = data.id;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to create the event."
    };
  }

  redirect(`/admin/events/${eventId}`);
}
