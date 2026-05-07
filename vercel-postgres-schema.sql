-- Run once: Vercel Dashboard → Storage → your Postgres → Query, or any SQL client.

CREATE TABLE IF NOT EXISTS civiquest_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS civiquest_submissions_created_at_idx
  ON civiquest_submissions (created_at DESC);
