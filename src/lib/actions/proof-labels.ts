"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAchievementBadge } from "@/lib/achievements";
import { normalizeLanguage, withLanguage } from "@/lib/i18n";
import { assertOrganizerCanAccessEvent, getOrganizerSupabaseClient, requireOrganizer } from "@/lib/organizer-auth";
import { PROOF_LABEL_CERTIFICATE_TYPE, PROOF_LABEL_KEYS, isProofLabelKey, type ProofLabelKey } from "@/lib/proof-types";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { CertificateType, Database, ParticipantRole } from "@/lib/supabase/types";
import { isValidUuid } from "@/lib/validation/uuid";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function eventRedirect(eventId: string, lang: "en" | "ja"): never {
  redirect(withLanguage(`/admin/events/${eventId}`, lang));
}

function roleForProofLabel(labelKey: ProofLabelKey | null): ParticipantRole {
  if (labelKey === "speaker") {
    return "speaker";
  }

  if (labelKey === "contributor") {
    return "contributor";
  }

  return "attendee";
}

async function getOrCreateCertificate(
  supabase: SupabaseClient<Database>,
  eventId: string,
  participantId: string,
  certificateType: CertificateType
) {
  const { data: existing, error: existingError } = await supabase
    .from("certificates")
    .select("id,public_slug")
    .eq("event_id", eventId)
    .eq("participant_id", participantId)
    .order("issued_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    return existing;
  }

  const { data: created, error: createError } = await supabase
    .from("certificates")
    .insert({
      event_id: eventId,
      participant_id: participantId,
      public_slug: `proof_${nanoid(14)}`,
      certificate_type: certificateType,
      verification_level: "checkin",
      approval_status: "approved",
      status: "valid"
    })
    .select("id,public_slug")
    .single();

  if (createError || !created) {
    throw new Error(createError?.message ?? "Certificate could not be created.");
  }

  return created;
}

export async function updateParticipantProofLabelAction(formData: FormData) {
  const lang = normalizeLanguage(formData.get("lang"));
  const eventId = getString(formData, "eventId");
  const participantId = getString(formData, "participantId");
  const rawLabelKey = getString(formData, "labelKey");
  const labelKey = isProofLabelKey(rawLabelKey) ? rawLabelKey : null;

  if (!isValidUuid(eventId) || !isValidUuid(participantId)) {
    redirect(withLanguage("/admin/events", lang));
  }

  const organizer = await requireOrganizer(lang);
  const supabase = getOrganizerSupabaseClient(organizer) ?? getSupabaseClient();

  if (!supabase) {
    eventRedirect(eventId, lang);
  }

  const canAccessEvent = await assertOrganizerCanAccessEvent(supabase, organizer, eventId);

  if (!canAccessEvent) {
    redirect(withLanguage("/admin/events", lang));
  }

  try {
    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .select("id")
      .eq("id", participantId)
      .eq("event_id", eventId)
      .maybeSingle();

    if (participantError || !participant) {
      throw new Error(participantError?.message ?? "Participant not found.");
    }

    const certificateType = labelKey ? PROOF_LABEL_CERTIFICATE_TYPE[labelKey] : "attendance";
    const certificate = await getOrCreateCertificate(supabase, eventId, participantId, certificateType);
    const { error: participantUpdateError } = await supabase
      .from("participants")
      .update({ role: roleForProofLabel(labelKey) })
      .eq("id", participantId);

    if (participantUpdateError) {
      throw new Error(participantUpdateError.message);
    }

    const { error: certificateUpdateError } = await supabase
      .from("certificates")
      .update({
        certificate_type: certificateType,
        verification_level: labelKey ? "organizer_approved" : "checkin",
        approval_status: "approved"
      })
      .eq("id", certificate.id);

    if (certificateUpdateError) {
      throw new Error(certificateUpdateError.message);
    }

    const { error: deleteError } = await supabase
      .from("badges")
      .delete()
      .eq("participant_id", participantId)
      .in("badge_type", [...PROOF_LABEL_KEYS]);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    if (labelKey) {
      const badge = getAchievementBadge("en", labelKey);
      const { error: insertError } = await supabase.from("badges").insert({
        participant_id: participantId,
        badge_type: labelKey,
        label: badge.label,
        description: badge.description
      });

      if (insertError) {
        throw new Error(insertError.message);
      }
    }

    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath(`/cert/${certificate.public_slug}`);
  } catch (error) {
    console.error("Failed to update participant proof label.", error);
  }

  eventRedirect(eventId, lang);
}
