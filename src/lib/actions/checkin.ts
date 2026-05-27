"use server";

import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ROLE_ACHIEVEMENT_WEIGHT } from "@/lib/achievement-ledger";
import { normalizeEmail } from "@/lib/email";
import { normalizeLanguage, withLanguage } from "@/lib/i18n";
import { getMissingEnv, getSupabaseClient } from "@/lib/supabase/client";
import type { Database, ParticipantRole } from "@/lib/supabase/types";
import { checkinFormSchema, type CheckinFormValues } from "@/lib/validation/checkin";

export type CheckinActionResult = {
  error?: string;
  fieldErrors?: Partial<Record<keyof CheckinFormValues, string[]>>;
};

const CHECKIN_ERROR = "Unable to complete check-in. Please try again or contact the event organizer.";

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
    .select("id,public_slug")
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
    .select("id,public_slug,status")
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
  participantId: string
) {
  const certificateSlug = `proof_${nanoid(14)}`;
  const { data, error } = await supabase
    .from("certificates")
    .insert({
      event_id: eventId,
      participant_id: participantId,
      public_slug: certificateSlug,
      certificate_type: "attendance",
      verification_level: "checkin",
      approval_status: "approved",
      status: "valid"
    })
    .select("id,public_slug")
    .single();

  if (error || !data) {
    throw new Error(CHECKIN_ERROR);
  }

  return data;
}

async function findInvitation(
  supabase: SupabaseClient<Database>,
  eventId: string,
  input: { inviteToken?: string; normalizedEmail: string }
) {
  if (input.inviteToken) {
    const { data, error } = await supabase
      .from("event_invitations")
      .select("id,email,normalized_email,name,role,status")
      .eq("event_id", eventId)
      .eq("invite_token", input.inviteToken)
      .neq("status", "revoked")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (data) {
      return data;
    }
  }

  const { data, error } = await supabase
    .from("event_invitations")
    .select("id,email,normalized_email,name,role,status")
    .eq("event_id", eventId)
    .eq("normalized_email", input.normalizedEmail)
    .neq("status", "revoked")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function markInvitationCheckedIn(
  supabase: SupabaseClient<Database>,
  invitationId: string | undefined,
  participantId: string,
  certificateId: string | undefined
) {
  if (!invitationId) {
    return;
  }

  const { error } = await supabase
    .from("event_invitations")
    .update({
      status: "checked_in",
      checked_in_at: new Date().toISOString(),
      participant_id: participantId,
      certificate_id: certificateId ?? null
    })
    .eq("id", invitationId);

  if (error) {
    throw new Error(CHECKIN_ERROR);
  }
}

async function ensureCheckinAchievementLedger(
  supabase: SupabaseClient<Database>,
  event: { id: string; title: string },
  participantId: string
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
    points: ROLE_ACHIEVEMENT_WEIGHT.attendee,
    reason: `attendance check-in for ${event.title}`
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
  let certificateId: string | undefined;
  let participantId: string | undefined;
  let invitationId: string | undefined;

  try {
    const normalizedEmail = normalizeEmail(parsed.data.email);
    let eventResult = await supabase
      .from("events")
      .select("id,title,checkin_mode")
      .eq("checkin_code", parsed.data.eventCode)
      .maybeSingle();

    if (eventResult.error && eventResult.error.message.includes("checkin_mode")) {
      eventResult = await supabase
        .from("events")
        .select("id,title")
        .eq("checkin_code", parsed.data.eventCode)
        .maybeSingle();
    }

    const event = eventResult.data
      ? {
          ...eventResult.data,
          checkin_mode: "checkin_mode" in eventResult.data ? eventResult.data.checkin_mode : "public"
        }
      : null;
    const eventError = eventResult.error;

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

    let invitation:
      | {
          id: string;
          role: ParticipantRole | null;
          status: string;
        }
      | null = null;

    try {
      invitation = await findInvitation(supabase, event.id, {
        inviteToken: parsed.data.inviteToken,
        normalizedEmail
      });
      invitationId = invitation?.id;
    } catch {
      if (event.checkin_mode === "invite_only") {
        return {
          error:
            lang === "ja"
              ? "招待情報を確認できません。主催者にお問い合わせください。"
              : "Unable to verify the invitation. Please contact the organizer."
        };
      }
    }

    if (event.checkin_mode === "invite_only" && !invitation) {
      return {
        error:
          lang === "ja"
            ? "このイベントは招待者限定です。招待リンクを使用するか、主催者にお問い合わせください。"
            : "This event is invite-only. Please use your invitation link or contact the organizer."
      };
    }

    const existingParticipant = await findExistingParticipant(supabase, event.id, normalizedEmail);

    if (existingParticipant) {
      participantId = existingParticipant.id;
      const validCertificate = await findValidCertificate(supabase, event.id, existingParticipant.id);

      if (validCertificate) {
        certificateId = validCertificate.id;
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

        const certificate = await createCertificate(supabase, event.id, existingParticipant.id);
        certificateId = certificate.id;
        certificateSlug = certificate.public_slug;
        await ensureCheckinAchievementLedger(supabase, event, existingParticipant.id);
      }
    } else {
      const { data: participant, error: participantError } = await supabase
        .from("participants")
        .insert({
          event_id: event.id,
          name: parsed.data.name.trim(),
          email: normalizedEmail,
          role: "attendee"
        })
        .select("id,role")
        .single();

      if (participantError || !participant?.id) {
        return {
          error: CHECKIN_ERROR
        };
      }

      participantId = participant.id;
      const certificate = await createCertificate(supabase, event.id, participant.id);
      certificateId = certificate.id;
      certificateSlug = certificate.public_slug;
      await ensureCheckinAchievementLedger(supabase, event, participant.id);
    }

    if (participantId) {
      await markInvitationCheckedIn(supabase, invitationId, participantId, certificateId);
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : CHECKIN_ERROR
    };
  }

  redirect(withLanguage(`/cert/${certificateSlug}`, lang));
}
