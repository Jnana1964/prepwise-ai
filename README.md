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

**Live:** [prepwise-ai-pink.vercel.app](https://prepwise-ai-pink.vercel.app)

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
React + Vite (Vercel)
        │  REST + JWT
        ▼
Node.js + Express (Railway) ──► Google Gemini API (server-side only)
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

Environment variables and dev notes: [`docs/`](docs/)

## Tech stack

**Frontend:** React, Vite, Tailwind, React Router, Axios, Recharts, Framer Motion
**Backend:** Node.js, Express, Sequelize, MySQL, JWT, bcrypt, Multer
**AI:** Google Gemini (`@google/genai`)
**Testing:** Jest, Supertest
**Deploy:** Vercel (frontend), Railway (backend + MySQL)

---

<div align="center">

Built by **[Bollu Jnana Keerthana](https://github.com/Jnana1964)** · B.Tech CSE, SRM IST · [Portfolio](https://jnana1964.github.io)

</div>
