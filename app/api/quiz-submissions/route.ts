import { neon } from "@neondatabase/serverless";
import { normalizePostgresUrl } from "@/lib/normalize-postgres-url";
import { parseQuizSubmissionBody } from "@/lib/parse-quiz-payload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const databaseUrl = normalizePostgresUrl(process.env.POSTGRES_URL);
  if (!databaseUrl) {
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

  const sql = neon(databaseUrl);
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
