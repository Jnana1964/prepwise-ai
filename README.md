# PrepWise AI

**An AI-powered career preparation platform that takes a candidate from raw resume to interview-ready — with real, deterministic scoring instead of vibes.**

Upload a resume → get a genuine ATS score → close the gaps AI finds → match against live job postings → practice the exact skills you're missing → pass a company-specific mock exam → unlock an AI voice interview for that company. Every step gates the next one. Nothing on the dashboard is fabricated - scores, matches, and analytics are computed live from real data, not hardcoded demo numbers.

<!-- Add a screenshot or a short demo GIF/video link here - this is the single best thing you can add to this README. -->

## Tech Stack

**Frontend:** React · Vite · Tailwind CSS
**Backend:** Node.js · Express · Sequelize · MySQL
**AI:** OpenAI (`gpt-4o-mini`)
**Auth:** JWT + bcrypt

## Key Features

- **Deterministic ATS Scoring** — resume is scored against a real rules engine (`backend/services/atsEngine.js`), not an LLM guess. Same resume in, same score out, every time.
- **AI-Tailored Resumes** — paste a job description, get a resume rewritten for that JD across 8 real templates, exported as PDF or DOCX. The model is constrained to reorganize and reword only what's actually in your resume — it never invents employers, titles, or achievements.
- **Live Job Matching** — Opportunity Matcher pulls real, current internship listings (scraped from Internshala, refreshed every 6 hours) and ranks them by matched vs. missing skills against your resume.
- **Gated Skill → Interview Pipeline** — Skill Builder (MCQ, coding, aptitude, HR, company-specific) unlocks a company-specific Mock Assessment, which must be passed at a real score threshold to unlock an AI Mock Interview for that same company. No shortcuts.
- **AI Mock Interviews with Voice** — real mic input via the Web Speech API, AI-scored feedback on your answers.
- **Live Analytics Dashboard** — trends, deltas, and a "next best action" recommendation computed on every read from real user data, never mocked or cached.

## Quick Start

**Backend**
```bash
cd backend
npm install
cp .env.example .env    # set DB_HOST / DB_NAME / DB_USER / DB_PASSWORD / JWT_SECRET
npm run dev              # http://localhost:3000 — auto-creates MySQL tables on boot
node scripts/seedJobs.js       # sample job listings
node scripts/seedCompanies.js  # ~30 companies for Mock Assessment / Interview
```

**Frontend**
```bash
cd frontend
npm install
npm run dev    # http://localhost:5173, proxies /api to :3000
```

Sign up, upload a resume, and walk the real pipeline: Resume Upload → Skill Builder → Mock Assessment → AI Mock Interview.

## Architecture

```
prepwise-ai/
  frontend/   Vite + React + Tailwind — 11 pages, fully wired to the API
  backend/    Express + Sequelize + MySQL — deterministic ATS engine, full data model
```

Single database (MySQL only). Full schema at `backend/database/schema.sql`. Design spec locked in `frontend/DESIGN_SYSTEM.md`.

Deeper implementation notes — module ownership, what's deterministic vs. AI-assisted, test coverage, and the build log — live in [`docs/ENGINEERING_NOTES.md`](docs/ENGINEERING_NOTES.md).

## Testing

```bash
cd backend && npm test
```
Jest + Supertest coverage: ATS engine determinism, job-match boundary math, auth validation, and Mock Assessment / AI Mock Interview gating at the exact threshold.
