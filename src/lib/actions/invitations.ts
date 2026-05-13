"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeEmail } from "@/lib/email";
import { normalizeLanguage } from "@/lib/i18n";
import { assertOrganizerCanAccessEvent, getOrganizerSupabaseClient, requireOrganizer } from "@/lib/organizer-auth";
import { getMissingEnv, getSupabaseClient } from "@/lib/supabase/client";
import type { Database, ParticipantRole } from "@/lib/supabase/types";
import {
  bulkInvitationFormSchema,
  invitationFormSchema,
  type BulkInvitationFormValues,
  type InvitationFormValues
} from "@/lib/validation/invitations";

export type InvitationActionResult = {
  error?: string;
  message?: string;
};

const INVITATION_SETUP_ERROR = "Invitation setup is not ready. Run supabase/invitations.sql in Supabase.";

function isInvitationSchemaMissing(message: string) {
  return (
    message.includes("event_invitations") ||
    message.includes("checkin_mode") ||
    message.includes("schema cache") ||
    message.includes("column") ||
    message.includes("relation")
  );
}

function formatInvitationError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unable to save invitations.";

  return isInvitationSchemaMissing(message) ? INVITATION_SETUP_ERROR : "Unable to save invitations. Please try again.";
}

function parseInvitationLine(line: string) {
  const trimmed = line.trim();
  const match = trimmed.match(/^(.*?)<([^<>]+)>$/);

  if (match) {
    return {
      name: match[1].trim() || undefined,
      email: match[2].trim()
    };
  }

  return {
    name: undefined,
    email: trimmed
  };
}

async function upsertInvitation(
  supabase: SupabaseClient<Database>,
  input: {
    eventId: string;
    email: string;
    name?: string;
    role?: ParticipantRole;
  }
) {
  const normalizedEmail = normalizeEmail(input.email);
  const { data: existing, error: existingError } = await supabase
    .from("event_invitations")
    .select("id")
    .eq("event_id", input.eventId)
    .eq("normalized_email", normalizedEmail)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    const { error } = await supabase
      .from("event_invitations")
      .update({
        email: input.email.trim(),
        name: input.name?.trim() || null,
        role: input.role ?? null
      })
      .eq("id", existing.id);

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  const { error } = await supabase.from("event_invitations").insert({
    event_id: input.eventId,
    email: input.email.trim(),
    normalized_email: normalizedEmail,
    name: input.name?.trim() || null,
    role: input.role ?? null,
    invite_token: `inv_${nanoid(24)}`
  });

  if (error) {
    throw new Error(error.message);
  }
}

function successMessage(lang: "en" | "ja", count: number) {
  if (lang === "ja") {
    return `${count}件の招待を保存しました。`;
  }

  return count === 1 ? "Invitation saved." : `${count} invitations saved.`;
}

export async function addInvitationAction(values: InvitationFormValues): Promise<InvitationActionResult> {
  const lang = normalizeLanguage(values.lang);
  const parsed = invitationFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      error: lang === "ja" ? "招待内容を確認してください。" : "Review the invitation details and try again."
    };
  }

  const missing = getMissingEnv();
  if (missing.length > 0) {
    return {
      error: `Missing setup values: ${missing.join(", ")}.`
    };
  }

  const organizer = await requireOrganizer(lang);
  const supabase = getOrganizerSupabaseClient(organizer) ?? getSupabaseClient();
  if (!supabase) {
    return {
      error: "Supabase is not configured yet."
    };
  }

  try {
    const canAccessEvent = await assertOrganizerCanAccessEvent(supabase, organizer, parsed.data.eventId);

    if (!canAccessEvent) {
      return {
        error: lang === "ja" ? "このイベントを管理する権限がありません。" : "You do not have access to this event."
      };
    }

    await upsertInvitation(supabase, {
      eventId: parsed.data.eventId,
      email: parsed.data.email,
      name: parsed.data.name,
      role: parsed.data.role
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return {
        error:
          lang === "ja"
            ? "招待リストのメールアドレスを確認してください。"
            : "Review the invitation emails and try again."
      };
    }

    return {
      error: formatInvitationError(error)
    };
  }

  revalidatePath(`/admin/events/${parsed.data.eventId}`);

  return {
    message: successMessage(lang, 1)
  };
}

export async function addBulkInvitationsAction(values: BulkInvitationFormValues): Promise<InvitationActionResult> {
  const lang = normalizeLanguage(values.lang);
  const parsed = bulkInvitationFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      error: lang === "ja" ? "招待リストを確認してください。" : "Review the invitation list and try again."
    };
  }

  const missing = getMissingEnv();
  if (missing.length > 0) {
    return {
      error: `Missing setup values: ${missing.join(", ")}.`
    };
  }

  const organizer = await requireOrganizer(lang);
  const supabase = getOrganizerSupabaseClient(organizer) ?? getSupabaseClient();
  if (!supabase) {
    return {
      error: "Supabase is not configured yet."
    };
  }

  const invitations = parsed.data.bulkText
    .split(/\r?\n/)
    .map(parseInvitationLine)
    .filter((invitation) => invitation.email.length > 0);

  if (invitations.length === 0) {
    return {
      error: lang === "ja" ? "招待メールアドレスを入力してください。" : "Enter at least one invitation email."
    };
  }

  try {
    const canAccessEvent = await assertOrganizerCanAccessEvent(supabase, organizer, parsed.data.eventId);

    if (!canAccessEvent) {
      return {
        error: lang === "ja" ? "このイベントを管理する権限がありません。" : "You do not have access to this event."
      };
    }

    for (const invitation of invitations) {
      const checked = invitationFormSchema.parse({
        eventId: parsed.data.eventId,
        email: invitation.email,
        name: invitation.name,
        role: parsed.data.role,
        lang
      });

      await upsertInvitation(supabase, {
        eventId: checked.eventId,
        email: checked.email,
        name: checked.name,
        role: checked.role
      });
    }
  } catch (error) {
    return {
      error: formatInvitationError(error)
    };
  }

  revalidatePath(`/admin/events/${parsed.data.eventId}`);

  return {
    message: successMessage(lang, invitations.length)
  };
}
