import { neon } from "@neondatabase/serverless";
import { normalizePostgresUrl } from "@/lib/normalize-postgres-url";
import { parseQuizSubmissionBody } from "@/lib/parse-quiz-payload";
import { isTeacherCodeValid } from "@/lib/teacher-auth";

export const runtime = "nodejs";

function getSql() {
  const databaseUrl = normalizePostgresUrl(process.env.POSTGRES_URL);
  if (!databaseUrl) {
    return null;
  }
  return neon(databaseUrl);
}

export async function POST(request: Request) {
  const sql = getSql();
  if (!sql) {
    return Response.json(
      {
        error:
          "POSTGRES_URL is not set. Add Vercel Postgres (Storage) and copy POSTGRES_URL to .env.local.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const payload = parseQuizSubmissionBody(body);
  if (!payload) {
    return Response.json({ error: "Invalid quiz payload." }, { status: 400 });
  }

  try {
    await sql`
      INSERT INTO civiquest_submissions (parent_email, payload)
      VALUES (${payload.parentEmail}, ${JSON.stringify(payload)}::jsonb)
    `;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Database insert failed";
    if (
      message.includes("relation") &&
      message.includes("civiquest_submissions")
    ) {
      return Response.json(
        {
          error:
            "Table missing. Run vercel-postgres-schema.sql on your database (Vercel Storage → Query).",
        },
        { status: 503 },
      );
    }
    return Response.json({ error: message }, { status: 500 });
  }

  return Response.json({ ok: true });
}

/** Teacher dashboard: list submissions for one school + class. */
export async function GET(request: Request) {
  if (!isTeacherCodeValid(request.headers.get("x-teacher-code"))) {
    return Response.json({ error: "Invalid access code." }, { status: 401 });
  }

  const sql = getSql();
  if (!sql) {
    return Response.json({ error: "Database not configured." }, { status: 503 });
  }

  const url = new URL(request.url);
  const school = (url.searchParams.get("school") ?? "").trim();
  const className = (url.searchParams.get("className") ?? "").trim();
  if (!school || !className) {
    return Response.json(
      { error: "school and className are required." },
      { status: 400 },
    );
  }

  try {
    const rows = await sql`
      SELECT id, created_at, parent_email, payload,
             teacher_grade, teacher_comment, graded_by, graded_at
      FROM civiquest_submissions
      WHERE LOWER(payload->>'school') = LOWER(${school})
        AND payload->>'className' = ${className}
      ORDER BY created_at DESC
      LIMIT 500
    `;
    return Response.json({
      submissions: rows.map((row) => ({
        id: row.id,
        createdAt: row.created_at,
        parentEmail: row.parent_email,
        payload: row.payload,
        teacherGrade: row.teacher_grade,
        teacherComment: row.teacher_comment,
        gradedBy: row.graded_by,
        gradedAt: row.graded_at,
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Database query failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
