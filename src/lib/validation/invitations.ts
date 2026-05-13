import { z } from "zod";

const optionalRole = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.enum(["attendee", "speaker", "contributor", "organizer"]).optional()
);

export const invitationFormSchema = z.object({
  eventId: z.string().uuid("Event id is required."),
  email: z.string().trim().email("Enter a valid email address."),
  name: z.string().trim().optional(),
  role: optionalRole,
  lang: z.enum(["en", "ja"]).optional()
});

export const bulkInvitationFormSchema = z.object({
  eventId: z.string().uuid("Event id is required."),
  bulkText: z.string().trim().min(1, "Paste at least one invitation email."),
  role: optionalRole,
  lang: z.enum(["en", "ja"]).optional()
});

export type InvitationFormValues = z.infer<typeof invitationFormSchema>;
export type BulkInvitationFormValues = z.infer<typeof bulkInvitationFormSchema>;
