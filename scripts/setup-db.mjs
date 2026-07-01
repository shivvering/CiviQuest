/**
 * Creates civiquest_submissions. Reads POSTGRES_URL from .env.local or env.
 * Uses plain Node (no tsx) so top-level await in CJS is avoided.
 */
import { existsSync, readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

function loadEnvLocal() {
  const path = ".env.local";
  if (!existsSync(path)) {
    return;
  }
  const text = readFileSync(path, "utf8").replace(/^\uFEFF/, "");
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const eq = line.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = line.slice(0, eq).trim().replace(/^\uFEFF/, "");
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key === "POSTGRES_URL" && !process.env.POSTGRES_URL) {
      process.env.POSTGRES_URL = value;
    }
  }
}

function normalizePostgresUrl(raw) {
  let u = String(raw ?? "").trim();
  if (!u) {
    return "";
  }
  if (u.startsWith("postgres://") && !u.startsWith("postgresql://")) {
    u = `postgresql://${u.slice("postgres://".length)}`;
  }
  return u;
}

function isValidNeonConnectionString(url) {
  if (!url || url.length < 14) {
    return false;
  }
  if (!/^postgresql:\/\//i.test(url)) {
    return false;
  }
  return /^postgresql:\/\/.+/i.test(url);
}

async function main() {
  loadEnvLocal();

  const raw = process.env.POSTGRES_URL ?? "";
  if (/prisma\+/i.test(raw)) {
    console.error(
      "POSTGRES_URL looks like a Prisma Data Proxy URL (prisma+postgres…).",
    );
    console.error(
      "In Neon: Connection details → copy the URI that starts with postgres:// or postgresql:// (Node / psql).",
    );
    process.exit(1);
  }

  const url = normalizePostgresUrl(raw);
  if (!url) {
    console.error(
      "Missing POSTGRES_URL. Add it to .env.local (see vercel-storage.env.sample),",
    );
    console.error("then run: npm run setup-db");
    process.exit(1);
  }

  if (!isValidNeonConnectionString(url)) {
    console.error(
      "POSTGRES_URL must be a Postgres URI, e.g. postgresql://USER:PASSWORD@HOST.neon.tech/neondb?sslmode=require",
    );
    console.error(
      "Neon dashboard → your project → Connection string → copy (not the project id alone).",
    );
    process.exit(1);
  }

  const sql = neon(url);

  await sql`
    CREATE TABLE IF NOT EXISTS civiquest_submissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      parent_email TEXT NOT NULL,
      payload JSONB NOT NULL
    )
  `;

  await sql`
    ALTER TABLE civiquest_submissions
      ADD COLUMN IF NOT EXISTS parent_email TEXT NOT NULL DEFAULT ''
  `;

  await sql`
    ALTER TABLE civiquest_submissions
      ALTER COLUMN parent_email DROP DEFAULT
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS civiquest_submissions_created_at_idx
      ON civiquest_submissions (created_at DESC)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS civiquest_submissions_parent_email_idx
      ON civiquest_submissions (parent_email)
  `;

  console.log("Database ready: table civiquest_submissions exists.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
