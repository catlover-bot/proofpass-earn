export const ADMIN_BASIC_AUTH_ENV = [
  "ADMIN_BASIC_AUTH_USER",
  "ADMIN_BASIC_AUTH_PASSWORD"
] as const;

export function getMissingAdminBasicAuthEnv() {
  return ADMIN_BASIC_AUTH_ENV.filter((name) => !process.env[name]);
}

export function hasAdminBasicAuthEnv() {
  return getMissingAdminBasicAuthEnv().length === 0;
}
