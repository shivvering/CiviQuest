-- Run once: Vercel Dashboard → Storage → your Postgres → Query, or any SQL client.
-- `npm run setup-db` applies the same schema idempotently.

CREATE TABLE IF NOT EXISTS civiquest_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  parent_email TEXT NOT NULL,
  payload JSONB NOT NULL,
  -- Teacher grading (filled in from the teacher dashboard)
  teacher_grade TEXT,
  teacher_comment TEXT,
  graded_by TEXT,
  graded_at TIMESTAMPTZ
);

-- Migrations for tables created before these columns existed:
-- ALTER TABLE civiquest_submissions ADD COLUMN IF NOT EXISTS parent_email TEXT NOT NULL DEFAULT '';
-- ALTER TABLE civiquest_submissions ALTER COLUMN parent_email DROP DEFAULT;
-- ALTER TABLE civiquest_submissions ADD COLUMN IF NOT EXISTS teacher_grade TEXT;
-- ALTER TABLE civiquest_submissions ADD COLUMN IF NOT EXISTS teacher_comment TEXT;
-- ALTER TABLE civiquest_submissions ADD COLUMN IF NOT EXISTS graded_by TEXT;
-- ALTER TABLE civiquest_submissions ADD COLUMN IF NOT EXISTS graded_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS civiquest_submissions_created_at_idx
  ON civiquest_submissions (created_at DESC);

CREATE INDEX IF NOT EXISTS civiquest_submissions_parent_email_idx
  ON civiquest_submissions (parent_email);

-- Teacher dashboard filters by school + class stored inside the payload.
CREATE INDEX IF NOT EXISTS civiquest_submissions_school_class_idx
  ON civiquest_submissions ((payload->>'school'), (payload->>'className'));
