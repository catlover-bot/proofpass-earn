import { z } from "zod";

export const checkinFormSchema = z.object({
  eventCode: z.string().trim().min(1, "Event code is required."),
  name: z.string().trim().min(2, "Enter your name."),
  email: z.string().trim().email("Enter a valid email address."),
  role: z.enum(["attendee", "speaker", "contributor", "organizer"])
});

export type CheckinFormValues = z.infer<typeof checkinFormSchema>;
