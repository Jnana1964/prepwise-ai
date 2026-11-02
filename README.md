<div align="center">

# 🚀 PrepWise AI

**AI-Powered Placement Prep, Built on Real Data, Not Fake Scores**

Resume Analysis → Job Matching → Skill Practice → Mock Assessment → AI Interview → Analytics

<img src="https://img.shields.io/badge/status-deployed-brightgreen?style=flat-square" />
<img src="https://img.shields.io/badge/React-Vite-61DAFB?style=flat-square&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/MySQL-Sequelize-4479A1?style=flat-square&logo=mysql&logoColor=white" />
<img src="https://img.shields.io/badge/Gemini-API-8E75B2?style=flat-square&logo=googlegemini&logoColor=white" />
<img src="https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />

**Live:** [prepwise-ai-1-zm7p.onrender.com](https://prepwise-ai-1-zm7p.onrender.com) · **API:** [prepwise-ai-1j84.onrender.com](https://prepwise-ai-1j84.onrender.com/api/health)

<sub>Hosted on Render's free tier, so the first request after a period of inactivity can take up to a minute while the server wakes up.</sub>

</div>

---

A full-stack placement-prep platform that connects resume analysis, job matching, practice, mock assessments, AI interviews and progress tracking into **one workflow**, instead of six separate tools.

**The core design decision:** scores are **deterministic**. ATS score, job match and progress are calculated from real data. Gemini only writes explanations, rewrites and feedback. AI text never overwrites a score.

## What it does

| Module | What it does |
|---|---|
| 📄 **Resume Intelligence** | PDF/DOCX upload → ATS score, skill detection, missing keywords, JD matching, tailored resume export |
| 🎯 **Opportunity Matcher** | Matches your profile to jobs (DB catalog + Internshala sync) with matched / missing skills |
| 📌 **Application Tracker** | Saved → Applied → Interview → Offered / Rejected |
| 🧠 **Skill Builder** | MCQ, coding (run against real test cases), aptitude, HR, AI tutor |
| 📝 **Mock Assessment** | Company-specific, timed, auto-submit; you must pass (default 80%) to unlock the interview |
| 🎤 **AI Mock Interview** | Questions built from your resume, projects, target company and role |
| 📊 **Analytics** | Trends, weak and strong areas, progress over time |

## Architecture

```
React + Vite (Render static site)
        │  REST + JWT
        ▼
Node.js + Express (Render web service) ──► Google Gemini API (server-side only)
        │  Sequelize
        ▼
      MySQL
```

## Engineering highlights

- **Deterministic scoring, AI only for generation.** Scores are reproducible and testable.
- **Server-enforced progression gates.** Interview access depends on the assessment score stored in the DB, not on a frontend flag.
- **Real coding evaluation.** Submissions run against test cases; nothing is self-reported.
- **Resume tailoring can't fabricate.** It rewords and reorders your existing content; it never invents employers, dates or achievements.
- **Security.** bcrypt password hashing, JWT-protected routes, Gemini key kept server-side, secrets in env vars.
- **Tests.** Jest + Supertest for ATS determinism, match boundaries, auth, assessment threshold and interview gating.

## Deep dive

<details>
<summary><b>📄 Resume Intelligence: full capabilities</b></summary>

- PDF/DOCX upload and parsing
- Deterministic ATS-style score, resume quality score, recruiter-oriented signals
- Section analysis, skill and keyword detection, missing skills and keywords
- Strengths / weaknesses and improvement suggestions
- Job-description matching
- Direct editing with re-scoring after changes
- JD-specific tailored resume generation, PDF/DOC export

</details>

<details>
<summary><b>✍️ Resume tailoring rules (what the AI can and can't do)</b></summary>

| ✅ Can | ❌ Never invents |
|---|---|
| Reword existing experience | Employers |
| Reorganise relevant sections | Job titles |
| Emphasise matching skills | Dates |
| Target the supplied JD | Achievements or experience |

</details>

<details>
<summary><b>🎯 Opportunity pipeline (Internshala sync)</b></summary>

```
External source → Sync → Normalised job data → MySQL jobs table
→ Candidate matching → Match explanation → External apply link
```

- Pulls current public internship listings and stores normalised records
- Periodic re-sync updates existing opportunities
- Fails softly if the source changes its format
- **Never submits applications.** "Apply" opens the real posting; the candidate applies there

Match inputs: candidate skills, missing skills, predicted role, education, projects, certifications vs. job required/preferred skills and category.

</details>

<details>
<summary><b>📝 Mock assessment and progression gates</b></summary>

```
Resume → Skill Builder → Mock Assessment → score ≥ threshold → AI Mock Interview → Analytics
```

- Patterns per company: aptitude-heavy, coding-heavy, balanced, behavioural
- Countdown timer, auto-submit on timeout, attempt history
- Pass threshold is configurable: `MOCK_ASSESSMENT_PASS_THRESHOLD=80`
- The gate reads the **stored** score from MySQL, so it can't be bypassed from the browser
- Webcam is a visual proctoring simulation only; nothing is recorded or uploaded

</details>

<details>
<summary><b>📊 Analytics tracked</b></summary>

ATS trend · coding progress · aptitude progress · interview scores · skill progress · weak / strong areas · application activity · assessment and interview history, shown as trends and deltas, not just the latest score.

</details>

<details>
<summary><b>🗄️ Database schema</b></summary>

MySQL via Sequelize. Schema: [`backend/database/schema.sql`](backend/database/schema.sql)

`users` · `resumes` · `resume_analyses` · `jobs` · `applications` · `skill_progress` · `assessment_attempts` · `interview_sessions` · `interview_questions` · `companies` · `metric_snapshots`

</details>

<details>
<summary><b>🔐 Auth flow and security</b></summary>

```
Sign up / login → backend validates → bcrypt verify → JWT issued
→ frontend sends  Authorization: Bearer <token>  on protected routes
```

- bcrypt-hashed passwords, never plaintext
- Protected API routes **and** protected frontend routes
- CORS restricted to the client origin
- Gemini key and all secrets server-side only, in env vars; `.env`, uploads and `node_modules` git-ignored

</details>

<details>
<summary><b>🧪 What the tests cover</b></summary>

ATS determinism · job-match boundaries · auth validation · assessment threshold · interview gating · company isolation · application authorisation · API behaviour

</details>

<details>
<summary><b>🔑 Environment variables</b></summary>

`backend/.env`
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=prepwise_ai_app
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_long_random_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
CLIENT_ORIGIN=http://localhost:5173
MOCK_ASSESSMENT_PASS_THRESHOLD=80
```

`frontend/.env`
```env
VITE_API_URL=http://localhost:5000
```

Production: `VITE_API_URL=https://prepwise-ai-1j84.onrender.com`. Vite bakes this in at **build time**, so redeploy the frontend after changing it.

</details>

<details>
<summary><b>📁 Project structure</b></summary>

```
prepwise-ai/
├── frontend/src/   api · components · contexts · layouts · pages · services · utils
└── backend/        config · controllers · data · database · middleware · models
                    routes · scripts · services · tests · server.js
```

</details>

## Run locally

```bash
git clone https://github.com/Jnana1964/prepwise-ai.git && cd prepwise-ai

# database
mysql -u root -p < backend/database/schema.sql

# backend: copy the env template, then fill in DB, JWT_SECRET, GEMINI_API_KEY
cd backend && npm install && npm run dev

# frontend (new terminal)
cd frontend && npm install && npm run dev

# tests
cd backend && npm test
```

Full env list is in the **Environment variables** section above. Dev notes: [`docs/`](docs/)

## Tech stack

**Frontend:** React, Vite, Tailwind, React Router, Axios, Recharts, Framer Motion
**Backend:** Node.js, Express, Sequelize, MySQL, JWT, bcrypt, Multer
**AI:** Google Gemini (`@google/genai`)
**Testing:** Jest, Supertest
**Deploy:** Render (frontend static site + backend web service), managed MySQL

---

<div align="center">

Built by **[Bollu Jnana Keerthana](https://github.com/Jnana1964)** · B.Tech CSE, SRM IST · [Portfolio](https://jnana1964.github.io)

</div>
