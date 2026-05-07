/**
 * @neondatabase/serverless `neon()` expects postgresql://…
 * Vercel/Neon often provide postgres://… which throws until normalized.
 */
export function normalizePostgresUrl(raw: string | undefined): string {
  let u = String(raw ?? "").trim();
  if (!u) {
    return "";
  }
  if (u.startsWith("postgres://") && !u.startsWith("postgresql://")) {
    u = `postgresql://${u.slice("postgres://".length)}`;
  }
  return u;
}

export function isValidNeonConnectionString(url: string): boolean {
  if (!url || url.length < 14) {
    return false;
  }
  // neon() needs postgresql:// (normalizePostgresUrl already fixed postgres://)
  if (!/^postgresql:\/\//i.test(url)) {
    return false;
  }
  // e.g. postgresql://user:pass@host/db OR postgresql://host:5432/db — @ is not always present
  return /^postgresql:\/\/.+/i.test(url);
}
