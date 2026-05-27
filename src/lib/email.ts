export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function maskEmail(email: string) {
  const normalized = normalizeEmail(email);
  const [localPart, domain] = normalized.split("@");

  if (!localPart || !domain) {
    return "***";
  }

  const visible = localPart.slice(0, Math.min(4, localPart.length));

  return `${visible}***@${domain}`;
}
