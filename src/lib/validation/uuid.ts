import { z } from "zod";

const uuidSchema = z.string().uuid();

export function isValidUuid(value: string | undefined) {
  return typeof value === "string" && value !== "undefined" && uuidSchema.safeParse(value).success;
}
