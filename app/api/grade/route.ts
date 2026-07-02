import { neon } from "@neondatabase/serverless";
import { normalizePostgresUrl } from "@/lib/normalize-postgres-url";
import { isTeacherCodeValid } from "@/lib/teacher-auth";

export const runtime = "nodejs";

const ALLOWED_GRADES = ["A+", "A", "B", "C", "Needs Practice"];

export async function POST(request: Request) {
  if (!isTeacherCodeValid(request.headers.get("x-teacher-code"))) {
    return Response.json({ error: "Invalid access code." }, { status: 401 });
  }

  const databaseUrl = normalizePostgresUrl(process.env.POSTGRES_URL);
  if (!databaseUrl) {
    return Response.json({ error: "Database not configured." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return Response.json({ error: "Invalid body." }, { status: 400 });
  }

  const { id, grade, comment, teacherName } = body as Record<string, unknown>;
  if (
    typeof id !== "string" ||
    typeof grade !== "string" ||
    !ALLOWED_GRADES.includes(grade) ||
    typeof teacherName !== "string" ||
    teacherName.trim().length === 0 ||
    (comment !== undefined && typeof comment !== "string")
  ) {
    return Response.json(
      {
        error: `id, teacherName and a grade (${ALLOWED_GRADES.join(", ")}) are required.`,
      },
      { status: 400 },
    );
  }

  const sql = neon(databaseUrl);
  try {
    const rows = await sql`
      UPDATE civiquest_submissions
      SET teacher_grade = ${grade},
          teacher_comment = ${(comment as string | undefined)?.slice(0, 1000) ?? null},
          graded_by = ${teacherName.trim().slice(0, 120)},
          graded_at = NOW()
      WHERE id = ${id}::uuid
      RETURNING id
    `;
    if (rows.length === 0) {
      return Response.json({ error: "Submission not found." }, { status: 404 });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Database update failed";
    return Response.json({ error: message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
