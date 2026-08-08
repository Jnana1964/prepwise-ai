PrepWise AI

An AI-powered career preparation platform that turns a resume into apersonalized, measurable placement journey.

PrepWise AI connects Resume Intelligence → Opportunity Matching →Skill Building → Mock Assessments → AI Mock Interviews → PerformanceAnalytics in one platform.

The goal is simple: help a candidate understand where they stand,identify what is missing, practice deliberately, and measure improvementover time.

Why PrepWise AI?

Most placement tools solve only one problem: resume checking, jobdiscovery, coding practice, or mock interviews.

PrepWise AI connects them.

Your resume creates a real candidate profile.

Resume weaknesses become preparation targets.

Skills and role fit drive opportunity matching.

Skill Builder progress controls assessment access.

Assessment performance controls mock-interview access.

Interview weaknesses can guide future practice.

Analytics tracks improvement instead of showing isolated scores.

The platform is designed around real persisted data rather thanhardcoded dashboard numbers or fake activity.

Product Flow

Resume Upload
      ↓
Resume Intelligence
      ↓
Opportunity Matcher
      ↓
Applications
      ↓
Skill Builder
      ↓
Mock Assessment ── ≥ 80% ──→ AI Mock Interview
                                      ↓
                              Performance Analytics
                                      ↓
                                  Dashboard

Resume preparation and opportunity discovery can happen on demand, whilethe preparation pipeline uses score-based gates.

Assessment gates

Stage               Requirement

Skill Builder       Required practice categories completedMock Assessment     Skill Builder completionAI Mock Interview   Assessment score ≥ configured thresholdDefault threshold   80%

The threshold is configurable through:

MOCK_ASSESSMENT_PASS_THRESHOLD=80

Core Features

Resume Intelligence

PDF/DOCX resume upload

Deterministic ATS-style analysis

Resume / recruiter / quality scoring

Skill and keyword detection

Section analysis

Missing skills and keywords

Strengths and weaknesses

Job-description matching

Resume improvement suggestions

Direct resume editing

Re-scoring after changes

JD-specific Tailored Resume generation

PDF/DOC export

AI is used for explanation and generation where appropriate; corescoring remains separated from AI-generated commentary.

Opportunity Matcher

Matches the candidate against available opportunities using persistedresume intelligence such as:

Detected skills

Missing skills

Predicted role

Resume quality signals

Job requirements

Preferred skills

The matcher provides:

Match percentage

Matched skills

Missing skills

Match explanation

Job details

Save / Apply actions

Apply is an external action. PrepWise AI does not submitapplications on behalf of the candidate. The Apply action opens the realexternal posting.

The current opportunity pipeline supports Internshala listings and adatabase-backed job catalog.

Applications

A dedicated application tracker records engagement with opportunities:

Saved → Applied → Interview → Offered / Rejected

Users can track application status without PrepWise pretending to submitapplications itself.

Skill Builder

Practice is divided into focused categories:

MCQ

Coding

Aptitude

AI Tutor

HR

Company-specific practice

The practice experience includes:

One-question-at-a-time flow

Progress tracking

Real coding test execution

Randomized practice subsets

Result summaries

AI-supported open-answer feedback

AI Tutor conversations

Coding submissions are evaluated against actual test cases rather thanself-reported results.

Mock Assessment

Mock Assessments are company-specific.

Company selection uses searchable company data, and the assessmentpattern can change according to the selected company's configured style.

The assessment system supports:

Company-specific patterns

Aptitude / coding / balanced / behavioral emphasis

Countdown timer

Automatic submission at timeout

Score calculation

Configurable pass threshold

Assessment history

The webcam feature is a visual proctoring simulation only; it doesnot record or upload webcam footage.

AI Mock Interview

The interview experience is designed around the candidate rather than ageneric question list.

Questions can incorporate:

Resume

Projects

Target company

Target role

Technical topics

Behavioral topics

The interview session records performance data that can later contributeto analytics and future preparation recommendations.

Performance Analytics

Analytics aggregates historical performance across the platform:

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

The objective is to show progress over time, not just a singlescore.

Architecture

┌──────────────────────────────────────────────────────────┐
│                     React + Vite                          │
│                                                          │
│ Dashboard • Resume • Opportunities • Skills • Assessment │
│ Interview • Applications • Analytics                     │
└──────────────────────────┬───────────────────────────────┘
                           │ REST API
                           ▼
┌──────────────────────────────────────────────────────────┐
│                  Express + Node.js                        │
│                                                          │
│ Auth • Resume • ATS • Jobs • Applications • Skills       │
│ Assessment • Interview • Analytics                       │
└──────────────────────────┬───────────────────────────────┘
                           │ Sequelize
                           ▼
┌──────────────────────────────────────────────────────────┐
│                         MySQL                            │
│                                                          │
│ Users • Resumes • Resume Analyses • Jobs • Applications   │
│ Skills • Assessments • Interviews • Metrics • Companies  │
└──────────────────────────────────────────────────────────┘

                 AI Layer: Google Gemini

Stack

Frontend - React - Vite - Tailwind CSS - React Router - Recharts -Framer Motion

Backend - Node.js - Express.js - Sequelize - MySQL - JWTauthentication - bcrypt password hashing - Multer for resume uploads

AI - Google Gemini API

Engineering - REST APIs - Deterministic ATS/scoring services -Relational persistence - Protected routes - Environment-based secrets -Jest + Supertest test suite

Database

PrepWise AI uses one database: MySQL.

There is no MongoDB dependency in the current architecture.

The schema is available at:

backend/database/schema.sql

The application also uses Sequelize models and database synchronizationduring development.

Core data areas include:

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

Authentication stores passwords as bcrypt hashes, never plaintextpasswords.

Security

Secrets are intentionally kept outside Git.

Create:

backend/.env

Example:

PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=prepwise_ai_app
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_long_random_secret

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_configured_gemini_model

CLIENT_ORIGIN=http://localhost:5173

MOCK_ASSESSMENT_PASS_THRESHOLD=80

Never commit .env or API keys to GitHub.

The repository's .gitignore excludes environment files, dependencies,generated uploads, and build output.

For production deployment, secrets should be configured through thehosting provider's environment-variable / secret settings.

Getting Started

1. Clone

git clone https://github.com/Jnana1964/prepwise-ai.git
cd prepwise-ai

2. Backend

cd backend
npm install

Create:

backend/.env

Add your local MySQL and Gemini configuration.

Start the API:

npm run dev

3. Frontend

Open another terminal:

cd frontend
npm install
npm run dev

The Vite development server will provide the frontend URL shown in yourterminal.

Database Setup

The project includes:

backend/database/schema.sql

For a manual MySQL setup:

mysql -u root -p < backend/database/schema.sql

During development, the backend also initializes the Sequelize databasestructure on startup according to the current project configuration.

Real Data Philosophy

PrepWise AI deliberately avoids fake dashboard metrics.

Deterministic systems

The following are computed from actual persisted data:

ATS score

Resume quality signals

JD match

Job match

Matched / missing skills

Skill progress

Assessment results

Next Best Action

Analytics trends and deltas

AI-assisted systems

Google Gemini is used where generative reasoning is useful, such as:

AI Tutor

Open-ended answer feedback

Resume wording assistance

Tailored resume generation

Interview-oriented feedback where configured

AI-generated text is separated from deterministic scoring so a generatedexplanation cannot silently change the underlying score.

Opportunity Data

Opportunity Matcher supports a database-backed job catalog andInternshala synchronization.

The Internshala integration:

Retrieves current public internship listing information

Stores normalized opportunities in the jobs table

Supports periodic synchronization

Fails softly if the external source changes or blocks automatedrequests

Does not submit applications automatically

The candidate always completes the actual application on the externalplatform.

Resume Tailoring

Tailored Resume allows a candidate to provide a job description andgenerate a role-focused version of the resume.

The generation is constrained to the candidate's existing information:

No invented employers

No invented titles

No invented dates

No invented achievements

The output focuses on reorganizing and rewording existing informationaround the target role.

Project Structure

prepwise-ai/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
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

Engineering Highlights

Shared candidate profile

Resume Intelligence creates the central persisted resume analysis usedby downstream modules.

Real authentication

JWT-based authentication

Protected API routes

bcrypt password hashing

Protected frontend routes

Real persistence

User progress is stored in MySQL rather than relying only on browserstate.

Score-based progression

Assessment and interview access is controlled by persisted completionand score state.

Deterministic matching

Opportunity matching is based on structured candidate and job datarather than random percentages.

Historical analytics

Performance data can be represented as trends and deltas instead of onlystoring the latest result.

Validation

The project includes automated tests covering areas such as:

ATS determinism

Job-match boundaries

Authentication validation

Assessment threshold behavior

Interview gating

Company isolation

Application authorization

Frontend production builds are also validated with Vite.

Run:

cd backend
npm test

Build the frontend:

cd frontend
npm run build

Current Scope

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

The architecture is intentionally modular so additional companies,question banks, assessment patterns, AI capabilities, and opportunitysources can be added without redesigning the entire application.

What This Project Demonstrates

PrepWise AI is more than a UI project. It demonstrates practicalfull-stack engineering across:

Product architecture

React application design

REST API development

Authentication and authorization

MySQL relational modeling

Sequelize ORM

Resume parsing

Deterministic scoring

Structured skill matching

AI integration

Coding evaluation

Assessment gating

External opportunity linking

Historical analytics

Production-oriented environment management

Deployment Status

Status: Deployed 🚀

PrepWise AI is deployed as a full-stack application with separate frontend, backend, database, and AI configuration.

Connect

Jnana Keerthana

Computer Science EngineeringSRM University

GitHub: https://github.com/Jnana1964

LinkedIn: https://www.linkedin.com/in/jnana-keerthana-1906jk

License

This project is developed as a portfolio / academic project.
