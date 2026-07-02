import { timingSafeEqual } from "node:crypto";

/**
 * Shared-code gate for the teacher dashboard. The code lives in the
 * TEACHER_CODE env var (Vercel + .env.local) — prototype-grade access
 * control, deliberately simple: no student PII beyond what teachers
 * already know about their own class is exposed.
 */
export function isTeacherCodeValid(provided: string | null): boolean {
  const expected = process.env.TEACHER_CODE ?? "";
  if (!expected || !provided) {
    return false;
  }
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}
