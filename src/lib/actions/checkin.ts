"use server";

import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { ROLE_CERTIFICATE_TYPE, ROLE_POINTS } from "@/lib/points";
import { getMissingEnv, getSupabaseClient } from "@/lib/supabase/client";
import { checkinFormSchema, type CheckinFormValues } from "@/lib/validation/checkin";

export type CheckinActionResult = {
  error?: string;
  fieldErrors?: Partial<Record<keyof CheckinFormValues, string[]>>;
};

export async function checkInAction(values: CheckinFormValues): Promise<CheckinActionResult | void> {
  const parsed = checkinFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      error: "Review your check-in details and try again.",
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

  let certificateSlug: string;

  try {
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id,title")
      .eq("checkin_code", parsed.data.eventCode)
      .maybeSingle();

    if (eventError) {
      return {
        error: eventError.message
      };
    }

    if (!event) {
      return {
        error: "This check-in link is not valid."
      };
    }

    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .insert({
        event_id: event.id,
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        role: parsed.data.role
      })
      .select("id")
      .single();

    if (participantError) {
      return {
        error: participantError.message
      };
    }

    certificateSlug = `proof_${nanoid(14)}`;

    const { error: certificateError } = await supabase.from("certificates").insert({
      event_id: event.id,
      participant_id: participant.id,
      public_slug: certificateSlug,
      certificate_type: ROLE_CERTIFICATE_TYPE[parsed.data.role],
      status: "valid"
    });

    if (certificateError) {
      return {
        error: certificateError.message
      };
    }

    const { error: pointError } = await supabase.from("point_ledger").insert({
      event_id: event.id,
      participant_id: participant.id,
      action_type: "check_in",
      points: ROLE_POINTS[parsed.data.role],
      reason: `${parsed.data.role} check-in for ${event.title}`
    });

    if (pointError) {
      return {
        error: pointError.message
      };
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to complete check-in."
    };
  }

  redirect(`/cert/${certificateSlug}`);
}
