-- Run once: Vercel Dashboard → Storage → your Postgres → Query, or any SQL client.

CREATE TABLE IF NOT EXISTS civiquest_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  parent_email TEXT NOT NULL,
  payload JSONB NOT NULL
);

-- If you already created this table before parent_email was added, run:
-- ALTER TABLE civiquest_submissions ADD COLUMN IF NOT EXISTS parent_email TEXT NOT NULL DEFAULT '';
-- ALTER TABLE civiquest_submissions ALTER COLUMN parent_email DROP DEFAULT;

CREATE INDEX IF NOT EXISTS civiquest_submissions_created_at_idx
  ON civiquest_submissions (created_at DESC);

CREATE INDEX IF NOT EXISTS civiquest_submissions_parent_email_idx
  ON civiquest_submissions (parent_email);
