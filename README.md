Pasted code.js
JavaScript
interview is working but resume upload is not working
Pasted code.js
JavaScript
resume controller 
Pasted code.js
JavaScript
Pasted code.js
JavaScript
what is this for coding question and also in interview history only user answers is there include ai answers
still giving like this 
Pasted code.js
JavaScript
give me full updated code
   this is also same no change 
const db = require("../config/db");
require("dotenv").config();

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const questionBank = {
  "Full Stack": [
    "Explain how React communicates with a Node.js backend API.",
    "What is JWT authentication and why is it used?",
    "Explain the difference between SQL and NoSQL databases.",
    "How do you handle form validation in a full-stack application?",
    "What is REST API and how does it work?",
  ],
  "Data Science": [
    "Explain the difference between supervised and unsupervised learning.",
    "What is overfitting in machine learning?",
    "Explain data preprocessing and why it is important.",
    "What is the difference between classification and regression?",
    "Explain confusion matrix in simple terms.",
  ],
  "DevOps": [
    "What is CI/CD?",
    "Explain Docker and why it is used.",
    "What is the difference between horizontal and vertical scaling?",
    "Explain Kubernetes in simple terms.",
    "What is infrastructure as code?",
  ],
};

const getFallbackQuestion = (role) => {
  const questions = questionBank[role] || questionBank["Full Stack"];
  return questions[Math.floor(Math.random() * questions.length)];
};

const generateQuestion = async (req, res) => {
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ message: "Role is required" });
  }

  const prompt = 
Generate one technical interview question for a fresher candidate.

Role: ${role}

Rules:
- Return only one question.
- Do not include explanation.
- Do not include numbering.
- Keep it practical and interview-style.
;

  try {
    const aiResponse = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",
  messages: [
    {
      role: "user",
      content: prompt,
    },
  ],
});

let question = aiResponse.choices[0]?.message?.content || "";
    question = question
      .replace(/
/g, "")
      .replace(/^Question:/i, "")
      .trim();

    if (!question) {
      question = getFallbackQuestion(role);
      return res.status(200).json({
        role,
        question,
        source: "fallback",
      });
    }

    return res.status(200).json({
  role,
  question,
  source: "groq",
});

  } catch (groqError) {
  console.error("Groq unavailable, using fallback:", groqError.message);
    const fallbackQuestion = getFallbackQuestion(role);

    return res.status(200).json({
      role,
      question: fallbackQuestion,
      source: "fallback",
    });
  }
};

const fallbackEvaluation = (answer) => {
  let score = 50;
  const lowerAnswer = answer.toLowerCase();

  if (answer.length > 80) score += 15;
  if (lowerAnswer.includes("example")) score += 10;
  if (lowerAnswer.includes("because")) score += 10;
  if (lowerAnswer.includes("used")) score += 5;
  if (lowerAnswer.includes("project")) score += 5;

  score = Math.min(score, 100);

  return {
    score,
    feedback:
      "Good attempt. Add more technical depth, proper structure, and one real project-based example.",
    strengths: [
      "Answer is relevant to the question",
      "Basic understanding is visible",
    ],
    weaknesses: [
      "Needs more technical detail",
      "Needs a real project example",
      "Should explain the concept in a clearer structure",
    ],
    betterAnswer:
      "A stronger answer should start with a clear definition, explain why the concept is used, describe how it works, and connect it to a real project example.",
  };
};

const saveInterviewSession = (
  req,
  res,
  role,
  question,
  answer,
  evaluation,
  source
) => {
  const fullFeedback = JSON.stringify({
    feedback: evaluation.feedback,
    strengths: evaluation.strengths || [],
    weaknesses: evaluation.weaknesses || [],
    betterAnswer: evaluation.betterAnswer || "",
    source,
  });

  const sql = `
    INSERT INTO interview_sessions
    (user_id, role_name, question, answer, feedback, score)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [req.user.id, role, question, answer, fullFeedback, evaluation.score],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to save interview answer",
          error: err.message,
        });
      }

      return res.status(201).json({
        message:
           source === "groq"
             ? "Answer evaluated successfully using Groq AI"
             : "Answer evaluated using fallback logic",
        sessionId: result.insertId,
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths || [],
        weaknesses: evaluation.weaknesses || [],
        betterAnswer: evaluation.betterAnswer || "",
        source,
      });
    }
  );
};

const submitAnswer = async (req, res) => {
  const { role, question, answer } = req.body;

  if (!role || !question || !answer) {
    return res.status(400).json({
      message: "Role, question, and answer are required",
    });
  }

  try {
    const prompt = `
You are a strict technical interviewer.

Evaluate the candidate's answer.

Role: ${role}

Question:
${question}

Candidate Answer:
${answer}

Return feedback in this exact JSON format only:

{
  "score": number from 0 to 100,
  "feedback": "short direct feedback",
  "strengths": ["point 1", "point 2"],
  "weaknesses": ["point 1", "point 2"],
  "betterAnswer": "a stronger improved answer"
}

Do not include markdown.
Do not include extra text.
`;

    let evaluation;

    try {
      const aiResponse = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",
  messages: [
    {
      role: "user",
      content: prompt,
    },
  ],
});

let rawText = aiResponse.choices[0]?.message?.content || "";
      rawText = rawText
        .replace(/
json/g, "")
        .replace(/
/g, "")
        .trim();

      try {
        evaluation = JSON.parse(rawText);
      } catch {
        evaluation = {
          score: 60,
          feedback:
            rawText ||
            "AI feedback generated, but response format was not valid JSON.",
          strengths: [],
          weaknesses: [],
          betterAnswer: "",
        };
      }

      evaluation.score = Math.min(
        Math.max(Number(evaluation.score) || 0, 0),
        100
      );

      return saveInterviewSession(
        req,
        res,
        role,
        question,
        answer,
        evaluation,
        "groq"
    } ca  );
    tch (geminiError) {
      console.error("Groq unavailable, using fallback:", groqError.message);

      evaluation = fallbackEvaluation(answer);

      return saveInterviewSession(
        req,
        res,
        role,
        question,
        answer,
        evaluation,
        "fallback"
      );
    }
  } catch (error) {
    console.error("Interview evaluation error:", error);

    return res.status(500).json({
      message: "Interview evaluation failed",
      error: error.message,
    });
  }
};

module.exports = { generateQuestion, submitAnswer };and also check this
backend/controllers/authController.js not there
http://localhost:5173/login no 
1 is dahboard and 2 is home page
remove this mic keep it very professtional it is not good no sugarcoating and be my mentor
Pasted code.js
JavaScript
give me full updated code 
i want like this remove things in 2 pic
remove this type and give like ur voice assistant, no need voice question display is okay 
i want this same bar in voice assistant it should be both typing and voice answer
this doesnt look good , looking like childish
i want this exactly but remove that plus symbol rest give fully 
this image should be there give output first 
check all screenshots neatly and correctly my goal is to make it look like a startup website , nos ugarcoating and be my ruthless mentor
see make it in to a prominate , i want each page should look like proper start up feel and dont want messy thing okay help me in inthant and also help to modify proper theme and i give my logo , i given two things for home pages use one which is best and more good also create some kind of viuals for it for other pages i will give u other ideas tell wil u help me no sugar coating 
Edit
Edit
use this colour for home page 
Edit
Edit
Pasted markdown.md
File
# Got it. Here's How to Make Your Project Look ADVANCED & IMPRESSIVE

---

## 🎯 ADVANCED TECHNICAL IMPLEMENTATIONS

### 1. **Resume Parser (Real AI, Not Fake)**

❌ Don't: Manual skill detection
✅ Do: Integrate actual APIs
   - Google Document AI (PDF parsing)
   - Hugging Face transformers (NER - Named Entity Recognition)
   - spaCy for skill extraction
   - Generate real ATS score (PDF structure + keyword matching algorithm)


### 2. **Real Job Data Integration**

✅ Connect to actual job APIs:
   - RapidAPI Job Search API
   - LinkedIn Jobs API (limited)
   - Job board scraping (legal: Indeed, Naukri via Selenium)
   
   Don't: Hardcode fake job data


### 3. **AI Interview Engine (Production-Grade)**

✅ Actually implement:
   - OpenAI/Claude API for question generation
   - Deepgram/AssemblyAI for speech-to-text
   - Real evaluation logic (score based on keywords, coherence, depth)
   - Generate actual feedback (not random text)

❌ Don't: Pretend to process voice when you're not


### 4. **Advanced Database Design**

Users Table
├── user_id (PK)
├── email (UNIQUE)
├── password_hash
├── created_at
├── updated_at

Resumes Table
├── resume_id (PK)
├── user_id (FK)
├── file_path (S3 URL)
├── ats_score (DECIMAL)
├── extracted_skills (JSON)
├── parsed_content (JSON)
├── analyzed_at

Jobs Table
├── job_id (PK)
├── title
├── company
├── skills_required (JSON)
├── source (indeed/linkedin/api)

UserJobMatch Table
├── match_id (PK)
├── user_id (FK)
├── job_id (FK)
├── match_score (CALCULATED)
├── missing_skills (JSON)

InterviewAttempts Table
├── attempt_id (PK)
├── user_id (FK)
├── company (nullable)
├── questions (JSON array)
├── answers (JSON array)
├── scores (JSON)
├── feedback (JSON)
├── timestamp


---

## 🏗️ ADVANCED ARCHITECTURE

### Frontend Structure

src/
├── pages/
│   ├── CareerIntelligenceDashboard/
│   ├── ResumeIntelligenceHub/
│   ├── OpportunityMatcher/
│   └── MockInterviewStudio/
├── components/
│   ├── AIResumeAnalyzer/
│   ├── InteractiveCharts/
│   ├── RealtimeSkillDetector/
│   └── InterviewEvaluator/
├── hooks/
│   ├── useResumeAnalysis.js
│   ├── useJobMatching.js
│   ├── useInterviewEvaluation.js
├── services/
│   ├── resumeService.js (AI parsing)
│   ├── jobMatchingEngine.js (algorithmic)
│   ├── interviewEvaluator.js (LLM-based)
├── utils/
│   ├── skillMatcher.js
│   ├── atsScoring.js
│   ├── feedbackGenerator.js
├── store/ (Redux/Zustand)
│   ├── userSlice
│   ├── resumeSlice
│   ├── jobSlice
└── styles/ (Tailwind + custom animations)


### Backend Architecture

Backend/
├── routes/
│   ├── auth.routes.js (JWT)
│   ├── resume.routes.js
│   ├── job.routes.js
│   ├── interview.routes.js
│   └── user.routes.js
├── controllers/
│   ├── resumeController.js (calls AI services)
│   ├── jobController.js (calls matching engine)
│   ├── interviewController.js (calls evaluator)
├── services/
│   ├── aiResumeParser.js (Hugging Face/Google API)
│   ├── jobMatchingEngine.js (scoring algorithm)
│   ├── interviewEvaluator.js (OpenAI API)
│   ├── skillDetector.js
├── models/
│   ├── User.js
│   ├── Resume.js
│   ├── Job.js
│   ├── Interview.js
├── middleware/
│   ├── auth.js (JWT verification)
│   ├── errorHandler.js
│   ├── validation.js
├── config/
│   ├── database.js
│   ├── env.js
│   ├── apiKeys.js
└── utils/
    ├── logger.js
    ├── constants.js


---

## 🚀 FEATURES THAT MAKE YOU STAND OUT

### Resume Analysis

javascript
✅ Real implementation:
- Extract text from PDF (PDF.js or pdfparse)
- Run NLP (spaCy/Hugging Face) for skill extraction
- Calculate ATS score with algorithm:
  * Keywords match (40%)
  * Formatting quality (20%)
  * Grammar/professionalism (20%)
  * Completeness (20%)
- Suggest improvements with specifics (not generic)
- Generate report in PDF


### Job Matching Algorithm

javascript
✅ Real scoring logic:
const matchScore = (userSkills, jobSkills) => {
  let matched = 0;
  let total = jobSkills.length;
  
  userSkills.forEach(skill => {
    if (jobSkills.includes(skill)) matched++;
  });
  
  return (matched / total) * 100;
};

// Identify skill gaps
const skillGaps = jobSkills.filter(s => 
  !userSkills.includes(s)
);

// Suggest learning resources
const resources = generateLearningPath(skillGaps);


### Interview Evaluation

javascript
✅ Real evaluation:
- Use OpenAI API to generate company-specific questions
- Process user's voice answer (Deepgram)
- Evaluate on:
  * Relevance (does answer match question)
  * Completeness (covers all points)
  * Communication (grammar, fluency)
  * Technical depth
- Generate specific feedback
- Score out of 10 with reasons


---

## 🎨 UI/UX THAT IMPRESSES

### Use Advanced Components

✅ Do this:
- Recharts for interactive dashboards
- Framer Motion for smooth animations
- React Toastify for notifications
- React Query for data fetching
- Zustand/Redux for state management
- Code syntax highlighting (Prism.js for code questions)
- Drag-and-drop for resume sections (React Beautiful DND)
- Real-time progress indicators


### Advanced Animations

- Smooth page transitions
- Animated progress bars during analysis
- Loading skeletons (not just spinners)
- Hover effects on job cards
- Animated charts
- Toast notifications for AI processing


---

## 📊 ADVANCED FEATURES TO INCLUDE

| Feature | What Makes It Advanced |
|---------|------------------------|
| **Dashboard** | Real-time progress tracking, animated charts, AI insights, trending recommendations |
| **Resume Upload** | Live preview, real-time ATS score calculation, section-by-section feedback, PDF generation |
| **Job Matcher** | Algorithmic matching, skill gap visualization, personalized learning paths |
| **Mock Interviews** | Real speech processing, company-specific questions, video recording, AI evaluation |
| **Analytics** | Performance trends, strength/weakness identification, improvement suggestions over time |

---

## 💾 DEPLOYMENT & POLISH


✅ Deploy properly:
- Frontend: Vercel (auto-deploy from GitHub)
- Backend: Railway, Render, or AWS (not localhost)
- Database: Hosted MySQL (AWS RDS, Aiven)
- File storage: AWS S3 for resumes
- Environment variables properly managed
- Error logging (Sentry)
- API rate limiting
- Proper CORS setup

✅ Code quality:
- ESLint + Prettier
- Unit tests (Jest)
- API documentation (Swagger/OpenAPI)
- Proper error handling
- Input validation
- SQL injection prevention


---

## 📝 PROFESSIONAL NAMING (FINAL)


Dashboard → "Career Intelligence Dashboard"
Resume Upload → "Resume Intelligence Hub"  
Jobs → "Opportunity Matcher Engine"
Company Prep → "Employer-Specific Preparation Module"
AI Interview → "Mock Interview Studio"
Results → "Interview Performance Analytics"


---

## ⭐ WHAT WILL IMPRESS RECRUITERS

1. **Real API integrations** (not fake data)
2. **Actual AI/ML** (not just UI pretending)
3. **Proper database design** (not flat JSON)
4. **Clean code architecture** (not spaghetti)
5. **Error handling & validation** (production-ready)
6. **Deployed live** (not just local)
7. **GitHub with good commits** (history matters)
8. **README documentation** (shows professionalism)

---

**Focus on DEPTH, not breadth. Build 3 pages REALLY well instead of 11 pages poorly.** That's what separates good projects from impressive ones.                                       use this and give me evrything first generate pics later i will give codes just modify their and theme dont change anything in it
Edit
Edit
Pasted code.js
JavaScript
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <Navbar />

      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="absolute inset-0">
          <div className="absolute bottom-[-250px] left-1/2 h-[600px] w-[1200px] -translate-x-1/2 rounded-full bg-emerald-400/25 blur-[170px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#14F19512_1px,transparent_1px),linear-gradient(to_bottom,#14F19510_1px,transparent_1px)] bg-[size:70px_70px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-[#031f1a]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-2 text-sm text-emerald-300 mb-8">
            ✦ AI-Powered Career Preparation Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
            Build a smarter future
            <br />
            for your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-400">
              career with AI
            </span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            PrepWise AI helps students analyze resumes, discover matching jobs,
            prepare for company interviews, practice mock tests, and improve
            hiring readiness with AI-powered feedback.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-5">
            <Link
              to="/signup"
              className="rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-8 py-4 font-semibold text-black hover:scale-105 transition"
            >
              Get Started Free
            </Link>

            <button
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="rounded-2xl border border-zinc-700 px-8 py-4 font-semibold hover:bg-zinc-900 transition"
            >
              See How It Works
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[220px] bg-gradient-to-t from-emerald-400/20 to-transparent" />
      </section>

      <section id="features" className="relative z-10 px-6 pb-32">
        <div className="max-w-7xl mx-auto rounded-[2rem] border border-emerald-400/20 bg-[#07110f]/80 backdrop-blur-xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Everything you need to get hired
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              title="Resume Analysis"
              description="Analyze ATS score, detected skills, missing sections, and resume improvement areas."
            />
            <FeatureCard
              title="Job Matching"
              description="Discover best-fit roles based on resume skills, match percentage, and skill gaps."
            />
            <FeatureCard
              title="Company Prep"
              description="Generate company-specific technical, HR, coding, and mock test preparation."
            />
            <FeatureCard
              title="Mock Interviews"
              description="Practice interviews using typed or voice answers and receive AI feedback."
            />
            <FeatureCard
              title="Skill Assessment"
              description="Identify missing skills and prepare targeted learning topics for each role."
            />
            <FeatureCard
              title="Career Report"
              description="Track readiness, interview progress, job applications, and next actions."
            />
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-32">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-6">
            From resume to interview readiness
          </h2>

          <p className="text-zinc-400 text-center max-w-3xl mx-auto mb-14">
            PrepWise AI connects resume analysis, job discovery, applied jobs,
            company preparation, mock tests, and interview feedback into one
            clean career preparation workflow.
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            <StepCard
              number="01"
              title="Analyze Resume"
              text="Upload your resume and get ATS insights."
            />
            <StepCard
              number="02"
              title="Match Jobs"
              text="Find roles that fit your skills."
            />
            <StepCard
              number="03"
              title="Prepare Company"
              text="Generate interview kits for selected jobs."
            />
            <StepCard
              number="04"
              title="Practice Interview"
              text="Answer questions and improve with AI."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-black font-black">
            ↗
          </div>
          <span className="text-2xl font-bold">
            PrepWise <span className="text-emerald-400">AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-300">
          <a href="#features" className="hover:text-white">
            Features
          </a>
          <a href="#features" className="hover:text-white">
            How It Works
          </a>
          <Link to="/login" className="hover:text-white">
            Login
          </Link>
        </nav>

        <Link
          to="/signup"
          className="rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 font-semibold text-black hover:scale-105 transition"
        >
          Get Started
        </Link>
      </div>
    </header>
  );
}

function FeatureCard({ title, description }) {
  return (
    <div className="rounded-2xl border border-emerald-400/15 bg-black/40 p-6 hover:border-emerald-400/40 transition">
      <div className="mb-5 h-12 w-12 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-300">
        ✦
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B0B12] p-6">
      <p className="text-emerald-400 font-bold mb-5">{number}</p>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-zinc-400">{text}</p>
    </div>
  );
}

export default Home;                                                                                                              import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navClass = ({ isActive }) =>
    px-5 py-3 rounded-xl transition font-medium ${
      isActive
        ? "bg-violet-600 text-white"
        : "text-zinc-300 hover:bg-zinc-800 hover:text-violet-400"
    };

  return (
    <div className="w-72 min-h-screen bg-zinc-950 border-r border-zinc-800 p-8 flex flex-col justify-between">
      <div>
        <h1 className="text-3xl font-bold text-violet-400 mb-12">
          PrepWise AI+
        </h1>

        <nav className="flex flex-col gap-4">

          <NavLink
            to="/dashboard"
            className={navClass}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/resume-upload"
            className={navClass}
          >
            Resume Upload
          </NavLink>

          <NavLink
            to="/job-matcher"
            className={navClass}
          >
            Job Matcher
          </NavLink>

          <NavLink
            to="/applied-jobs"
            className={navClass}
          >
            Applied Jobs
          </NavLink>

          <NavLink
            to="/company-prep"
            className={navClass}
          >
            Company Prep
          </NavLink>

          <NavLink
            to="/interview"
            className={navClass}
          >
            AI Interview
          </NavLink>

          <NavLink
            to="/history"
            className={navClass}
          >
            Interview History
          </NavLink>

        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-400 transition py-3 rounded-xl font-semibold text-white"
      >
        Logout
      </button>
    </div>
  );
}

export default Sidebar;                                                                                                               
Stopped thinking
Edit
 it is like this all 
Fri, Jun 12 at 10:20 PM
like this it is cmg
okay but reall logo is missing and it doesnt match to the dashboard what u gave i want dashboard exactly like 2 pic and logo should be good 
logo pic is not visible and in down evrything need  section if it has little pic like in dashboard is good 
Edit
give me the exactlysame first logo in the image with same arrow everything same and give in the theme which we are using
Edit
Edit
see give logo image 4 one exactly but in th e theme what we are using 
Edit
Edit
Edit
see i will paste this logo in it tell me what to do it 
now my logo is there what about code , but i want only to be logo image not again texte image dont waste time , everything is good other than that 
at we will see the logo image  next , i want my sign in and sign up pages like this 
1.Current Dashboard.jsx and Current Sidebar.jsx 2.ResumeUpload.jsx  3.JobMatcher.jsx
Pasted code.js
JavaScript
Pasted code.js
JavaScript
ResumeUpload.jsx full updated code 
1. JobMatcher.jsx  , 2 .CompanyPrep.jsx and 3.CompanyPrep.jsx and font style is not good i want to change it if possible i want 2 image colour theme okay tell whether did u get it or not , no sugarcoating and be my mentor , 
Pasted code.js
JavaScript
see lets complete this pages at last we will do with colours and logo and font 
Mon, Jun 15 at 8:48 PM
Pasted code.js
JavaScript
see u are not getting my point what ever images i will give for theme give exactly like that theme  , mock test should like first image , not like a normal page and questions like 2 image how can u these are questions , dont mis lead no sugarcoating 
Edit
Edit

Since you're building PrepWise AI as a premium AI career platform, don't choose colors because they're trending. Choose colors that match the product and still look modern 3-5 years from now.

Here are my top recommendations.

1. Matte Black + Electric Orange (My #1 Pick) ⭐

Colors

Background: #090909
Card: #151515
Border: #262626
Primary: #FF6B00
Hover: #FF8A00
Success: #22C55E
Error: #EF4444
Text: #FFFFFF
Secondary Text: #9CA3AF

Feeling

Premium
Powerful
Modern
Engineering vibe

Companies using similar colors:

Harley Davidson
KTM
Blender
JetBrains
2. Black + Royal Purple

Colors

Background  #090909
Primary     #7C3AED
Hover       #8B5CF6
Card        #151515
Border      #2D2D2D

Feeling

AI
Premium
Future
Innovation
3. Black + Crimson Red

Colors

Background #090909
Primary #E11D48
Hover #F43F5E

Feeling

Powerful
Cyber
Premium
4. Black + Gold

Colors

Background #090909
Primary #D4AF37
Hover #F4C430

Feeling

Luxury
Executive
Premium
5. Graphite + Ice Blue

Colors

Background #111111
Primary #38BDF8

Feeling

Professional
Corporate
Clean
Colors I would NOT use

❌ Emerald Green
❌ Teal
❌ Neon Green
❌ Bright Cyan
❌ Pure Blue (#2563EB)
❌ Purple + Pink gradients everywhere

These are overused in AI dashboards.

My recommendation for PrepWise AI

Since your project is:

Resume Analysis
ATS Score
Job Matching
Company Preparation
Coding
Aptitude
HR
Technical Interview
AI Mock Interview

I would use this palette:

Background      #090909
Surface         #151515
Border          #262626

Primary         #FF6B00
Hover           #FF8A00

Text            #FFFFFF
Secondary       #9CA3AF

Success         #22C55E
Warning         #F59E0B
Danger          #EF4444
Typography
Headings: Space Grotesk
Body: Inter
Numbers/Scores: JetBrains Mono

This combination immediately makes the UI feel more premium and technical.

Final direction

Don't make PrepWise AI look like a generic admin dashboard. Make it feel like a professional AI career operating system.

Think of it as a blend of:

Notion's cleanliness
Linear's polish
Stripe's spacing
Apple's typography
Cursor AI's modern feel
JetBrains' developer-focused aesthetic

That direction will make your project look significantly more original than typical student projects.

Matte Black + Electric Orange (My #1 Pick) ⭐ this colours and my ui and designs should look like that image everypage and and also include animation also to it it will like a real start up project 
Edit
Edit
Edit
this font  and these theme colours i want 
okay This is what PrepWise AI actually is

PrepWise AI is an AI-powered Placement & Interview Preparation Platform that guides a student from resume creation all the way to becoming interview-ready.

It is not just a resume analyzer.

It is not just a mock interview website.

It is a complete Career Preparation Ecosystem.

The user journey should feel like this:

Home
   ↓
Create Account
   ↓
Career Command Center
   ↓
Upload Resume
   ↓
AI Resume Analysis
   ↓
ATS Score
   ↓
Skill Detection
   ↓
Career Role Prediction
   ↓
Opportunity Matcher
   ↓
Choose Internship / Job
   ↓
Career Tracker
   ↓
Interview Prep Center
   ↓
Aptitude Preparation
   ↓
Technical Interview
   ↓
Coding Assessment
   ↓
HR Interview
   ↓
AI Mock Interview
   ↓
Performance Analytics
   ↓
Interview History

That story is much stronger than "upload resume and get ATS score."

Every page should tell a story
Career Command Center

Not a dashboard.

It should answer:

"Where am I in my placement journey?"

It should show:

Resume Status
ATS Score
Career Readiness
Latest Activity
Quick Actions
Continue Preparation
Resume Intelligence Hub

Purpose:

"Know yourself."

After uploading a resume, users should understand:

ATS Score
Resume Quality
Strong Skills
Missing Skills
Missing Resume Sections
Suggested Career Roles
Improvement Suggestions

Example:

Resume Score

87%

Frontend Developer

Skills

React
Node
JavaScript
MySQL

Missing

TypeScript
Docker

Suggestions

Improve Projects
Add Deployment Links
Opportunity Matcher Engine

Purpose:

"Find opportunities that fit your skills."

Show

Internship cards
Company
Role
Match %
Skills Required
Missing Skills
Apply

This should feel like LinkedIn or Wellfound.

Career Tracker

Purpose

"What jobs have I applied for?"

Timeline

Resume Uploaded

↓

Jobs Applied

↓

Interview Scheduled

↓

Assessment Completed

↓

Interview Completed
Interview Prep Center

Purpose

"I have an interview tomorrow."

Generate

Technical Questions

HR Questions

Coding Questions

Company Information

Interview Pattern

Preparation Roadmap

Resources

Aptitude Preparation

Very important.

Topics

Quantitative Aptitude
Logical Reasoning
Verbal Ability
Data Interpretation

Practice

Explanation

Solutions

Difficulty

Progress

Technical Interview

Divide by topics.

Example

Frontend

React

JavaScript

HTML

CSS

Backend

Node

Express

Database

OOP

Operating Systems

DBMS

CN

Each question

↓

Explanation

↓

Example

↓

Answer

Coding Assessment

This page should look like LeetCode.

Not a normal page.

Show

Problem

Difficulty

Constraints

Examples

Editor

Hints

Solution

Complexity

HR Interview

Cards

Tell me about yourself

Strengths

Weaknesses

Leadership

Conflict

Projects

Goals

Every answer

↓

Ideal Answer

↓

Tips

↓

Common Mistakes

AI Mock Interview

The most premium page.

Looks like

Google Meet

Microsoft Teams

Camera placeholder

Question

Voice Button

Answer Box

Progress

Timer

Next Question

Finish

Feedback

Performance Analytics

Purpose

Show improvement.

Charts

ATS Trend

Interview Scores

Coding Progress

Aptitude Progress

Skill Improvement

Weak Areas

Strengths

Interview History

Biggest problem currently

Your pages feel independent.

They don't feel connected.

The user should always know:

Where am I?

What have I completed?

What should I do next?

That is what makes it feel like a real product.

UI Problems I noticed
Fonts are inconsistent.
Font sizes don't establish a clear hierarchy.
Cards use different spacing and border styles.
Some pages look like forms instead of products.
Colors vary between pages instead of following one design language.
Icons are inconsistent.
Question pages look like plain lists instead of interactive learning experiences.
Some pages have too much empty space while others feel crowded.
The roadmap I'd follow
Create one consistent design system (fonts, colors, spacing, buttons, cards, icons).
Redesign every page using that system.
Connect the pages into a clear placement journey.
Polish animations, loading states, and responsiveness.
Finish branding (logo, typography, final color palette).

If we follow this order, your project will look much closer to a professional AI SaaS product rather than a collection of separate pages. use this theme and font and content to land in premium startup like project 
structure check evrything no sugarcoating give evrything correctly think everything correctly
Pasted code.js
JavaScript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}; frontend/tailwind.config.js                                                                                                     @import "tailwindcss";

@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");

* {
  font-family: "Inter", sans-serif;
}

body {
  margin: 0;
  background: #050505;
  color: #ffffff;
} frontend/src/index.css                                                                                                            import AppRoutes from "./routes/AppRoutes";

function App() {
  return <AppRoutes />;
}

export default App; frontend/src/App.jsx                                                                                                           import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import Interview from "../pages/Interview";
import ResumeUpload from "../pages/ResumeUpload";
import ProtectedRoute from "../components/ProtectedRoute";
import History from "../pages/History";
import JobMatcher from "../pages/JobMatcher";
import CompanyPrep from "../pages/CompanyPrep";
import CompanyMockInterview from "../pages/CompanyMockInterview";
import AppliedJobs from "../pages/AppliedJobs";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route
  path="/job-matcher"
  element={
    <ProtectedRoute>
      <JobMatcher />
    </ProtectedRoute>
  }
/>

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <Interview />
            </ProtectedRoute>
          }
        />

        <Route
         path="/resume-upload"
         element={
          <ProtectedRoute>
           <ResumeUpload />
          </ProtectedRoute>
         }
       />

        <Route
         path="/history"
         element={
          <ProtectedRoute>
           <History />
          </ProtectedRoute>
         }
       />
       
       <Route
  path="/company-mock-interview"
  element={
    <ProtectedRoute>
      <CompanyMockInterview />
    </ProtectedRoute>
  }
/>

       <Route
  path="/company-prep"
  element={
    <ProtectedRoute>
      <CompanyPrep />
    </ProtectedRoute>
  }
/>
        <Route
  path="/applied-jobs"
  element={
    <ProtectedRoute>
      <AppliedJobs />
    </ProtectedRoute>
  }
/>



      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;  frontend/src/routes/*                                                                 import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navClass = ({ isActive }) =>
    flex items-center gap-3 px-4 py-3 rounded-2xl transition text-sm font-medium border ${
      isActive
        ? "bg-teal-400/15 text-teal-300 border-teal-400/25 shadow-[0_0_25px_rgba(20,241,149,0.08)]"
        : "text-zinc-400 hover:bg-white/5 hover:text-white border-transparent"
    };

  return (
    <aside className="w-72 min-h-screen bg-[#050505] border-r border-white/10 p-6 flex flex-col justify-between">
      <div>
        <div className="mb-10">
          <img
            src="/prepwise-logo.png"
            alt="PrepWise AI"
            className="h-14 w-auto object-contain"
          />
        </div>

        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">
            Workspace
          </p>
        </div>

        <nav className="flex flex-col gap-2">
          <NavLink to="/dashboard" className={navClass}>
            <span>▣</span>
            <span>Career Command Center</span>
          </NavLink>

          <NavLink to="/resume-upload" className={navClass}>
            <span>▤</span>
            <span>Resume Intelligence Hub</span>
          </NavLink>

          <NavLink to="/job-matcher" className={navClass}>
            <span>⌘</span>
            <span>Opportunity Matcher Engine</span>
          </NavLink>

          <NavLink to="/applied-jobs" className={navClass}>
            <span>↗</span>
            <span>Career Tracker</span>
          </NavLink>

          <NavLink to="/company-prep" className={navClass}>
            <span>♙</span>
            <span>Interview Prep Center</span>
          </NavLink>

          <NavLink to="/interview" className={navClass}>
            <span>▰</span>
            <span>Mock Interview Studio</span>
          </NavLink>

          <NavLink to="/company-mock-interview" className={navClass}>
            <span>◉</span>
            <span>Interview Simulation Center</span>
          </NavLink>

          <NavLink to="/history" className={navClass}>
            <span>▧</span>
            <span>Performance Analytics</span>
          </NavLink>
        </nav>
      </div>

      <div className="space-y-3 border-t border-white/10 pt-5">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-400 hover:bg-white/5 hover:text-white transition text-sm">
          <span>⚙</span>
          <span>Settings</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 transition text-sm font-medium"
        >
          <span>↪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;                       frontend/src/components/common/Sidebar.jsx                                                                          import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-8 py-6 border-b border-slate-800">
      
      <h1 className="text-2xl font-bold text-cyan-400">
        PrepWise AI+
      </h1>

      <div className="flex gap-6 items-center">
        <Link to="/" className="hover:text-cyan-400 transition">
          Home
        </Link>

        <Link to="/login" className="hover:text-cyan-400 transition">
          Login
        </Link>

        <Link
          to="/signup"
          className="bg-cyan-500 hover:bg-cyan-400 px-5 py-2 rounded-lg font-semibold transition"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;      frontend/src/components/common/Navbar.jsx                          {
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.3.0",
    "axios": "^1.16.1",
    "framer-motion": "^12.40.0",
    "lucide-react": "^1.16.0",
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "react-router-dom": "^7.15.1",
    "recharts": "^3.8.1",
    "tailwindcss": "^4.3.0"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^10.3.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.6.0",
    "vite": "^8.0.12"
  }
}     frontend/package.json  i have given all code no sugarcoating and be my give evrything as per my requirements and ui theme should look very professional and good and also font and font size 
dont include fake things like reviews companies and all it should neat and clean with animations  , logo , taglines and evrything should be good
Pasted code(2).js
JavaScript
MODIFY IT ACCORDING MY REQUIREMENTS 
Pasted code(3).js
JavaScript
see
check
 evrything is okay but side bar is messy
See, sidebar, make it like what, this nana, under that I don't want anything. Just keep it like a nana. Settings, make it in this small one. It is giving like a large space. And also, what is this? Like, everything should be shown. No need of scrolling everything. Why? Give me properly, bro. Just decrease this bar, nana, settings, labbook. Make it into a short like below. Compress.About logo, Prepwise AI logo. You know, right, what is logo? You said like some hexagon, something P, like that. Logo. Tell me about.
Edit
 logo 
In dashboard, welcome back, Nana. Everything is okay. Your next improvement starts, improve resume. Here, resume score, ATS score, what is that? Both are same only, right? Why? And what is resume health? What it will give you? Resume health, resume score, ATS score, all are same. So, I won't change in here. And like logo, I pasted that logo in VSCode. But logo is not showing here. It's showing some blank image kinds.
Edit
See, in this, welcome back Nana, everything is okay. Career rating, use it like some AI insight, something, go with that. Okay. And also here, improve your resume. Improve resume in the sense, what does it mean? Like, you need to help him to improve their resume. Okay, that is what it has to give. Not going to create resume, intelligence, weaknesses, strengths, not that. You need to help them to increase the ATS score of resume. That is what you can do it as a improve resume. See, improve resume, bring down, and move all those four cards up. Delete resume score, and you have given something, profile completion, I don't like it. Just give some other thing. And remove this resume help. Application summary, make it a big. Okay. So this is what I want. Yes, recent activity, okay. Everything okay.
this is my structure what are required and what are not require tell and give according to it
my backend 
i have previous things what to do 
check
const improveResume = async (req, res) => {

  try {

    const {

      resumeText,

      jobDescription = "",

    } = req.body;

    if (!resumeText) {

      return res.status(400).json({

        success: false,

        message: "Resume text is required.",

      });

    }

    const analysis = await analyzeResume(

      resumeText,

      jobDescription

    );

    const improvements = [];

    analysis.issues.forEach((issue) => {

      improvements.push({

        section: issue.title,

        current: issue.description,

        recommendation:
          analysis.suggestions.find(() => true) ||
          "Improve this section.",

      });

    });

    res.json({

      success: true,

      analysis,

      improvements,

    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message: "Failed to improve resume.",

    });

  }

};give me full updated codes of both 
 in dashbord Looking like that, there is no space, clumsiness. Why like that?
i gave pic
Pasted code(7).js
JavaScript
Bro, bro, what is this, bro? I'm dying literally. See, logo is wrong, okay? Crack placement before they even begin. What is that mean? Waste of time. Why dashboard? In homepage, you need to tell about the page, what it is, what is for that. What placement is in one dashboard. Why it is needed? It's in dashboard page. One placement, one platform, every placement. What is this? This is a startup. Start your journey. Why you are giving everything in this? Dashboard should be in dashboard itself. Why are you giving in homepage? From resume to offer letter. This is not good. Your dream job starts today. This is also not good. It should be like very truthful and worthwhile and trustable. Whatever you have given for homepage, it's not at all trustable. Waste, literally worst. And the alignment is like, vomiting. I'm getting vomiting literally. I want to change alignments for dashboard, this homepage, resume intelligency and everything.Opportunity matcher, it's not coming. It's showing try again, analyze resume. In resume intelligence, I told you, like, don't include everything. You will analyze your resume. After that, you will get everything. Like what are the strengths. And improving resume, it should be another, not in same document. It should give like a score and what are there. For improvements, you need to give another one.
prepwise logo 
this is how my website every page should look
Edit
Good, I like it. And my thing is, homepage is also good. What is Prepwise AI? It should be mentioned, right? AI preparation platform. I don't think so it's needed. Okay, okay. See, in homepage, it is the last or like it will be there something below of that, like AI career after that. And sign in, sign up, everything is good. Career command center is also good. Okay. And also, resume, everything is good. Rest all good. In skill builder, like if the job is selected as Google. So in skill builder, if I select Google, it should come like MCQs, exams, everything, coding questions according to that company. That is what I want. And also mock interview also it should be same for that job company. That is what I want. And one more thing is like in career center, okay, everything is okay. Good. Good. And let's complete by today, everything. And my logo, it is not my logo, I'll give you my logo. Make into very good. Okay. Thank you. Do this. I'll tell you, you are better than Claude, otherwise you are not better than Claude.prepwise logo given
This is the structure. And one more thing, this like, I have given a reference before. Okay? I want exactly like that. Don't include so many things in it, okay? I want exactly, don't include any anything. Okay? I mean, homepage, you again include that career commencement. I don't want dashboard to be in my homepage. I want to know what is homepage like, what it is, the website is what is for it, like. It will tell you what. That is what I want. And dashboard, what is your curriculum like going on. That is what it should be. Why are you including dashboard into a homepage? I don't like it. home page given 2
Edit
Edit
Hi, why are you irritating me? See, I'm sitting from like, I mean 12, up to now. Nothing is completed. What are you doing? I gave you like, I gave you like, exactly what I want. You can't build a code, then what you are? Are you a ChatGPT or not? ChatGPT means it will give answer for everything. I think you are not a ChatGPT. Now I'm telling you again. I have given you a picture for you. I want exactly as it is to that, okay? Everything should be like that. Pages. I want code. Complete home page, login, sign-up page, everything, and also dashboard page. Don't include dashboard in home page. I don't like that. Understand? No sugarcoating. Be my mentor. Don't irritate me.
first give me home page i gave my logo okay I gave my reference photo before, okay? And one more thing is like how other websites should look, homepage. I want my website should look like that. But don't include unwanted content in it, okay? Don't repeat things. Just give me what is what and everything. But it should look like a website only, like how other websites should look. Okay? No sugarcoating, be mannered. If you can't give full homepage in one response, give in part wise. Part one, part two, part two. And don't repeat things. If one response limit is complete, stop it and again start from that. Don't repeat lines, okay? And don't tell me to put in here, put here there. Like, don't tell me. Just give me like a one by one, one by one. Okay.
Pasted text.txt
Document
give this to same as above
Copy

.env.example

to

.env

Inside

VITE_API_URL=http://localhost:5000/apiwhat is this  Copy

.env.example

to

.env

Fill

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=prepwise_ai

JWT_SECRET=your_secret_key

GROQ_API_KEY=your_groq_api_key

PORT=5000i didnt check these two 
i have grooq key where i can find ir
it is not looking like my previous one , the past one is farbetter than this , i want one help from u no sugarcoating
y this
Pasted markdown.md
File
Pasted markdown(1).md
File
tell me 
Pasted markdown(2).md
File
Pasted markdown(3).md
File
Pasted markdown(4).md
File
see dont lag anything i want next step to start implementing , no sugarcoating and be my mentor
schema.sql
File
Pasted markdown(5).md
File
Sunday 8:29 PM
Pasted markdown(6).md
File
check this 
Pasted markdown(7).md
File
check
Pasted markdown(8).md
File
this is what it has completed
back to luxora okay check i gave 
Pasted content
11.61 KB •723 lines
Formatting may be inconsistent from source
this claude and schema file and seed file along withh architectur 

Instead, ask it to **implement the frozen architecture exactly as written**.

Below is the prompt I would use.

---

# LUXORA – BACKEND IMPLEMENTATION MASTER PROMPT (PHASE 2)


text
You are a Principal Software Architect, Principal Backend Engineer, Senior Node.js Engineer, Senior Database Engineer, and Security Engineer.

You are NOT designing Luxora.

Luxora's architecture is FINAL and FROZEN.

I will upload:

• Luxora_Final_Frozen_Architecture.md
• schema.sql
• seed.sql

Treat these as the project's constitution.

Never redesign them.

Never simplify them.

Never replace them with your own ideas.

Your job is ONLY to implement the backend exactly according to these documents.

----------------------------------------------------
PROJECT GOAL
----------------------------------------------------

Build a production-quality backend for

LUXORA

AI Powered Luxury Hotel Booking Platform

Countries:

• India
• Japan
• Singapore
• UAE
• Thailand
• France

The backend must be modular, scalable, maintainable, secure and production-ready.

This is NOT a demo project.

This is NOT a CRUD assignment.

This must look and behave like software built by a professional engineering team.

----------------------------------------------------
IMPLEMENTATION RULES
----------------------------------------------------

DO NOT redesign architecture.

DO NOT redesign database.

DO NOT redesign APIs.

DO NOT rename folders.

DO NOT rename modules.
Pasted markdown(9).md
File
give prompt
Pasted markdown(10).md
File
Pasted markdown(11).md
File
 i dont have phases files
PrepWiseAI_Continuation_Report.md
File
what about this do i need to paste
 this one but it is in inside of backend
 help me to run this
 i want this project how can i reterive
 this how i wanted it okay now lets stop generating phases okay lets ask codes
Wednesday 8:57 PM
y 
i changed port but np
http://localhost:5175/login
Request Method
GET
Status Code
304 Not Modified
Remote Address
[::1]:5175
Referrer Policy
strict-origin-when-cross-origin
connection
keep-alive
date
Wed, 05 Aug 2026 15:47:59 GMT
keep-alive
timeout=5
vary
Origin
vary
Sec-Fetch-Dest

but name is prepwise_ai
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const router = express.Router();

const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/* SIGNUP */
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const checkUserSql = "SELECT * FROM users WHERE email = ?";

    db.query(checkUserSql, [email], async (err, users) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
          error: err.message,
        });
      }

      if (users.length > 0) {
        return res.status(409).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertSql =
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

      db.query(insertSql, [name, email, hashedPassword], (err, result) => {
        if (err) {
          return res.status(500).json({
            message: "Signup failed",
            error: err.message,
          });
        }

        const userId = result.insertId;

        // ===== ADD THIS SECTION =====
        // 1. Create user_stats entry
        db.query(
          "INSERT INTO user_stats (user_id) VALUES (?)",
          [userId],
          (err) => {
            if (err) console.error("Failed to create user_stats:", err);

            // 2. Create progress steps
            const progressSteps = [
              [userId, "Resume", 1, "upcoming"],
              [userId, "Analysis", 2, "upcoming"],
              [userId, "Mock Tests", 3, "upcoming"],
              [userId, "Interview Prep", 4, "upcoming"],
              [userId, "Placement", 5, "upcoming"],
            ];

            let stepsCreated = 0;
            progressSteps.forEach((step) => {
              db.query(
                "INSERT INTO user_progress (user_id, step_name, step_order, status) VALUES (?, ?, ?, ?)",
                step,
                (err) => {
                  if (err) console.error("Failed to create progress step:", err);
                  stepsCreated++;

                  // After all steps created, create summary
                  if (stepsCreated === progressSteps.length) {
                    db.query(
                      "INSERT INTO user_progress_summary (user_id) VALUES (?)",
                      [userId],
                      (err) => {
                        if (err) console.error("Failed to create progress_summary:", err);

                        // ===== THEN RETURN RESPONSE =====
                        const user = {
                          id: userId,
                          name,
                          email,
                        };

                        const token = createToken(user);

                        return res.status(201).json({
                          message: "User registered successfully",
                          token,
                          user,
                        });
                      }
                    );
                  }
                }
              );
            });
          }
        );
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

/* LOGIN */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, users) => {
    if (err) {
      return res.status(500).json({
        message: "Database error",
        error: err.message,
      });
    }

    if (users.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    const token = createToken(userData);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: userData,
    });
  });
});

module.exports = router;
 see these are my pages okay , only ai mock test and analytics are pending and resume analysis ahould be accurate and also all pages should be connected is pending and ai mock interview page should be inserted and dashboard is not working . if resume get accurate score like jobscan and all other resume anlaysis ats score platform thats it the project is over 
okay give like that full prompt no sugarcaoting and be my mentor be very very strict in resume analysis and resume building like this i want my ui already it there make it very better and tailored resume separate , only 3 things resume analysis , improve resume , tailored resume okay and also in upload resume include jd option also thats it give prompt according to it 
 where to add this
go according to my side bar 
these are my ui layout i want exact in it okay mock procced how mocktest are 
 i choose this 
Good — DB table as primary source, with room for an external API later. Here's the plan before I write anything.

## Schema (new migration database/005_jobs_and_applications.sql)

**jobs** — the real postings table (admin/you-populated for now, source column leaves room for a future API feeder):
id, company_name, company_logo_url, role_title, category, job_type, location, is_remote, salary_min, salary_max, salary_currency, salary_period, experience_level, required_skills (JSON), preferred_skills (JSON), responsibilities (JSON), full_description (TEXT), external_url, source ('manual'|'api'), is_active, posted_at, created_at 

**job_applications** — formalizes the table dashboardRoutes.js already queries (but nothing has ever written to):
id, user_id, job_id, status ('Saved'|'Applied'|'Interview'|'Offered'|'Rejected'), applied_at, status_updated_at, created_at, unique on (user_id, job_id) so Save/Apply is idempotent per job.

**One real bug this surfaces:** dashboardRoutes.js currently counts applications with status = 'submitted' — a value nothing has ever written (Applications.jsx is 100% localStorage today). That stat has silently always read 0. I'll fix it to status = 'Applied' so it actually works, and flag that as a disclosed 1-line change to a file outside this feature's core scope.

## Backend

- **services/jobs/jobMatchingService.js** (new, deterministic — no AI here, this is structured field overlap, not free text) — pulls the user's *already-persisted* resume_analyses row (skills, ats_score, predicted_role, missing_skills, and recruiter score from the quality_breakdown.composites JSON saved in Step 3) server-side via req.user.id, no more localStorage bridging. Matches against jobs.required_skills/preferred_skills (required weighted higher), returns match%, matched/missing skills per job.
- **controllers/jobController.js** — full rewrite (the current file is 100% hardcoded, unsalvageable): getJobRecommendations, getJobDetails, saveJob, applyToJob.
- **routes/jobRoutes.js** — updated routes, all authenticated.
- **controllers/applicationsController.js + routes/applicationsRoutes.js** (new) — real GET /api/applications and PATCH /api/applications/:id/status, replacing Applications.jsx's localStorage.
- **server.js** — one line to mount the new applications route.

## Frontend

Rebuilds OpportunityMatcher.jsx to match your screenshot exactly (card per job: company/role/match%/salary/experience/job type/location/matched+missing chips/View Details/Save/Apply), a View Details modal (full JD/responsibilities/required+preferred skills/company info), and rewires Applications.jsx to the real API. Existing unused components/opportunity/* files don't match this layout either, so this is new UI built to your screenshot, not a retrofit.

## The one thing I need from you before coding

An empty jobs table means the feature has nothing to show. I don't want to invent postings that look like real Google/Microsoft listings with made-up salaries — that's the exact fabrication this project has been avoiding. So: u will have apply button if u click it u direct to intershala according to role u choose 
first i need to run all of them see this works i will check right tell what to do and step 3 reume where to add
what is this
give it like same in that but remove placement journey , along with see it in action boxes and right rmove that box and place my logo rest all keep it sam eas it it no fake data inserted okay give prompt now
Edit
Thursday 4:38 PM
why help me 
 check still same
Edit
Pasted text(1).txt
Document
 WHY IT LIKE THAT 
Pasted markdown(20260808-184307).md
File
 SSE THIS README IS TOO BIG AND NOT GOOD LOOKING AT ALL USE ALL THIS AND I AM USING GEMINI API KEY OKAY , GENERATE PROPER README THAT SHOULD IMPRESS RECRUITER 

Yes — your current README is way too long for a recruiter. It reads more like an internal engineering handoff than a polished portfolio project.

I rebuilt it using the actual information from your uploaded README, but reorganized it around what a recruiter cares about: what the product does, architecture, features, tech stack, engineering depth, setup, security, and validation.

I also changed the AI provider reference to Google Gemini, as you specified.

Download the new README

Download the polished PrepWise AI README

What I deliberately removed
Long debugging history
Sandbox limitations
Internal implementation commentary
Repeated explanations
Excessive database SQL details
"I couldn't test X because..." explanations
Old OpenAI/Groq references
Internal development notes that don't impress recruiters
What I kept/highlighted
Full product pipeline
React + Node.js + Express + MySQL architecture
Gemini AI integration
Deterministic ATS engine
Resume intelligence
Opportunity matching
Internshala integration
Skill Builder
Company-specific mock assessments
AI mock interviews
Analytics
JWT + bcrypt authentication
Real database persistence
Assessment/interview gating
Coding evaluation
Resume tailoring
Security / .env handling
Testing and validation
Project structure

This version is much closer to a professional GitHub portfolio README rather than a dump of development notes. 

README_PrepWise_AI.md
Document
INCLUDE MY LINKDIN AND GITHUB PROFILE 

Yes. I can add the GitHub profile confidently, but I could not reliably identify your personal LinkedIn profile from search results, so I don't want to put the wrong person's LinkedIn into your README.

Your GitHub profile is:

GitHub — Jnana1964

Add this at the bottom of the README

Replace the current Author section with:

## Connect

**Jnana Keerthana**

Computer Science Engineering  
SRM University

[GitHub](https://github.com/Jnana1964) · [LinkedIn](YOUR_LINKEDIN_URL)

Send me your exact LinkedIn profile URL (copy it from your browser), and I'll update the README file and give you the final recruiter-ready version.

GitHub: 
https://github.com/Jnana19644

LinkedIn: www.linkedin.com/in/jnana-keerthana-1906jk USE INCLUDE THEM AND GIVE ME NO SUGARCOATING BE MY RUTHLESS MENTOR AND STATUS ALSO DEPOLYED MENTION IT

Done. I added your GitHub, LinkedIn, and Deployed status to the README.

Download the final recruiter-ready README

Ruthless mentor verdict

Your README is now much stronger, but don't make one mistake:

Only write “Deployed” if the application is actually live and usable from the public URL. If you have only pushed to GitHub and haven't finished Vercel/Render/Railway deployment yet, writing “Deployed 🚀” is false and a recruiter can catch that immediately.

Your links are:

GitHub: https://github.com/Jnana1964
LinkedIn: https://www.linkedin.com/in/jnana-keerthana-1906jk

And the README now presents PrepWise AI as a real full-stack AI career platform, not just a collection of UI pages. 

README_PrepWise_AI.md
Document

Library
/
ai interview
/
README_PrepWise_AI.md
PrepWise AI

An AI-powered career preparation platform that turns a resume into a
personalized, measurable placement journey.

PrepWise AI connects Resume Intelligence → Opportunity Matching →
Skill Building → Mock Assessments → AI Mock Interviews → Performance
Analytics in one platform.

The goal is simple: help a candidate understand where they stand,
identify what is missing, practice deliberately, and measure improvement
over time.

Why PrepWise AI?

Most placement tools solve only one problem: resume checking, job
discovery, coding practice, or mock interviews.

PrepWise AI connects them.

Your resume creates a real candidate profile.
Resume weaknesses become preparation targets.
Skills and role fit drive opportunity matching.
Skill Builder progress controls assessment access.
Assessment performance controls mock-interview access.
Interview weaknesses can guide future practice.
Analytics tracks improvement instead of showing isolated scores.

The platform is designed around real persisted data rather than
hardcoded dashboard numbers or fake activity.

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

Resume preparation and opportunity discovery can happen on demand, while
the preparation pipeline uses score-based gates.

Assessment gates

Stage Requirement

Skill Builder Required practice categories completed
Mock Assessment Skill Builder completion
AI Mock Interview Assessment score ≥ configured threshold
Default threshold 80%

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

AI is used for explanation and generation where appropriate; core
scoring remains separated from AI-generated commentary.

Opportunity Matcher

Matches the candidate against available opportunities using persisted
resume intelligence such as:

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

Apply is an external action. PrepWise AI does not submit
applications on behalf of the candidate. The Apply action opens the real
external posting.

The current opportunity pipeline supports Internshala listings and a
database-backed job catalog.

Applications

A dedicated application tracker records engagement with opportunities:

Saved → Applied → Interview → Offered / Rejected

Users can track application status without PrepWise pretending to submit
applications itself.

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

Coding submissions are evaluated against actual test cases rather than
self-reported results.

Mock Assessment

Mock Assessments are company-specific.

Company selection uses searchable company data, and the assessment
pattern can change according to the selected company's configured style.

The assessment system supports:

Company-specific patterns
Aptitude / coding / balanced / behavioral emphasis
Countdown timer
Automatic submission at timeout
Score calculation
Configurable pass threshold
Assessment history

The webcam feature is a visual proctoring simulation only; it does
not record or upload webcam footage.

AI Mock Interview

The interview experience is designed around the candidate rather than a
generic question list.

Questions can incorporate:

Resume
Projects
Target company
Target role
Technical topics
Behavioral topics

The interview session records performance data that can later contribute
to analytics and future preparation recommendations.

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

The objective is to show progress over time, not just a single
score.

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

Frontend - React - Vite - Tailwind CSS - React Router - Recharts -
Framer Motion

Backend - Node.js - Express.js - Sequelize - MySQL - JWT
authentication - bcrypt password hashing - Multer for resume uploads

AI - Google Gemini API

Engineering - REST APIs - Deterministic ATS/scoring services -
Relational persistence - Protected routes - Environment-based secrets -
Jest + Supertest test suite

Database

PrepWise AI uses one database: MySQL.

There is no MongoDB dependency in the current architecture.

The schema is available at:

backend/database/schema.sql

The application also uses Sequelize models and database synchronization
during development.

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

Authentication stores passwords as bcrypt hashes, never plaintext
passwords.

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

The repository's .gitignore excludes environment files, dependencies,
generated uploads, and build output.

For production deployment, secrets should be configured through the
hosting provider's environment-variable / secret settings.

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

The Vite development server will provide the frontend URL shown in your
terminal.

Database Setup

The project includes:

backend/database/schema.sql

For a manual MySQL setup:

mysql -u root -p < backend/database/schema.sql

During development, the backend also initializes the Sequelize database
structure on startup according to the current project configuration.

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

AI-generated text is separated from deterministic scoring so a generated
explanation cannot silently change the underlying score.

Opportunity Data

Opportunity Matcher supports a database-backed job catalog and
Internshala synchronization.

The Internshala integration:

Retrieves current public internship listing information
Stores normalized opportunities in the jobs table
Supports periodic synchronization
Fails softly if the external source changes or blocks automated
requests
Does not submit applications automatically

The candidate always completes the actual application on the external
platform.

Resume Tailoring

Tailored Resume allows a candidate to provide a job description and
generate a role-focused version of the resume.

The generation is constrained to the candidate's existing information:

No invented employers
No invented titles
No invented dates
No invented achievements

The output focuses on reorganizing and rewording existing information
around the target role.

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

Resume Intelligence creates the central persisted resume analysis used
by downstream modules.

Real authentication
JWT-based authentication
Protected API routes
bcrypt password hashing
Protected frontend routes
Real persistence

User progress is stored in MySQL rather than relying only on browser
state.

Score-based progression

Assessment and interview access is controlled by persisted completion
and score state.

Deterministic matching

Opportunity matching is based on structured candidate and job data
rather than random percentages.

Historical analytics

Performance data can be represented as trends and deltas instead of only
storing the latest result.

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

The architecture is intentionally modular so additional companies,
question banks, assessment patterns, AI capabilities, and opportunity
sources can be added without redesigning the entire application.

What This Project Demonstrates

PrepWise AI is more than a UI project. It demonstrates practical
full-stack engineering across:

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

Computer Science Engineering
SRM University

GitHub: https://github.com/Jnana1964
LinkedIn: https://www.linkedin.com/in/jnana-keerthana-1906jk
License

This project is developed as a portfolio / academic project.

j̟̝Ŷ̠̆̒̉W̘̌
l̯̠̬̩Ủ̯̏Y̪̗̍̇̅
Library
/
ai interview
/
README_PrepWise_AI.md
PrepWise AI

An AI-powered career preparation platform that turns a resume into a
personalized, measurable placement journey.

PrepWise AI connects Resume Intelligence → Opportunity Matching →
Skill Building → Mock Assessments → AI Mock Interviews → Performance
Analytics in one platform.

The goal is simple: help a candidate understand where they stand,
identify what is missing, practice deliberately, and measure improvement
over time.

Why PrepWise AI?

Most placement tools solve only one problem: resume checking, job
discovery, coding practice, or mock interviews.

PrepWise AI connects them.

Your resume creates a real candidate profile.
Resume weaknesses become preparation targets.
Skills and role fit drive opportunity matching.
Skill Builder progress controls assessment access.
Assessment performance controls mock-interview access.
Interview weaknesses can guide future practice.
Analytics tracks improvement instead of showing isolated scores.

The platform is designed around real persisted data rather than
hardcoded dashboard numbers or fake activity.

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

Resume preparation and opportunity discovery can happen on demand, while
the preparation pipeline uses score-based gates.

Assessment gates

Stage Requirement

Skill Builder Required practice categories completed
Mock Assessment Skill Builder completion
AI Mock Interview Assessment score ≥ configured threshold
Default threshold 80%

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

AI is used for explanation and generation where appropriate; core
scoring remains separated from AI-generated commentary.

Opportunity Matcher

Matches the candidate against available opportunities using persisted
resume intelligence such as:

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

Apply is an external action. PrepWise AI does not submit
applications on behalf of the candidate. The Apply action opens the real
external posting.

The current opportunity pipeline supports Internshala listings and a
database-backed job catalog.

Applications

A dedicated application tracker records engagement with opportunities:

Saved → Applied → Interview → Offered / Rejected

Users can track application status without PrepWise pretending to submit
applications itself.

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

Coding submissions are evaluated against actual test cases rather than
self-reported results.

Mock Assessment

Mock Assessments are company-specific.

Company selection uses searchable company data, and the assessment
pattern can change according to the selected company's configured style.

The assessment system supports:

Company-specific patterns
Aptitude / coding / balanced / behavioral emphasis
Countdown timer
Automatic submission at timeout
Score calculation
Configurable pass threshold
Assessment history

The webcam feature is a visual proctoring simulation only; it does
not record or upload webcam footage.

AI Mock Interview

The interview experience is designed around the candidate rather than a
generic question list.

Questions can incorporate:

Resume
Projects
Target company
Target role
Technical topics
Behavioral topics

The interview session records performance data that can later contribute
to analytics and future preparation recommendations.

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

The objective is to show progress over time, not just a single
score.

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

Frontend - React - Vite - Tailwind CSS - React Router - Recharts -
Framer Motion

Backend - Node.js - Express.js - Sequelize - MySQL - JWT
authentication - bcrypt password hashing - Multer for resume uploads

AI - Google Gemini API

Engineering - REST APIs - Deterministic ATS/scoring services -
Relational persistence - Protected routes - Environment-based secrets -
Jest + Supertest test suite

Database

PrepWise AI uses one database: MySQL.

There is no MongoDB dependency in the current architecture.

The schema is available at:

backend/database/schema.sql

The application also uses Sequelize models and database synchronization
during development.

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

Authentication stores passwords as bcrypt hashes, never plaintext
passwords.

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

The repository's .gitignore excludes environment files, dependencies,
generated uploads, and build output.

For production deployment, secrets should be configured through the
hosting provider's environment-variable / secret settings.

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

The Vite development server will provide the frontend URL shown in your
terminal.

Database Setup

The project includes:

backend/database/schema.sql

For a manual MySQL setup:

mysql -u root -p < backend/database/schema.sql

During development, the backend also initializes the Sequelize database
structure on startup according to the current project configuration.

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

AI-generated text is separated from deterministic scoring so a generated
explanation cannot silently change the underlying score.

Opportunity Data

Opportunity Matcher supports a database-backed job catalog and
Internshala synchronization.

The Internshala integration:

Retrieves current public internship listing information
Stores normalized opportunities in the jobs table
Supports periodic synchronization
Fails softly if the external source changes or blocks automated
requests
Does not submit applications automatically

The candidate always completes the actual application on the external
platform.

Resume Tailoring

Tailored Resume allows a candidate to provide a job description and
generate a role-focused version of the resume.

The generation is constrained to the candidate's existing information:

No invented employers
No invented titles
No invented dates
No invented achievements

The output focuses on reorganizing and rewording existing information
around the target role.

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

Resume Intelligence creates the central persisted resume analysis used
by downstream modules.

Real authentication
JWT-based authentication
Protected API routes
bcrypt password hashing
Protected frontend routes
Real persistence

User progress is stored in MySQL rather than relying only on browser
state.

Score-based progression

Assessment and interview access is controlled by persisted completion
and score state.

Deterministic matching

Opportunity matching is based on structured candidate and job data
rather than random percentages.

Historical analytics

Performance data can be represented as trends and deltas instead of only
storing the latest result.

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

The architecture is intentionally modular so additional companies,
question banks, assessment patterns, AI capabilities, and opportunity
sources can be added without redesigning the entire application.

What This Project Demonstrates

PrepWise AI is more than a UI project. It demonstrates practical
full-stack engineering across:

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

Computer Science Engineering
SRM University

GitHub: https://github.com/Jnana1964
LinkedIn: https://www.linkedin.com/in/jnana-keerthana-1906jk
License

This project is developed as a portfolio / academic project.
