import { z } from "zod";

const dateTimeValue = z
  .string()
  .min(1, "Enter a date and time.")
  .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date and time.");

export const eventFormSchema = z
  .object({
    title: z.string().trim().min(2, "Enter an event title."),
    description: z.string().trim().min(2, "Enter a short description."),
    location: z.string().trim().min(2, "Enter a location."),
    starts_at: dateTimeValue,
    ends_at: dateTimeValue
  })
  .refine((value) => new Date(value.ends_at).getTime() > new Date(value.starts_at).getTime(), {
    message: "End time must be after the start time.",
    path: ["ends_at"]
  });

export type EventFormValues = z.infer<typeof eventFormSchema>;
