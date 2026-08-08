# Engineering Notes

Internal implementation detail, module ownership, and the fix/build log for
PrepWise AI. Moved out of the top-level README so that file stays a fast,
recruiter-facing pitch — this is where the "how" lives.

## Database

MySQL. `backend/database/schema.sql` has the full `CREATE DATABASE` +
`CREATE TABLE` statements, matching `backend/models/*.js` exactly - one
table per model, correct types, foreign keys, unique constraints. You do
not have to run this by hand: `npm run dev` calls `syncDatabase()` on
boot and Sequelize creates every table automatically the first time.

To run it by hand instead:
```
mysql -u root -p < backend/database/schema.sql
```
Then set `backend/.env` to point at it - `DB_NAME=prepwise_ai_app` already
matches the schema file, so you only need `DB_USER` / `DB_PASSWORD` / `DB_HOST`
to match your local MySQL install. (Named `prepwise_ai_app`, not
`prepwise_ai`, on purpose - avoids colliding with anything else already
using `prepwise_ai` on the same MySQL server.)

**Checking what signup/login write** - once you sign up through the app
(or `POST /api/auth/signup`), the row lands in the `users` table with your
name, email, and a bcrypt-hashed password (never plaintext):
```sql
USE prepwise_ai_app;
SELECT id, name, email, plan, createdAt FROM users;
```
Login (`POST /api/auth/login`) looks up that row by email and compares
the password against `passwordHash` with bcrypt - nothing mocked.

## Auth pages

`frontend/src/pages/Login.jsx` and `Signup.jsx` are wired in as real routes
(`/login`, `/signup`) with two small supporting files: `components/navbar/Navbar.jsx`
and `layouts/AuthSidePanel.jsx`. They call the backend directly at
`http://localhost:3000/api/auth/...` (not through the Vite proxy) - that's
why the backend's default `PORT` is `3000`, not `5000`. `ProtectedRoute`
(`components/ProtectedRoute.jsx`) guards every `/dashboard`, `/resume/*`,
etc. route - no token in `localStorage` means an instant redirect to
`/login` instead of a failed API call.

## Data model - who owns what

One shared `ResumeAnalysisProfile` row per resume (`resume_analyses` table:
scalar score columns + JSON columns for variable-length data like skills/
sections/suggestions). Write ownership is enforced in the controllers, not
just convention:

| Module | Owns |
|---|---|
| Resume Intelligence | creates the profile; owns all scores, skills, sections, strengths/weaknesses, suggestions |
| Opportunity Matcher | appends to `missingSkills` only (bidirectional edge back into the shared profile) |
| Skill Builder | its own `skill_progress` table only - never touches the resume profile |
| Mock Assessment | its own `assessment_attempts` table only |
| AI Mock Interview | its own `interview_sessions` / `interview_questions` tables only |
| Analytics | read-only aggregation over `metric_snapshots` - never writes |
| Dashboard | read-only; computes Next Best Action on every read, never stores it |

## What's real vs. heuristic vs. not built

- **Real, deterministic**: ATS/recruiter/resume/quality scoring, JD match %,
  job match %, Opportunity Matcher's "why this fits" insight text, next-best-
  action, analytics trends/deltas, skill progress, assessment pass/fail,
  direct resume editing re-score.
- **Heuristic placeholder** (until you add `OPENAI_API_KEY`): AI Review text,
  interview answer feedback (`backend/services/interviewScoring.js`), AI
  Tutor. The scoring math is fully separated from these so wiring in a real
  model later never touches the deterministic path.
- **Not built as a frontend page**: none currently - Tailored Resume shipped
  in Round 3 (see below).

## Tests

`cd backend && npm test` runs Jest + Supertest: ATS engine determinism and
edge cases, job-match boundary math, auth validation, and - the important
one - Mock Assessment / AI Mock Interview gating at the exact threshold
boundary (pass at threshold, fail one point below, one company's pass
doesn't unlock another company's interview), plus cross-user auth isolation
on Applications.

**Sandbox note**: these couldn't be executed in the environment this was
built in (network calls `sqlite3`'s native binary needs were blocked, no
MySQL server or root access available there). What was verified instead:
every file passes `node --check` (syntax), every backend module imports
cleanly against a real `mysql2` connection string (fails only at the actual
`.authenticate()` call, expected with no DB running), and the frontend
builds clean with zero errors. Run `npm test` locally or in CI with normal
internet access - `sqlite3`'s prebuilt binary installs in seconds and the
suite runs against an in-memory DB, no MySQL server needed.

## Live Internshala sync (Opportunity Matcher)

`backend/services/internshalaScraper.js` pulls real, current internships
from Internshala's public listing/detail pages (no official third-party API
exists) and upserts them into the `jobs` table alongside the local seed
catalog. Runs automatically ~5s after server startup and every 6 hours
after that; disable with `INTERNSHALA_SYNC_ENABLED=false` in `.env`, or
tune categories/volume with `INTERNSHALA_CATEGORIES` /
`INTERNSHALA_MAX_PER_CATEGORY`. Trigger a manual run any time with
`node backend/scripts/syncInternshala.js` or `POST /api/jobs/sync-internshala`.
Parsing is anchored on stable visible labels ("Duration", "Stipend", the
page `<title>`) rather than CSS classes, so it's reasonably resilient to
redesigns, but it can return 0 results if Internshala changes their copy or
adds bot protection - it fails soft (logs a warning, leaves existing jobs
alone) and never crashes the server.

## Skill Builder

Each category (MCQ, Coding, AI Tutor, Aptitude, HR, Company) opens as its
own full page at `/skills/:category`. 8 MCQ + 8 aptitude questions, and 3
hard coding problems (longest increasing subsequence, longest unique
substring, unique-pairs-summing-to-target) graded for real - the submitted
JS function runs against real test cases in the browser
(`frontend/src/utils/runCodingTests.js`) and reports genuine pass/fail per
test. HR/Company questions are open-ended with optional real AI feedback
from OpenAI. AI Tutor is wired to `POST /skills/ai-tutor/ask`, needs
`OPENAI_API_KEY` set in `backend/.env` - without it, AI Tutor and
open-answer feedback clearly report themselves as unavailable rather than
failing silently.

Practice sessions shuffle and serve a random subset each visit (8 of 16
MCQ/aptitude questions, 5 of 10 HR/Company questions, all 3 coding problems
every time), one question at a time with a Next button, ending in a
right/wrong summary screen.

## Resume Intelligence - fix log

- Analysis page was rendering "Sections Found: /" and empty skills lists -
  frontend referenced fields (`topSkills`, `keySkillsFound`) that never
  existed in the API response. Fixed in `resume.controller.js`'s
  `getAnalysis` (derives them from the persisted `sections` array) and in
  `ResumeAnalysis.jsx` (reads the real `skills` field).
- "Potential" score on the Improve page was stuck at "+0 points" - it
  referenced `data.suggestions`, a field that never existed (the real field
  is `suggestionsByTab`). Fixed.
- Reject (X), Undo All, Save Changes, Download as PDF, and Download as DOCX
  on the Improve page had no `onClick` handlers - fixed all five. Save
  Changes now calls `POST /resume/:id/apply-suggestions`, which mechanically
  applies accepted keyword/section/certification suggestions and re-runs the
  real ATS engine - the "after" score is genuinely recomputed. Formatting
  suggestions aren't auto-applied (rewriting prose isn't mechanically safe)
  - they're reported back for Edit Resume Directly. Download as PDF opens a
  print-ready view; Download as DOCX generates a real `.doc` file
  (HTML-as-.doc) - both with zero new dependencies.
- Resume Upload has an optional Job Description field (the backend already
  accepted `jobDescription` on upload, just wasn't exposed in the UI).
- Tailored Resume page (`/resume/:id/tailor`) - backend endpoint already
  existed, had no frontend until now. Paste a JD, get a real JD-match score
  plus matched vs. missing skills via the same deterministic engine used
  everywhere else.

## Round 3: OpenAI provider switch, theme, and pipeline completion

- AI provider switched from Groq to OpenAI throughout - `backend/services/openaiClient.js`
  (`OPENAI_API_KEY`, `OPENAI_MODEL`, defaults to `gpt-4o-mini`). AI Tutor,
  open-answer feedback, and Tailored Resume generation all go through this
  one file.
- Real light/dark theme on every dashboard page (`ThemeContext.jsx` + CSS
  custom properties), working profile dropdown, wired "View Recommendation"
  button on Career Command Center.
- Real mic input on AI Mock Interview via the Web Speech API
  (`useSpeechToText.js`) - unsupported browsers get a clear fallback message.
- Opportunity Matcher: removed old demo job entries linking to generic
  careers homepages instead of real postings - listings now come exclusively
  from the Internshala scraper, each card shows matched vs. missing skills.
  Run `node backend/scripts/seedJobs.js` once to purge stale demo jobs.
- Applications rebuilt as a real status-tracker board (Saved / Applied /
  Interview / Offered / Rejected) with per-card status dropdown and delete.
- Mock Assessment: real countdown timer that auto-submits at zero, a webcam
  preview (visual simulation only - nothing recorded/uploaded), and
  company-specific exam patterns - the seeded `assessmentPattern`
  (aptitude_heavy / coding_heavy / balanced / behavioral_heavy) drives which
  sections appear, question counts, and exam duration per company.
- Tailored Resume completed: 8 templates (Classic ATS, Modern Minimal,
  Compact Technical, Two-Column Sidebar, Bold Header, Timeline,
  Skills-Forward, Executive), OpenAI rewrites wording/emphasis for the JD -
  instructed never to invent employers, titles, dates, or achievements.
  Download as PDF (print) or `.doc`. Actually submitting to a company's
  application system is still manual via its real Apply link.
