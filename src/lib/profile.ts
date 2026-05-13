import { createHash } from "crypto";
import { normalizeEmail } from "@/lib/email";

export function getProfileHashForEmail(email: string) {
  return createHash("sha256").update(normalizeEmail(email)).digest("hex");
}

export function normalizeProfileHash(value: string) {
  return value.trim().toLowerCase();
}
