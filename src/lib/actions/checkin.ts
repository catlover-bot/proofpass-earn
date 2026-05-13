"use server";

import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ROLE_POINTS } from "@/lib/points";
import { ROLE_CERTIFICATE_TYPE } from "@/lib/proof-types";
import { normalizeLanguage, withLanguage } from "@/lib/i18n";
import { getMissingEnv, getSupabaseClient } from "@/lib/supabase/client";
import type { Database, ParticipantRole } from "@/lib/supabase/types";
import { checkinFormSchema, type CheckinFormValues } from "@/lib/validation/checkin";

export type CheckinActionResult = {
  error?: string;
  fieldErrors?: Partial<Record<keyof CheckinFormValues, string[]>>;
};

const CHECKIN_ERROR = "Unable to complete check-in. Please try again or contact the event organizer.";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function findExistingParticipant(
  supabase: SupabaseClient<Database>,
  eventId: string,
  normalizedEmail: string
) {
  const { data, error } = await supabase
    .from("participants")
    .select("id,email,role")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(CHECKIN_ERROR);
  }

  return data.find((participant) => normalizeEmail(participant.email) === normalizedEmail) ?? null;
}

async function findValidCertificate(
  supabase: SupabaseClient<Database>,
  eventId: string,
  participantId: string
) {
  const { data, error } = await supabase
    .from("certificates")
    .select("public_slug")
    .eq("event_id", eventId)
    .eq("participant_id", participantId)
    .eq("status", "valid")
    .order("issued_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(CHECKIN_ERROR);
  }

  return data;
}

async function findAnyCertificate(
  supabase: SupabaseClient<Database>,
  eventId: string,
  participantId: string
) {
  const { data, error } = await supabase
    .from("certificates")
    .select("public_slug,status")
    .eq("event_id", eventId)
    .eq("participant_id", participantId)
    .order("issued_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(CHECKIN_ERROR);
  }

  return data;
}

async function createCertificate(
  supabase: SupabaseClient<Database>,
  eventId: string,
  participantId: string,
  role: ParticipantRole
) {
  const certificateSlug = `proof_${nanoid(14)}`;
  const { error } = await supabase.from("certificates").insert({
    event_id: eventId,
    participant_id: participantId,
    public_slug: certificateSlug,
    certificate_type: ROLE_CERTIFICATE_TYPE[role],
    status: "valid"
  });

  if (error) {
    throw new Error(CHECKIN_ERROR);
  }

  return certificateSlug;
}

async function ensureCheckinPoints(
  supabase: SupabaseClient<Database>,
  event: { id: string; title: string },
  participantId: string,
  role: ParticipantRole
) {
  const { data: existingPoint, error: pointLookupError } = await supabase
    .from("point_ledger")
    .select("id")
    .eq("event_id", event.id)
    .eq("participant_id", participantId)
    .eq("action_type", "check_in")
    .limit(1)
    .maybeSingle();

  if (pointLookupError) {
    throw new Error(CHECKIN_ERROR);
  }

  if (existingPoint) {
    return;
  }

  const { error: pointError } = await supabase.from("point_ledger").insert({
    event_id: event.id,
    participant_id: participantId,
    action_type: "check_in",
    points: ROLE_POINTS[role],
    reason: `${role} check-in for ${event.title}`
  });

  if (pointError) {
    throw new Error(CHECKIN_ERROR);
  }
}

export async function checkInAction(values: CheckinFormValues): Promise<CheckinActionResult | void> {
  const parsed = checkinFormSchema.safeParse(values);
  const lang = normalizeLanguage(values.lang);

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
    const normalizedEmail = normalizeEmail(parsed.data.email);
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id,title")
      .eq("checkin_code", parsed.data.eventCode)
      .maybeSingle();

    if (eventError) {
      return {
        error: "Unable to load this check-in link. Please try again or contact the event organizer."
      };
    }

    if (!event) {
      return {
        error: "This check-in link is not valid."
      };
    }

    const existingParticipant = await findExistingParticipant(supabase, event.id, normalizedEmail);

    if (existingParticipant) {
      const validCertificate = await findValidCertificate(supabase, event.id, existingParticipant.id);

      if (validCertificate) {
        certificateSlug = validCertificate.public_slug;
      } else {
        const existingCertificate = await findAnyCertificate(supabase, event.id, existingParticipant.id);

        if (existingCertificate) {
          return {
            error:
              lang === "ja"
                ? "このメールアドレスはすでにこのイベントにチェックインしています。必要な場合は主催者に連絡してください。"
                : "This email has already checked in for this event. Contact the event organizer if you need help."
          };
        }

        certificateSlug = await createCertificate(supabase, event.id, existingParticipant.id, existingParticipant.role);
        await ensureCheckinPoints(supabase, event, existingParticipant.id, existingParticipant.role);
      }
    } else {
      const { data: participant, error: participantError } = await supabase
        .from("participants")
        .insert({
          event_id: event.id,
          name: parsed.data.name.trim(),
          email: normalizedEmail,
          role: parsed.data.role
        })
        .select("id,role")
        .single();

      if (participantError || !participant?.id) {
        return {
          error: CHECKIN_ERROR
        };
      }

      certificateSlug = await createCertificate(supabase, event.id, participant.id, participant.role);
      await ensureCheckinPoints(supabase, event, participant.id, participant.role);
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : CHECKIN_ERROR
    };
  }

  redirect(withLanguage(`/cert/${certificateSlug}`, lang));
}
