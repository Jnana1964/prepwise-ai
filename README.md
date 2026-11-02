<div align="center">

# 🚀 PrepWise AI

**AI-Powered Career Preparation Platform**

Resume Intelligence → Opportunity Matching → Skill Building → Mock Assessment → AI Mock Interview → Performance Analytics

<img src="https://img.shields.io/badge/status-deployed-brightgreen?style=flat-square" />
<img src="https://img.shields.io/badge/React-Vite-61DAFB?style=flat-square&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/MySQL-Sequelize-4479A1?style=flat-square&logo=mysql&logoColor=white" />
<img src="https://img.shields.io/badge/Gemini-API-8E75B2?style=flat-square&logo=googlegemini&logoColor=white" />
<img src="https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />

**Prepare smarter. Practice deliberately. Improve measurably.**

**Live:** [prepwise-ai-1-zm7p.onrender.com](https://prepwise-ai-1-zm7p.onrender.com) · **API:** [prepwise-ai-1j84.onrender.com](https://prepwise-ai-1j84.onrender.com/api/health)

<sub>Hosted on Render's free tier, so the first request after a period of inactivity can take up to a minute while the server wakes up.</sub>

</div>

---

## 🎯 What is PrepWise AI?

PrepWise AI is a full-stack AI-powered career preparation platform designed for students and early-career developers preparing for technical placements and job applications.

Instead of treating resume analysis, job discovery, coding practice, assessments, interviews, and progress tracking as separate tools, PrepWise AI connects them into one placement workflow.

The platform turns a candidate's real resume data, skills, preparation activity, assessment performance, interview performance, and application activity into a connected career-preparation experience.

- No fabricated dashboard numbers.
- No fake application submissions.
- No random match percentages.

---

## 🔥 Product Workflow

```text
┌──────────────────────┐
│    Resume Upload     │
└──────────┬───────────┘
           ↓
┌──────────────────────────────┐
│     Resume Intelligence      │
│                              │
│ ATS • Skills • Quality       │
│ Sections • Missing Skills    │
│ JD Matching • Suggestions    │
└──────────┬───────────────────┘
           ↓
┌──────────────────────────────┐
│     Opportunity Matcher      │
│                              │
│ Role Fit • Skill Match       │
│ Matched Skills • Missing     │
│ Skills • Job Details         │
└──────────┬───────────────────┘
           ↓
┌──────────────────────────────┐
│      Application Tracker     │
│                              │
│ Saved → Applied → Interview  │
│ → Offered / Rejected         │
└──────────┬───────────────────┘
           ↓
┌──────────────────────────────┐
│        Skill Builder         │
│                              │
│ MCQ • Coding • Aptitude      │
│ AI Tutor • HR • Company      │
└──────────┬───────────────────┘
           ↓
┌──────────────────────────────┐
│       Mock Assessment        │
│                              │
│ Company-Specific Assessment  │
│ Aptitude • Coding • Behavioral│
└──────────┬───────────────────┘
           │
           │ ≥ configured score
           ↓
┌──────────────────────────────┐
│       AI Mock Interview      │
│                              │
│ Resume • Projects • Role     │
│ Company • Technical • HR     │
└──────────┬───────────────────┘
           ↓
┌──────────────────────────────┐
│     Performance Analytics    │
│                              │
│ Trends • Weak Areas •        │
│ Strong Areas • Progress      │
└──────────┬───────────────────┘
           ↓
┌──────────────────────────────┐
│     Career Command Center    │
│                              │
│ What have I completed?       │
│ Where am I now?              │
│ What should I do next?       │
└──────────────────────────────┘
```

---

## ✨ Core Features

### 📄 1. Resume Intelligence

Turn a raw resume into a structured candidate profile.

**Capabilities**

- PDF/DOCX resume upload
- Deterministic ATS-style analysis
- Resume quality scoring
- Recruiter-oriented signals
- Section analysis
- Skill detection
- Keyword detection
- Missing skills
- Missing keywords
- Strengths and weaknesses
- Job-description matching
- Resume improvement suggestions
- Direct resume editing
- Re-scoring after changes
- JD-specific Tailored Resume generation
- PDF/DOC export

**Important Engineering Decision**

Core scoring is separated from AI-generated commentary.

Gemini can assist with:

- Explanation
- Rewriting
- Suggestions
- Generation
- Open-ended feedback

But AI-generated text does not silently overwrite the underlying deterministic score.

### 🎯 2. Opportunity Matcher

Opportunity Matcher connects the candidate's resume intelligence with available job and internship opportunities.

| Candidate signals | Job signals | Results |
|---|---|---|
| Detected skills | Required skills | Match percentage |
| Missing skills | Preferred skills | Matched skills |
| Predicted role | Role/category | Missing skills |
| Resume quality signals | Job metadata | Match explanation |
| Education | | Job details |
| Experience | | Save action |
| Projects | | Apply action |
| Certifications | | |

The current opportunity pipeline supports a database-backed job catalog and Internshala synchronization.

**Application principle**

```text
Candidate Resume
       ↓
Candidate Profile
       ↓
Opportunity Matching
       ↓
External Job Posting
       ↓
Candidate Applies Externally
```

PrepWise AI does not submit applications on behalf of the candidate.

The Apply action opens the real external opportunity.

### 📌 3. Application Tracker

A dedicated application tracker records the candidate's engagement with opportunities.

```text
Saved
  ↓
Applied
  ↓
Interview
  ↓
Offered / Rejected
```

The tracker can maintain:

- Application status
- Job association
- Dates
- Candidate activity
- Current pipeline state

PrepWise AI records the candidate's application activity but does not pretend to submit external applications.

### 🧠 4. Skill Builder

Skill Builder provides focused preparation across multiple categories.

| Category | Purpose |
|---|---|
| 📝 MCQ | Technical knowledge |
| 💻 Coding | Programming problem solving |
| 📐 Aptitude | Quantitative and logical preparation |
| 🤖 AI Tutor | Interactive AI-supported learning |
| 👔 HR | Behavioral preparation |
| 🏢 Company | Company-specific preparation |

**Practice experience**

- One-question-at-a-time flow
- Progress tracking
- Real coding test execution
- Randomized practice subsets
- Result summaries
- AI-supported open-answer feedback
- AI Tutor conversations
- Practice history

Coding submissions are evaluated against actual test cases rather than self-reported results.

### 📝 5. Company-Specific Mock Assessment

Mock Assessments are company-specific.

Company selection uses searchable company data and the assessment pattern can change according to the selected company's configured style.

**Assessment capabilities**

- Company-specific patterns
- Aptitude-focused assessments
- Coding-focused assessments
- Balanced assessments
- Behavioral assessments
- Countdown timer
- Automatic submission at timeout
- Score calculation
- Configurable pass threshold
- Assessment history
- Progression gate

The default configurable assessment threshold is **80%**, configured through:

```env
MOCK_ASSESSMENT_PASS_THRESHOLD=80
```

The webcam functionality is a visual proctoring simulation only. It does not record or upload webcam footage.

### 🎤 6. AI Mock Interview

The AI Mock Interview experience is designed around the candidate instead of using a generic question list.

Questions can incorporate:

- Resume
- Projects
- Target company
- Target role
- Technical topics
- Behavioral topics

The interview session records performance data that can contribute to future preparation recommendations and analytics.

### 📊 7. Performance Analytics

Performance Analytics aggregates historical activity across the platform.

**Analytics areas**

- ATS trends
- Coding progress
- Aptitude progress
- Interview scores
- Skill progress
- Weak areas
- Strong areas
- Application activity
- Assessment history
- Interview history

The objective is to show progress over time, not just a single score.

---

## 🤖 AI Integration

PrepWise AI integrates the Google Gemini API for generative and reasoning-based features.

**Gemini-powered functionality**

- AI Tutor
- Resume wording assistance
- Resume improvement
- Tailored resume generation
- Open-ended answer feedback
- Interview-oriented feedback
- AI-supported preparation

**AI architecture**

```text
Frontend
   │
   │ REST API
   ↓
Express Backend
   │
   │ Server-side AI request
   ↓
Google Gemini API
   │
   ↓
Generated Response
   │
   ↓
Backend
   │
   ↓
Frontend
```

Gemini API credentials remain server-side. The frontend never directly exposes the Gemini API key.

---

## 🧮 Real-Data Philosophy

PrepWise AI deliberately avoids fake dashboard metrics.

**Deterministic systems:** the following are calculated from actual application data:

- ATS score
- Resume quality signals
- JD match
- Job match
- Matched skills
- Missing skills
- Skill progress
- Assessment results
- Next Best Action
- Analytics trends
- Analytics deltas

**AI-assisted systems:** Gemini is used where generative reasoning is valuable:

- AI Tutor
- Resume improvement
- Tailored resume generation
- Open-ended feedback
- Interview support

This separation keeps scoring and state transitions predictable while still using AI where it adds value.

---

## 🏗️ Architecture

```text
┌──────────────────────────────────────────────────────────┐
│                     React + Vite                          │
│                                                          │
│ Dashboard • Resume • Opportunities • Skills • Assessment │
│ Interview • Applications • Analytics                     │
└──────────────────────────┬───────────────────────────────┘
                           │
                           │ REST API / Axios
                           │ JWT
                           ▼
┌──────────────────────────────────────────────────────────┐
│                  Express + Node.js                        │
│                                                          │
│ Auth • Resume • ATS • Jobs • Applications • Skills       │
│ Assessment • Interview • Analytics                       │
└──────────────────────────┬───────────────────────────────┘
                           │
                           │ Sequelize / MySQL
                           ▼
┌──────────────────────────────────────────────────────────┐
│                         MySQL                            │
│                                                          │
│ Users • Resumes • Resume Analyses • Jobs • Applications   │
│ Skills • Assessments • Interviews • Metrics • Companies  │
└──────────────────────────────────────────────────────────┘

                           │
                           │ Server-side AI requests
                           ▼
┌──────────────────────────────────────────────────────────┐
│                    Google Gemini API                     │
│                                                          │
│ Tutor • Resume Assistance • Feedback • Interview Support │
└──────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Area | Technologies |
|---|---|
| **Frontend** | React, Vite, Tailwind CSS, React Router DOM, Axios, Recharts, Framer Motion, Lucide React |
| **Backend** | Node.js, Express.js, Sequelize, MySQL, MySQL2, JWT, bcrypt / bcryptjs, Multer, REST APIs, CORS |
| **AI** | Google Gemini API, @google/genai, Gemini generative AI services |
| **Testing** | Jest, Supertest |
| **Deployment** | Render (frontend static site), Render (backend web service), MySQL (database) |

---

## 🗄️ Database

PrepWise AI uses MySQL as its primary database. There is no MongoDB dependency in the current architecture.

**Core data areas**

`users` · `resumes` · `resume_analyses` · `jobs` · `applications` · `skill_progress` · `assessment_attempts` · `interview_sessions` · `interview_questions` · `companies` · `metric_snapshots`

Authentication stores passwords as bcrypt hashes, never plaintext passwords.

The database schema is maintained under `backend/database/schema.sql`.

---

## 🔐 Authentication & Security

PrepWise AI uses JWT-based authentication.

**Security features**

- JWT authentication
- Protected API routes
- Protected frontend routes
- bcrypt password hashing
- Environment-based secrets
- CORS protection
- Server-side Gemini API calls
- `.env` excluded from Git
- API keys excluded from Git
- Generated uploads excluded
- `node_modules` excluded

**Authentication flow**

```text
User
 ↓
Sign Up / Login
 ↓
Backend validates credentials
 ↓
Password verified / hashed
 ↓
JWT issued
 ↓
Frontend stores token
 ↓
Protected requests include:
Authorization: Bearer <token>
```

---

## 🔑 Environment Variables

Create `backend/.env`:

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

**Frontend environment:** create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

**Production frontend** uses:

```env
VITE_API_URL=https://prepwise-ai-1j84.onrender.com
```

The application appends `/api` to the backend base URL where required. Vite reads this value at build time, so redeploy the frontend after changing it.

> Never commit `.env` files or API keys to GitHub.

---

## 📁 Project Structure

```text
prepwise-ai/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── data/
│   ├── database/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   ├── tests/
│   └── server.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

**1. Clone the repository**

```bash
git clone https://github.com/Jnana1964/prepwise-ai.git
cd prepwise-ai
```

**2. Configure MySQL:** create the database and apply `backend/database/schema.sql`. For a manual MySQL setup:

```bash
mysql -u root -p < backend/database/schema.sql
```

**3. Configure backend**

```bash
cd backend
npm install
```

Create `backend/.env` and add your MySQL configuration, JWT secret, Gemini API key, Gemini model and CORS origin.

**4. Start backend**

```bash
npm run dev
```

The backend runs on the port configured in `.env`.

**5. Start frontend:** open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will display the local frontend URL in the terminal.

---

## 🧪 Validation

The project includes automated validation for areas including:

- ATS determinism
- Job-match boundaries
- Authentication validation
- Assessment threshold behavior
- Interview gating
- Company isolation
- Application authorization
- API behavior

**Backend tests**

```bash
cd backend
npm test
```

**Frontend production build**

```bash
cd frontend
npm run build
```

---

## 🌐 Production Deployment

PrepWise AI is deployed as a full-stack application on Render.

| Layer | Platform | URL |
|---|---|---|
| Frontend | Render (static site) | <https://prepwise-ai-1-zm7p.onrender.com> |
| Backend | Render (web service) | <https://prepwise-ai-1j84.onrender.com> |

```text
                   ┌──────────────────────┐
                   │       Render         │
                   │      Frontend        │
                   │   React + Vite       │
                   └──────────┬───────────┘
                              │
                              │ HTTPS REST API
                              ▼
                   ┌──────────────────────┐
                   │       Render         │
                   │       Backend        │
                   │ Node + Express       │
                   └───────┬───────┬──────┘
                           │       │
                           │       │
                           ▼       ▼
                      ┌───────┐ ┌─────────────┐
                      │ MySQL │ │ Gemini API  │
                      └───────┘ └─────────────┘
```

---

## 🔗 Production Links

- **Live Application:** <https://prepwise-ai-1-zm7p.onrender.com>
- **Backend API:** <https://prepwise-ai-1j84.onrender.com>
- **Source Code:** <https://github.com/Jnana1964/prepwise-ai>

---

## 🌐 Opportunity Integration

PrepWise AI supports database-backed opportunities and Internshala synchronization.

**The opportunity pipeline**

```text
External Opportunity Source
          ↓
Synchronization
          ↓
Normalized Job Data
          ↓
MySQL jobs table
          ↓
Candidate Matching
          ↓
Match Explanation
          ↓
External Apply Link
```

The Internshala integration:

- Retrieves current public internship listing information
- Stores normalized opportunities
- Supports periodic synchronization
- Updates existing opportunities
- Fails softly when external source behavior changes
- Does not submit applications automatically

The candidate completes the actual application on the external platform.

---

## 📄 Resume Tailoring

Tailored Resume allows a candidate to provide a job description and generate a role-focused version of the resume.

The generation is constrained to the candidate's existing information.

| It does not invent | It can |
|---|---|
| Employers | Reword existing experience |
| Job titles | Reorganize relevant information |
| Dates | Emphasize matching skills |
| Achievements | Target the supplied job description |
| Experience | |

The objective is to improve relevance without fabricating candidate information.

---

## 🧠 Progression Gates

PrepWise AI uses real completion and score state to control progression.

```text
Resume
   ↓
Skill Builder
   ↓
Mock Assessment
   ↓
Assessment Score
   ↓
AI Mock Interview
   ↓
Performance Analytics
```

Default assessment threshold: **80%**, configurable through:

```env
MOCK_ASSESSMENT_PASS_THRESHOLD=80
```

Assessment and interview access depend on persisted completion and score state rather than arbitrary frontend conditions.

---

## 💡 Engineering Highlights

| # | Highlight | Detail |
|---|---|---|
| 01 | One connected candidate profile | Resume Intelligence creates persisted candidate information consumed by downstream modules. |
| 02 | Deterministic scoring | Core ATS and matching calculations are based on structured application data. |
| 03 | Deterministic matching | Opportunity matching uses structured candidate and job data instead of random percentages. |
| 04 | Real progression gates | Assessment and interview access depend on persisted completion and score state. |
| 05 | Real persistence | User progress is stored in MySQL rather than relying only on browser state. |
| 06 | AI + deterministic systems | AI handles generation and reasoning where useful while core scoring and state logic remain predictable. |
| 07 | External application integrity | PrepWise never claims to submit applications on behalf of the candidate. |
| 08 | Historical analytics | Performance can be represented as trends and deltas rather than only showing the latest result. |
| 09 | Full-stack architecture | React + REST APIs + Node.js + Express + MySQL + Sequelize + JWT + Google Gemini |

---

## 🎯 Current Scope

The platform currently covers the major placement workflow:

```text
Resume → Analyze → Improve / Tailor → Find Opportunities → Track Applications
→ Build Skills → Company Mock Assessment → AI Mock Interview → Performance Analytics
```

The architecture is modular enough to extend with:

- Additional companies
- New question banks
- More assessment patterns
- Additional AI capabilities
- More external opportunity sources

---

## 📊 What PrepWise AI Demonstrates

PrepWise AI demonstrates practical full-stack engineering across:

| | | |
|---|---|---|
| Full-stack web development | React application architecture | REST API design |
| Authentication and authorization | JWT-based sessions | MySQL relational modeling |
| Sequelize ORM | Resume parsing | ATS-style scoring |
| Deterministic scoring systems | Skill extraction | Job matching |
| Resume tailoring | AI API integration | Coding evaluation |
| Company-specific assessments | Interview systems | Application tracking |
| Historical analytics | Environment/secrets management | Production deployment |

---

## 🛡️ Production Principles

PrepWise AI follows several principles designed to keep the platform trustworthy.

| Principle | What it means |
|---|---|
| **No fake metrics** | Dashboard values are based on actual application data. |
| **No fabricated opportunities** | Job data comes from the application's job catalog and synchronized sources. |
| **No fake application submission** | PrepWise opens the external opportunity. The candidate submits the application. |
| **No fabricated resume facts** | Resume tailoring is constrained to the candidate's existing information. |
| **No exposed AI credentials** | Gemini API keys remain server-side. |
| **No plaintext passwords** | Passwords are hashed using bcrypt. |

---

## 📦 Important Commands

| Task | Command |
|---|---|
| Install backend dependencies | `cd backend && npm install` |
| Start backend | `npm run dev` |
| Install frontend dependencies | `cd frontend && npm install` |
| Start frontend | `npm run dev` |
| Build frontend | `npm run build` |
| Run backend tests | `npm test` |

---

## 🔒 Security Rules

Never commit:

- `.env`
- `.env.local`
- `.env.production`
- API keys
- JWT secrets
- database passwords
- generated uploads
- `node_modules`

Especially never commit `GEMINI_API_KEY`.

Production secrets should be configured through the deployment platform's environment-variable settings.

---

## 👤 Author

<div align="center">

**Bollu Jnana Keerthana**

Computer Science Engineering · SRM University

[GitHub](https://github.com/Jnana1964) · [Portfolio](https://jnana1964.github.io)

</div>

---

## 📜 License

This project is developed as a portfolio / academic project.
