# PrepWise AI

AI-powered career preparation platform. Dark/orange theme, 11 screens, full
Express + MySQL backend behind it. See `frontend/DESIGN_SYSTEM.md` for the
locked visual spec every page follows.

## Structure

```
prepwise-ai/
  frontend/   Vite + React + Tailwind (11 pages, all wired to the API - no fake data)
  backend/    Express + Sequelize + MySQL (deterministic ATS engine, full data model)
```

One database only - MySQL. No MongoDB, no second database anywhere in the stack.

## Database

MySQL. `backend/database/schema.sql` has the full `CREATE DATABASE` +
`CREATE TABLE` statements, matching `backend/models/*.js` exactly - one
table per model, correct types, foreign keys, unique constraints. You do
not have to run this by hand: `npm run dev` calls `syncDatabase()` on
boot and Sequelize creates every table automatically the first time. The
`.sql` file is there so you can inspect the schema directly, or create the
database manually if you'd rather not rely on auto-sync.

To run it by hand instead:
```
mysql -u root -p < backend/database/schema.sql
```
Then set `backend/.env` to point at it - `DB_NAME=prepwise_ai_app` already
matches the schema file, so you only need `DB_USER` / `DB_PASSWORD` / `DB_HOST`
to match your local MySQL install. (Named `prepwise_ai_app`, not
`prepwise_ai`, on purpose - if you already have something else using
`prepwise_ai` on the same MySQL server, this avoids colliding with it.)

**Checking what signup/login write** - once you sign up through the app
(or `POST /api/auth/signup`), the row lands in the `users` table with your
name, email, and a bcrypt-hashed password (never plaintext). Verify it any
time with:
```sql
USE prepwise_ai_app;
SELECT id, name, email, plan, createdAt FROM users;
```
Login (`POST /api/auth/login`) just looks up that row by email and compares
the password against `passwordHash` with bcrypt - nothing fake or mocked.

## Auth pages

`frontend/src/pages/Login.jsx` and `Signup.jsx` are wired in as real routes
(`/login`, `/signup`) with two small supporting files created to satisfy
their imports: `components/navbar/Navbar.jsx` and `layouts/AuthSidePanel.jsx`.
They call the backend directly at `http://localhost:3000/api/auth/...`
(not through the Vite proxy) - that's why the backend's default `PORT` is
`3000`, not `5000`, matching what those two files hardcode. `ProtectedRoute`
(`components/ProtectedRoute.jsx`) guards every `/dashboard`, `/resume/*`,
etc. route - no token in `localStorage` means an instant redirect to
`/login` instead of a failed API call.

## Run it

**Backend**
```
cd backend
npm install
cp .env.example .env             # fill in DB_HOST/DB_NAME/DB_USER/DB_PASSWORD and JWT_SECRET
npm run dev                       # http://localhost:3000, auto-creates tables via Sequelize sync
node scripts/seedJobs.js          # sample job listings for Opportunity Matcher
node scripts/seedCompanies.js     # ~30 real companies for the Mock Assessment / Interview search
```

**Frontend**
```
cd frontend
npm install
npm run dev                       # http://localhost:5173, proxies /api to :3000
```

Sign up via `POST /api/auth/signup` (or wire it into your existing sign-in
page - see the note at the top of `frontend/src/App.jsx`), then walk the
real pipeline:

1. Upload a resume on `/resume/upload` - real deterministic ATS scoring
   (`backend/services/atsEngine.js`), never fabricated numbers.
2. Practice every category in Skill Builder (`/skills`) - this is a hard
   gate, not optional.
3. Take the Mock Assessment (`/assessment`) for a company you search for -
   blocked until Skill Builder is fully practiced, scored against
   `MOCK_ASSESSMENT_PASS_THRESHOLD` (one number, defaults to 80).
4. Score at/above the threshold to unlock AI Mock Interview (`/interview`)
   for that same company.
5. Dashboard and Performance Analytics reflect all of it automatically -
   neither one writes anything, they only read and aggregate.

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
- **Not built as a frontend page**: Tailored Resume (JD-paste → tailored
  output). The API exists (`POST /resume/:id/tailor`) and was mockup-approved
  visually, but there's no React page wired to it yet - add one following
  the pattern in `ImproveResume.jsx` if you want it live.

## Tests

`cd backend && npm test` runs Jest + Supertest: ATS engine determinism and
edge cases, job-match boundary math, auth validation, and - the important
one - Mock Assessment / AI Mock Interview gating at the exact threshold
boundary (pass at threshold, fail one point below, one company's pass
doesn't unlock another company's interview), plus cross-user auth isolation
on Applications.

**Sandbox note**: I could not execute these tests in the environment I built
this in - it blocks the network calls `sqlite3`'s native binary needs
(same restriction that blocked headless Chromium earlier), and I don't have
a MySQL server or root access there either. What I verified instead: every
file passes `node --check` (syntax), every backend module imports cleanly
against a real `mysql2` connection string (structural correctness - only
fails at the actual `.authenticate()` call, which is expected with no DB
running), and the frontend builds clean with zero errors. Run `npm test`
yourself locally or in CI where `npm install` has normal internet access -
it'll install `sqlite3`'s prebuilt binary in seconds and run against an
in-memory DB, no MySQL server needed for the test suite itself.

## Verified

- `frontend`: `npm install && npm run build` - clean, zero errors.
- `backend`: all route/controller/service/model files import cleanly;
  `node --check` passes on every file.
- ATS engine smoke-tested against a real sample resume - real, non-random
  scores.

## Live Internshala sync (Opportunity Matcher)

`backend/services/internshalaScraper.js` pulls real, current internships
from Internshala's public listing/detail pages (no official third-party API
exists) and upserts them into the `jobs` table alongside the local seed
catalog, so Opportunity Matcher has live opportunities, not just static
demo data. Runs automatically ~5s after server startup and every 6 hours
after that; disable with `INTERNSHALA_SYNC_ENABLED=false` in `.env`, or
tune categories/volume with `INTERNSHALA_CATEGORIES` /
`INTERNSHALA_MAX_PER_CATEGORY`. Trigger a manual run any time with
`node backend/scripts/syncInternshala.js` or `POST /api/jobs/sync-internshala`.
Parsing is anchored on stable visible labels ("Duration", "Stipend", the
page `<title>`) rather than CSS classes, so it's reasonably resilient to
redesigns, but it can return 0 results if Internshala changes their copy or
adds bot protection - it fails soft (logs a warning, leaves existing jobs
alone) and never crashes the server.

## Skill Builder rewrite

Each category (MCQ, Coding, AI Tutor, Aptitude, HR, Company) now opens as
its own full page at `/skills/:category` instead of expanding inline - and
the old "Submit Answers" button now actually works (it had no `onClick`
handler at all before). Content is genuinely harder: 8 MCQ + 8 aptitude
questions, and exactly 3 hard coding problems (longest increasing
subsequence, longest unique substring, unique-pairs-summing-to-target)
graded for real - your submitted JS function runs against real test cases
right in the browser (`frontend/src/utils/runCodingTests.js`) and reports
genuine pass/fail per test, no self-reported or fake grading. HR/Company
questions are open-ended (no single right answer) with optional real AI
feedback from OpenAI. AI Tutor is now actually wired up (it used to check
for the wrong env var by mistake - fixed to check `OPENAI_API_KEY`) - ask
it anything via `POST /skills/ai-tutor/ask`. Needs `OPENAI_API_KEY` set in
`backend/.env` (see `.env.example`) - without it, AI Tutor and open-answer
feedback clearly report themselves as unavailable rather than silently
failing.

Practice sessions now also shuffle and serve a random subset each visit
(8 of 16 MCQ/aptitude questions, 5 of 10 HR/Company questions, all 3 coding
problems every time) instead of the same fixed list in the same order every
time, and each category is a genuine one-question-at-a-time flow with a
Next button, ending in a right/wrong summary screen - not one long page
with a single Submit button.

## Resume Intelligence fixes

- Analysis page was rendering "Sections Found: /" and an empty "Key Skills
  Found"/"Top Skills Detected" - the frontend referenced fields
  (`topSkills`, `keySkillsFound`) that never existed in the API response,
  and `sectionsFound`/`totalSections` were computed but never returned.
  Fixed in `resume.controller.js`'s `getAnalysis` (now derives them from
  the persisted `sections` array, no DB migration needed) and in
  `ResumeAnalysis.jsx` (now reads the real `skills` field).
- "Potential" score on the Improve page was stuck at "+0 points" no matter
  what you accepted - it referenced `data.suggestions`, a field that never
  existed (the real field is `suggestionsByTab`). Fixed.
- Reject (X), Undo All, Save Changes, Download as PDF, and Download as
  DOCX on the Improve page had no `onClick` handlers at all - fixed all
  five. Save Changes now calls a new `POST /resume/:id/apply-suggestions`
  endpoint that mechanically applies accepted keyword/section/certification
  suggestions to your resume text and **re-runs the real ATS engine** -
  the "after" score is genuinely recomputed, never a guessed delta.
  Formatting suggestions aren't auto-applied (rewriting prose isn't
  mechanically safe) - they're reported back so you can handle them in
  Edit Resume Directly. Download as PDF opens a print-ready view (use your
  browser's "Save as PDF"); Download as DOCX generates a real `.doc` file
  Word can open (HTML-as-.doc, a long-standing legitimate technique) - both
  with zero new dependencies.
- Resume Upload now has an optional Job Description field (the backend
  already accepted `jobDescription` on upload - it just wasn't exposed in
  the UI).
- New **Tailored Resume** page (`/resume/:id/tailor`) - the backend
  `POST /resume/:id/tailor` endpoint already existed and worked, it just
  had no frontend. Paste a JD, get a real JD-match score plus matched vs.
  missing skills, using the same deterministic skill-detection engine as
  everywhere else.

## Round 3: OpenAI provider switch, theme, and the rest of the pipeline

- **AI provider switched from Groq to OpenAI throughout** - new
  `backend/services/openaiClient.js` transport (`OPENAI_API_KEY`,
  `OPENAI_MODEL`, defaults to `gpt-4o-mini`). AI Tutor, open-answer
  feedback, and Tailored Resume generation all go through this one file.
- **Real light/dark theme** on every dashboard page (`ThemeContext.jsx` +
  CSS custom properties), a working profile dropdown, and a wired-up
  "View Recommendation" button on Career Command Center - none of that
  changes the default dark visual design.
- **Real mic input** on AI Mock Interview via the Web Speech API
  (`useSpeechToText.js`) - browsers without support get a clear fallback
  message instead of a dead button.
- **Opportunity Matcher**: removed the old demo job entries that linked to
  generic company careers homepages instead of a real, specific posting
  (the "Swiggy has no real job" problem) - listings now come exclusively
  from the Internshala scraper, and each card shows matched vs. missing
  skills (the API already returned this; the UI just wasn't showing it).
  If your database already has the old demo jobs in it, run
  `node backend/scripts/seedJobs.js` once to purge them.
- **Applications** rebuilt as a real status-tracker board (Saved / Applied
  / Interview / Offered / Rejected columns) with a per-card status dropdown
  and delete, replacing the old bare table.
- **Mock Assessment**: real countdown timer that auto-submits at zero, a
  webcam preview (visual proctoring simulation only - nothing recorded or
  uploaded), and company-specific exam patterns - the `assessmentPattern`
  field already seeded on every company (aptitude_heavy / coding_heavy /
  balanced / behavioral_heavy) now actually drives which sections appear,
  how many questions each gets, and how long the exam runs. Picking TCS
  now genuinely produces a different exam than picking Amazon.
- **Tailored Resume, completed**: pick from 8 real templates (Classic ATS,
  Modern Minimal, Compact Technical, Two-Column Sidebar, Bold Header,
  Timeline, Skills-Forward, Executive), and OpenAI rewrites your resume's
  wording/emphasis for the JD - it's instructed never to invent employers,
  titles, dates, or achievements, only to reorganize and reword what's
  actually in your resume. Download directly as PDF (print) or `.doc`.
  Actually submitting to a company's own application system still has to
  be done manually via its real Apply link - that's outside what any tool
  running in your browser can do on your behalf.
