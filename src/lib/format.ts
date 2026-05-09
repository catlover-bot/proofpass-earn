import { format } from "date-fns";

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Not scheduled";
  }

  return format(new Date(value), "PPP p");
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not scheduled";
  }

  return format(new Date(value), "PPP");
}
