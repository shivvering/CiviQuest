# CiviQuest 🐬

A Duolingo-style civic sense adventure for Indian kids in classes 5–8, live at
[civiquest.in](https://civiquest.in). Guided by **Civvy** the dolphin, every
class gets five levels (10 missions each, 60 seconds per mission): four themed
quests — Clean Streets 🧼, Road Smarts 🚦, Kind in Public 🤝, Water & Nature 💧
— plus the mixed **Civic Hero Finale 👑** boss level, earning XP, streaks, and
badges along the way.

Answers are saved (only with parent/guardian consent) to power a civic-awareness
research study.

## Development

```bash
npm install
npm run dev        # http://localhost:3000
```

Environment (`.env.local`, see `vercel-storage.env.sample`):

- `POSTGRES_URL` — Neon Postgres connection string (Vercel → Storage).
- `TEACHER_CODE` — shared access code for the teacher dashboard at `/teacher`.

One-time database setup / idempotent migration:

```bash
npm run setup-db
```

## Map of the app

- `/` — the game: hero → onboarding (with parent consent) → quest map →
  quiz → results. Badges and Profile live in the bottom tabs.
- `/about` — mission, why classes 5–8, Civvy's story, data promises.
- `/teacher` — class dashboard: teachers load their school + class responses
  with the access code, review per-question answers, and save a grade +
  encouraging comment.
- `POST /api/quiz-submissions` — saves a completed level (validated payload).
- `GET /api/quiz-submissions?school=&className=` — teacher listing
  (requires `x-teacher-code` header).
- `POST /api/grade` — saves teacher grade/comment for a submission.

Questions live in `lib/civiquest-questions.ts`, tagged per class band (5–6 /
7–8) so every child gets 10 grade-appropriate missions per category.

## Deploy

```bash
npx vercel --prod
```

The Vercel project (`civic-app`) serves civiquest.in; Neon Postgres is attached
via the Vercel marketplace integration.
