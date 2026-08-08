<div align="center">

# 🚀 PrepWise AI

### **AI-Powered Career Preparation Platform**

**Resume Intelligence → Opportunity Matching → Skill Building → Mock Assessment → AI Mock Interview → Performance Analytics**

<br>

[![Status](https://img.shields.io/badge/Status-Deployed-22c55e?style=for-the-badge)](https://prepwise-ai-pink.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

<br>

**Prepare smarter. Practice deliberately. Improve measurably.**

</div>

---

# 🎯 What is PrepWise AI?

PrepWise AI is a full-stack AI-powered career preparation platform designed for students and early-career developers preparing for technical placements and job applications.

Instead of treating resume analysis, job discovery, coding practice, assessments, interviews, and progress tracking as separate tools, PrepWise AI connects them into one placement workflow.

The platform turns a candidate's **real resume data, skills, preparation activity, assessment performance, interview performance, and application activity** into a connected career-preparation experience.

> **No fabricated dashboard numbers.  
> No fake application submissions.  
> No random match percentages.**

---

# 🔥 Product Workflow

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
✨ Core Features
📄 1. Resume Intelligence

Turn a raw resume into a structured candidate profile.

Capabilities
PDF/DOCX resume upload
Deterministic ATS-style analysis
Resume quality scoring
Recruiter-oriented signals
Section analysis
Skill detection
Keyword detection
Missing skills
Missing keywords
Strengths and weaknesses
Job-description matching
Resume improvement suggestions
Direct resume editing
Re-scoring after changes
JD-specific Tailored Resume generation
PDF/DOC export
Important Engineering Decision

Core scoring is separated from AI-generated commentary.

Gemini can assist with:

Explanation
Rewriting
Suggestions
Generation
Open-ended feedback

But AI-generated text does not silently overwrite the underlying deterministic score.

🎯 2. Opportunity Matcher

Opportunity Matcher connects the candidate's resume intelligence with available job and internship opportunities.

Candidate signals
Detected skills
Missing skills
Predicted role
Resume quality signals
Education
Experience
Projects
Certifications
Job signals
Required skills
Preferred skills
Role/category
Job metadata
Results
Match percentage
Matched skills
Missing skills
Match explanation
Job details
Save action
Apply action

The current opportunity pipeline supports a database-backed job catalog and Internshala synchronization.

Application principle
Candidate Resume
       ↓
Candidate Profile
       ↓
Opportunity Matching
       ↓
External Job Posting
       ↓
Candidate Applies Externally

PrepWise AI does not submit applications on behalf of the candidate.

The Apply action opens the real external opportunity.

📌 3. Application Tracker

A dedicated application tracker records the candidate's engagement with opportunities.

Saved
  ↓
Applied
  ↓
Interview
  ↓
Offered / Rejected

The tracker can maintain:

Application status
Job association
Dates
Candidate activity
Current pipeline state

PrepWise AI records the candidate's application activity but does not pretend to submit external applications.

🧠 4. Skill Builder

Skill Builder provides focused preparation across multiple categories.

Category	Purpose
📝 MCQ	Technical knowledge
💻 Coding	Programming problem solving
📐 Aptitude	Quantitative and logical preparation
🤖 AI Tutor	Interactive AI-supported learning
👔 HR	Behavioral preparation
🏢 Company	Company-specific preparation
Practice experience
One-question-at-a-time flow
Progress tracking
Real coding test execution
Randomized practice subsets
Result summaries
AI-supported open-answer feedback
AI Tutor conversations
Practice history

Coding submissions are evaluated against actual test cases rather than self-reported results.

📝 5. Company-Specific Mock Assessment

Mock Assessments are company-specific.

Company selection uses searchable company data and the assessment pattern can change according to the selected company's configured style.

Assessment capabilities
Company-specific patterns
Aptitude-focused assessments
Coding-focused assessments
Balanced assessments
Behavioral assessments
Countdown timer
Automatic submission at timeout
Score calculation
Configurable pass threshold
Assessment history
Progression gate

The default configurable assessment threshold is:

80%

Configured through:

MOCK_ASSESSMENT_PASS_THRESHOLD=80

The webcam functionality is a visual proctoring simulation only.

It does not record or upload webcam footage.

🎤 6. AI Mock Interview

The AI Mock Interview experience is designed around the candidate instead of using a generic question list.

Questions can incorporate:

Resume
Projects
Target company
Target role
Technical topics
Behavioral topics

The interview session records performance data that can contribute to future preparation recommendations and analytics.

📊 7. Performance Analytics

Performance Analytics aggregates historical activity across the platform.

Analytics areas
ATS trends
Coding progress
Aptitude progress
Interview scores
Skill progress
Weak areas
Strong areas
Application activity
Assessment history
Interview history

The objective is to show progress over time, not just a single score.

🤖 AI Integration

PrepWise AI integrates the Google Gemini API for generative and reasoning-based features.

Gemini-powered functionality
AI Tutor
Resume wording assistance
Resume improvement
Tailored resume generation
Open-ended answer feedback
Interview-oriented feedback
AI-supported preparation
AI architecture
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

Gemini API credentials remain server-side.

The frontend never directly exposes the Gemini API key.

🧮 Real-Data Philosophy

PrepWise AI deliberately avoids fake dashboard metrics.

Deterministic systems

The following are calculated from actual application data:

ATS score
Resume quality signals
JD match
Job match
Matched skills
Missing skills
Skill progress
Assessment results
Next Best Action
Analytics trends
Analytics deltas
AI-assisted systems

Gemini is used where generative reasoning is valuable:

AI Tutor
Resume improvement
Tailored resume generation
Open-ended feedback
Interview support

This separation keeps scoring and state transitions predictable while still using AI where it adds value.

🏗️ Architecture
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
🛠️ Tech Stack
Frontend
React
Vite
Tailwind CSS
React Router DOM
Axios
Recharts
Framer Motion
Lucide React
Backend
Node.js
Express.js
Sequelize
MySQL
MySQL2
JWT
bcrypt / bcryptjs
Multer
REST APIs
CORS
AI
Google Gemini API
@google/genai
Gemini generative AI services
Testing
Jest
Supertest
Deployment
Vercel — Frontend
Railway — Backend
MySQL — Database
🗄️ Database

PrepWise AI uses MySQL as its primary database.

There is no MongoDB dependency in the current architecture.

Core data areas
users
resumes
resume_analyses
jobs
applications
skill_progress
assessment_attempts
interview_sessions
interview_questions
companies
metric_snapshots

Authentication stores passwords as bcrypt hashes, never plaintext passwords.

The database schema is maintained under:

backend/database/schema.sql
🔐 Authentication & Security

PrepWise AI uses JWT-based authentication.

Security features
JWT authentication
Protected API routes
Protected frontend routes
bcrypt password hashing
Environment-based secrets
CORS protection
Server-side Gemini API calls
.env excluded from Git
API keys excluded from Git
Generated uploads excluded
node_modules excluded
Authentication flow
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
🔑 Environment Variables

Create:

backend/.env

Example:

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
Frontend environment

Create:

frontend/.env

Example:

VITE_API_URL=http://localhost:5000
Production frontend

The production frontend uses:

VITE_API_URL=https://prepwise-ai-production.up.railway.app

The application appends /api to the backend base URL where required.

Never commit .env files or API keys to GitHub.

📁 Project Structure
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
🚀 Getting Started
1. Clone the repository
git clone https://github.com/Jnana1964/prepwise-ai.git
cd prepwise-ai
2. Configure MySQL

Create the database and apply:

backend/database/schema.sql

For a manual MySQL setup:

mysql -u root -p < backend/database/schema.sql
3. Configure Backend
cd backend
npm install

Create:

backend/.env

Add your:

MySQL configuration
JWT secret
Gemini API key
Gemini model
CORS origin
4. Start Backend
npm run dev

The backend runs on the port configured in .env.

5. Start Frontend

Open another terminal:

cd frontend
npm install
npm run dev

Vite will display the local frontend URL in the terminal.

🧪 Validation

The project includes automated validation for areas including:

ATS determinism
Job-match boundaries
Authentication validation
Assessment threshold behavior
Interview gating
Company isolation
Application authorization
API behavior
Backend tests
cd backend
npm test
Frontend production build
cd frontend
npm run build
🌐 Production Deployment

PrepWise AI is deployed as a full-stack application.

Frontend

Vercel

Production frontend:

https://prepwise-ai-pink.vercel.app

Backend

Railway

Production backend:

https://prepwise-ai-production.up.railway.app

Architecture
                   ┌──────────────────────┐
                   │       Vercel         │
                   │      Frontend        │
                   │   React + Vite       │
                   └──────────┬───────────┘
                              │
                              │ HTTPS REST API
                              ▼
                   ┌──────────────────────┐
                   │      Railway         │
                   │       Backend        │
                   │ Node + Express       │
                   └───────┬───────┬──────┘
                           │       │
                           │       │
                           ▼       ▼
                      ┌───────┐ ┌─────────────┐
                      │ MySQL │ │ Gemini API  │
                      └───────┘ └─────────────┘
## 🔗 Production Links

- **Live Application:** [PrepWise AI](https://prepwise-ai-pink.vercel.app)
- **Backend API:** [Railway Backend](https://prepwise-ai-production.up.railway.app)
- **Source Code:** [GitHub Repository](https://github.com/Jnana1964/prepwise-ai)

🌐 Opportunity Integration

PrepWise AI supports database-backed opportunities and Internshala synchronization.

The opportunity pipeline:

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

The Internshala integration:

Retrieves current public internship listing information
Stores normalized opportunities
Supports periodic synchronization
Updates existing opportunities
Fails softly when external source behavior changes
Does not submit applications automatically

The candidate completes the actual application on the external platform.

📄 Resume Tailoring

Tailored Resume allows a candidate to provide a job description and generate a role-focused version of the resume.

The generation is constrained to the candidate's existing information.

It does not invent:
Employers
Job titles
Dates
Achievements
Experience
It can:
Reword existing experience
Reorganize relevant information
Emphasize matching skills
Target the supplied job description

The objective is to improve relevance without fabricating candidate information.

🧠 Progression Gates

PrepWise AI uses real completion and score state to control progression.

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
Default assessment threshold
80%

Configurable through:

MOCK_ASSESSMENT_PASS_THRESHOLD=80

Assessment and interview access depend on persisted completion and score state rather than arbitrary frontend conditions.

💡 Engineering Highlights
01 — One connected candidate profile

Resume Intelligence creates persisted candidate information consumed by downstream modules.

02 — Deterministic scoring

Core ATS and matching calculations are based on structured application data.

03 — Deterministic matching

Opportunity matching uses structured candidate and job data instead of random percentages.

04 — Real progression gates

Assessment and interview access depend on persisted completion and score state.

05 — Real persistence

User progress is stored in MySQL rather than relying only on browser state.

06 — AI + deterministic systems

AI handles generation and reasoning where useful while core scoring and state logic remain predictable.

07 — External application integrity

PrepWise never claims to submit applications on behalf of the candidate.

08 — Historical analytics

Performance can be represented as trends and deltas rather than only showing the latest result.

09 — Full-stack architecture

The project combines:

React
+
REST APIs
+
Node.js
+
Express
+
MySQL
+
Sequelize
+
JWT
+
Google Gemini
🎯 Current Scope

The platform currently covers the major placement workflow:

Resume
  ↓
Analyze
  ↓
Improve / Tailor
  ↓
Find Opportunities
  ↓
Track Applications
  ↓
Build Skills
  ↓
Company Mock Assessment
  ↓
AI Mock Interview
  ↓
Performance Analytics

The architecture is modular enough to extend with:

Additional companies
New question banks
More assessment patterns
Additional AI capabilities
More external opportunity sources
📊 What PrepWise AI Demonstrates

PrepWise AI demonstrates practical full-stack engineering across:

Full-stack web development
React application architecture
REST API design
Authentication and authorization
JWT-based sessions
MySQL relational modeling
Sequelize ORM
Resume parsing
ATS-style scoring
Deterministic scoring systems
Skill extraction
Job matching
Resume tailoring
AI API integration
Coding evaluation
Company-specific assessments
Interview systems
Application tracking
Historical analytics
Environment/secrets management
Production deployment
🛡️ Production Principles

PrepWise AI follows several principles designed to keep the platform trustworthy.

No fake metrics

Dashboard values are based on actual application data.

No fabricated opportunities

Job data comes from the application's job catalog and synchronized sources.

No fake application submission

PrepWise opens the external opportunity. The candidate submits the application.

No fabricated resume facts

Resume tailoring is constrained to the candidate's existing information.

No exposed AI credentials

Gemini API keys remain server-side.

No plaintext passwords

Passwords are hashed using bcrypt.

📦 Important Commands
Install backend dependencies
cd backend
npm install
Start backend
npm run dev
Install frontend dependencies
cd frontend
npm install
Start frontend
npm run dev
Build frontend
npm run build
Run backend tests
npm test
🔒 Security Rules

Never commit:

.env
.env.local
.env.production
API keys
JWT secrets
database passwords
generated uploads
node_modules

Especially never commit:

GEMINI_API_KEY

Production secrets should be configured through the deployment platform's environment-variable settings.

👤 Author
<div align="center">
Bollu Jnana Keerthana
Computer Science Engineering · SRM University
GitHub: https://github.com/Jnana1964
LinkedIn: www.linkedin.com/in/jnana-keerthana-1906jk

<br>

</div>
📜 License

This project is developed as a portfolio / academic project.
