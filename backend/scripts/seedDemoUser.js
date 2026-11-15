/*
 * seedDemoUser.js — creates (or resets) the demo account.
 *
 * Why this exists: a recruiter who opens the live link and sees an empty
 * dashboard assumes the project does not work. This fills every screen
 * with data so the app can be judged on what it does.
 *
 * Every value here is shaped to match what the real application would
 * produce, not guessed. Specifically:
 *
 *   - `sections`  uses { name, status: 'ok' | 'missing' }, the shape
 *                 services/atsEngine.js emits. The controller recomputes
 *                 sectionsFound by counting status === 'ok'.
 *   - `skills`    uses the exact lowercase SKILL_DICTIONARY tokens the
 *                 engine detects, so services/jobMatcher.js can compare
 *                 them against scraped job requirements.
 *   - Skill totals come from QUESTION_BANK, so "completed / total" can
 *                 never claim more questions than the app contains.
 *   - Interview per-question scores are 1-5 integers (the range
 *                 services/interviewScoring.js produces) and every
 *                 session aggregate is COMPUTED from them with the same
 *                 formulas, so the two can never disagree.
 *   - Assessment `score` is computed as the mean of sectionScores and
 *                 `passed` from PASS_THRESHOLD, exactly as
 *                 controllers/assessment.controller.js does.
 *   - Question history uses real prompts from the app's own question
 *                 bank, in the shapes the history pages render.
 *   - Only 10 metric snapshots per metric, because services/metrics.js
 *                 getTrend() takes the FIRST `limit` rows ascending; with
 *                 more than 10 the charts would show only the oldest.
 *
 * Safe to run repeatedly. Deletes only the demo user's rows.
 *
 * Run:  node scripts/seedDemoUser.js
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import {
  syncDatabase,
  sequelize,
  User,
  Company,
  Resume,
  ResumeAnalysis,
  Application,
  SkillProgress,
  SkillAttempt,
  AssessmentAttempt,
  InterviewSession,
  InterviewQuestion,
  MetricSnapshot
} from '../models/index.js';
import { QUESTION_BANK } from '../data/skillQuestions.js';
import { analyzeResume } from '../services/atsEngine.js';
import { computeMatch } from '../services/jobMatcher.js';

const DEMO_EMAIL = (process.env.DEMO_EMAIL || 'demo@prepwise.ai').toLowerCase();
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'demopass123';
const DEMO_NAME = process.env.DEMO_NAME || 'Demo User';

// Mirrors controllers/assessment.controller.js
const PASS_THRESHOLD = Number(process.env.MOCK_ASSESSMENT_PASS_THRESHOLD || 80);

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(Date.now() - n * DAY);
const round = (n) => Math.round(n);

/* ================================================================== */
/* Resume                                                              */
/* ================================================================== */

const RESUME_TEXT = `ARJUN DEMO
Bengaluru, India | demo@prepwise.ai | +91 90000 00000 | github.com/demo | linkedin.com/in/arjun-demo

EDUCATION
B.Tech, Computer Science and Engineering, 2027
CGPA 8.9 / 10

SKILLS
Languages: Java, Python, JavaScript
Backend: Node.js, Express, Spring Boot, REST APIs, JWT
Databases: MySQL, PostgreSQL, Redis
Tools: Docker, Git, Postman, Linux

PROJECTS
Campus Logistics Tracker - React, Node.js, Express, MySQL
A shipment tracking system for three departments, handling around 400 records a day. It has
role-based access control and an audit trail, and I worked on it over two months.
- Reduced the shipment listing query time from 2.4s to 180ms using composite indexes.
- Added row-level locking so two operators editing the same record cannot lose an update.

Expense Splitter API - Java, Spring Boot, PostgreSQL
A REST service for splitting group expenses, with JWT authentication and a settlement routine
that works out the smallest number of transfers needed to clear a balance. Covered by 42 unit
and integration tests at 85% line coverage.

EXPERIENCE
Web Development Intern, Northline Systems (3 months)
Worked on internal tools for the operations team. Responsibilities included React screens,
bug fixing, and writing API tests in Postman.
- Built six internal admin screens in React, used daily by a 12-person team.

ACHIEVEMENTS
- Finalist, inter-college hackathon, placing in the top 8 of 140 teams.
300+ problems solved on LeetCode, current rating 1750.`;

const JOB_DESCRIPTION =
  'Software Engineer I — build and maintain backend services in Java or Node.js, design REST APIs, ' +
  'work with SQL databases, write unit and integration tests, and ship to production through CI/CD.';

/* ================================================================== */
/* Applications — covers all 7 statuses in the model ENUM              */
/* ================================================================== */

const APPLICATIONS = [
  // company, role, status, days ago, notes, requiredSkills
  // matchPercent is NOT written here — it is computed by the app's own
  // services/jobMatcher.js computeMatch() against the real analysis.
  ['Rippling',   'Software Engineer I',         'offered',            5, 'Offer received. 10 days to respond.',
    ['javascript', 'react', 'node.js', 'sql', 'rest api', 'git', 'docker']],
  ['Zoho',       'Member Technical Staff',      'hr',                 8, 'HR round scheduled for next week.',
    ['java', 'sql', 'mysql', 'rest api', 'git', 'data structures']],
  ['Freshworks', 'Associate Software Engineer', 'interview',         11, 'Cleared round 1. Round 2 is system design.',
    ['javascript', 'react', 'node.js', 'mysql', 'rest api', 'git']],
  ['PhonePe',    'SDE-1',                       'interview',         14, 'Technical round done, awaiting feedback.',
    ['java', 'spring', 'sql', 'redis', 'docker', 'system design']],
  ['Razorpay',   'Backend Engineer Intern',     'online_assessment', 17, 'Assessment link expires Friday.',
    ['node.js', 'express', 'mysql', 'rest api', 'git', 'redis']],
  ['Postman',    'Software Engineer Intern',    'online_assessment', 20, '',
    ['javascript', 'node.js', 'rest api', 'git', 'testing']],
  ['Zepto',      'SDE Intern',                  'applied',           23, '',
    ['java', 'python', 'data structures', 'algorithms', 'sql']],
  ['Atlassian',  'Software Engineer Intern',    'applied',           26, '',
    ['java', 'react', 'rest api', 'git', 'testing', 'algorithms']],
  ['Hevo Data',  'Associate SDE',               'applied',           29, '',
    ['python', 'sql', 'docker', 'rest api', 'git']],
  ['Groww',      'Backend Intern',              'applied',           32, '',
    ['java', 'spring', 'mysql', 'rest api', 'git']],
  ['Swiggy',     'SDE Intern',                  'rejected',          36, 'Rejected after OA. Weak on dynamic programming.',
    ['java', 'algorithms', 'data structures', 'system design', 'kubernetes']],
  ['Uber',       'Software Engineer I',         'rejected',          40, 'No response after 3 weeks; marked closed.',
    ['go', 'kubernetes', 'system design', 'algorithms', 'docker']],
  ['Flipkart',   'SDE Intern',                  'saved',              2, 'Applications open until month end.',
    ['java', 'python', 'algorithms', 'data structures', 'sql', 'git']],
  ['Zomato',     'Backend Engineer Intern',     'saved',              1, '',
    ['node.js', 'express', 'mongodb', 'rest api', 'git']]
];

/* ================================================================== */
/* Skill Builder — totals come from the app's own question bank        */
/* ================================================================== */

const SKILL_CATEGORIES = [
  // category, final correctRate, days since last practised
  ['mcq',      0.81, 2],
  ['coding',   0.67, 4],
  ['aptitude', 0.75, 3],
  ['hr',       0.80, 6],
  ['company',  0.70, 9]
];

/* ================================================================== */
/* Mock interviews — per-question scores are 1-5, as the scorer emits  */
/* ================================================================== */

const INTERVIEWS = [
  {
    company: 'Flipkart',
    day: 4,
    qs: [
      ['hr',         'Walk me through your resume in two minutes.',
                     'Covered my degree, the two projects and the internship, then what I want to build next.', 4, 3, 4],
      ['technical',  'How would you design a URL shortener that handles 10,000 requests per second?',
                     'Hash-based key generation, Redis in front of the database for reads, and read replicas behind it.', 4, 4, 4],
      ['project',    'In your logistics tracker, how did you handle two people updating a shipment at once?',
                     'Row-level locking on the shipment record, plus an append-only audit table so no update is silently lost.', 4, 4, 4],
      ['coding',     'Find the first non-repeating character in a string.',
                     'Two passes with a frequency map. O(n) time, and O(1) space for a fixed alphabet.', 4, 5, 4],
      ['behavioral', 'Tell me about a time something you built failed.',
                     'I shipped a feature without load testing and it fell over at 200 users. I added k6 tests after that.', 5, 4, 4]
    ]
  },
  {
    company: 'PhonePe',
    day: 11,
    qs: [
      ['technical', 'What is the difference between a clustered and a non-clustered index?',
                    'A clustered index decides the physical row order. A non-clustered one is separate and points at rows.', 3, 3, 3],
      ['coding',    'Detect a cycle in a linked list.',
                    "Floyd's tortoise and hare. O(n) time, O(1) space.", 3, 3, 4],
      ['technical', 'How would you stop a payment being charged twice?',
                    'An idempotency key stored with the request, and reject duplicates inside the same transaction.', 3, 2, 3],
      ['hr',        'Why do you want to work here?',
                    'The scale of payments traffic, and the systems problems that come with it.', 4, 3, 3]
    ]
  },
  {
    company: 'Swiggy',
    day: 21,
    qs: [
      ['technical', 'Design the database schema for a subscription billing system.',
                    'Plans, subscriptions, invoices and payment attempts as four tables.', 2, 2, 3],
      ['coding',    'Merge two sorted arrays in place.',
                    'Fill from the back so nothing gets overwritten. O(m+n).', 3, 3, 3],
      ['resume',    'Your resume says 85% test coverage. What was not covered?',
                    'The error paths in the settlement logic. I added those later.', 3, 2, 2]
    ]
  }
];

/**
 * Same maths as services/interviewScoring.js summarizeSession(), so a
 * stored session row can never disagree with its own questions.
 */
function summarize(qs) {
  const avg = (i) => qs.reduce((s, q) => s + q[3 + i], 0) / qs.length;
  const communication = avg(0);
  const technical = avg(1);
  const confidence = avg(2);

  const behaviouralQs = qs.filter((q) => q[0] === 'behavioral');
  const behavioral = behaviouralQs.length
    ? behaviouralQs.reduce((s, q) => s + q[3], 0) / behaviouralQs.length
    : 0;

  const weakTopics = [];
  if (technical < 3) weakTopics.push('Technical Depth');
  if (communication < 3) weakTopics.push('Communication');
  if (confidence < 3) weakTopics.push('Confidence');

  // NOTE: assumes the one-line fix in services/interviewScoring.js.
  // The shipped formula is Math.round(avg * 2) / 2, which returns 1-5
  // even though its own comment says "out of 10" and careerReadiness in
  // analytics.controller.js multiplies it by 10. Mapping 1-5 onto 2-10
  // in half-point steps is Math.round(avg * 4) / 2. Apply that fix and
  // this seeder together, or neither.
  return {
    overallScore: Math.round(((communication + technical + confidence) / 3) * 4) / 2,
    communicationScore: round(communication * 20),
    technicalScore: round(technical * 20),
    confidenceScore: round(confidence * 20),
    behavioralScore: round((behavioral || communication) * 20),
    weakTopics
  };
}

/* ================================================================== */
/* Mock assessments — score is the mean of sectionScores               */
/* ================================================================== */

const ASSESSMENTS = [
  // company, sectionScores, days ago   (most recent first => improving)
  ['Flipkart', { aptitude: 90, technical: 84, verbal: 86 },  6],
  ['Amazon',   { aptitude: 88, technical: 80, verbal: 84 }, 13],
  ['PhonePe',  { aptitude: 82, technical: 74, verbal: 80 }, 19],
  ['Swiggy',   { aptitude: 74, technical: 66, verbal: 72 }, 28],
  ['TCS',      { aptitude: 66, technical: 56, verbal: 64 }, 42]
];

/* ================================================================== */
/* Question history built from the app's real question bank            */
/* ================================================================== */

function pick(bank, n, offset = 0) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(bank[(offset + i) % bank.length]);
  return out;
}

function buildSkillResults(category, correctCount, totalCount, offset) {
  const bank = QUESTION_BANK[category] || [];
  if (!bank.length) return [];
  return pick(bank, totalCount, offset).map((q, i) => {
    const correct = i < correctCount;
    if (Array.isArray(q.options)) {
      return {
        questionId: q.id, prompt: q.prompt, answered: true, correct,
        given: correct ? q.correctIndex : (q.correctIndex + 1) % q.options.length,
        correctAnswer: q.correctIndex
      };
    }
    if (q.functionName) {
      return {
        questionId: q.id, prompt: q.prompt, answered: true, correct,
        testsPassed: correct ? 5 : 3, testsTotal: 5
      };
    }
    return {
      questionId: q.id, prompt: q.prompt, answered: true,
      answer: 'Answered in the practice session, then reviewed against the model answer.'
    };
  });
}

function buildAssessmentResults(correctCount, totalCount) {
  const half = Math.ceil(totalCount / 2);
  const mix = [
    ...pick(QUESTION_BANK.aptitude, half, 3).map((q) => ({ q, section: 'aptitude' })),
    ...pick(QUESTION_BANK.mcq, totalCount - half, 5).map((q) => ({ q, section: 'technical' }))
  ];
  return mix.map(({ q, section }, i) => {
    const correct = i < correctCount;
    return {
      questionId: q.id, prompt: q.prompt, section, answered: true, correct,
      given: correct ? q.correctIndex : (q.correctIndex + 1) % (q.options?.length || 4),
      correctAnswer: q.correctIndex
    };
  });
}

/* ================================================================== */

async function wipeDemoData(userId) {
  const sessions = await InterviewSession.findAll({ where: { userId }, attributes: ['id'] });
  const sessionIds = sessions.map((s) => s.id);
  if (sessionIds.length) await InterviewQuestion.destroy({ where: { sessionId: sessionIds } });

  await Promise.all([
    InterviewSession.destroy({ where: { userId } }),
    ResumeAnalysis.destroy({ where: { userId } }),
    Resume.destroy({ where: { userId } }),
    Application.destroy({ where: { userId } }),
    SkillProgress.destroy({ where: { userId } }),
    SkillAttempt.destroy({ where: { userId } }),
    AssessmentAttempt.destroy({ where: { userId } }),
    MetricSnapshot.destroy({ where: { userId } })
  ]);
}

async function companyIdFor(name) {
  try {
    const row = await Company.findOne({ where: { name } });
    return row ? row.id : null;
  } catch {
    return null;
  }
}

async function run() {
  await connectDB();
  await syncDatabase();

  /* 1. user -------------------------------------------------------- */
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  let user = await User.findOne({ where: { email: DEMO_EMAIL } });
  if (user) {
    await user.update({ name: DEMO_NAME, passwordHash, plan: 'pro', unreadNotifications: 2 });
    await wipeDemoData(user.id);
    console.log(`Reset existing demo user #${user.id}`);
  } else {
    user = await User.create({
      name: DEMO_NAME, email: DEMO_EMAIL, passwordHash, plan: 'pro', unreadNotifications: 2
    });
    console.log(`Created demo user #${user.id}`);
  }
  const userId = user.id;

  /* 2. resume + analysis -------------------------------------------
     The analysis is NOT written by hand. We run the application's own
     services/atsEngine.js over the demo resume and store exactly what it
     returns, the same way controllers/resume.controller.js does on a real
     upload. Whatever the engine scores this resume is what the demo shows. */
  const resume = await Resume.create({
    userId,
    filename: 'Arjun_Demo_SDE_Resume.pdf',
    storagePath: 'demo/Arjun_Demo_SDE_Resume.pdf',
    rawText: RESUME_TEXT,
    jobDescription: JOB_DESCRIPTION,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(6)
  });

  const engineResult = analyzeResume({ rawText: RESUME_TEXT, jobDescription: JOB_DESCRIPTION });
  // sectionsFound / totalSections are derived at read time and have no
  // columns, exactly as omitDerivedFields() in resume.controller.js strips.
  const { sectionsFound, totalSections, ...persistable } = engineResult;

  const analysis = await ResumeAnalysis.create({
    userId,
    resumeId: resume.id,
    ...persistable,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(6)
  });

  /* 3. applications ---------------------------------------------------
     matchPercent comes from services/jobMatcher.js computeMatch(), scored
     against the analysis above, so the number on every card is what the
     app itself would calculate for that role. */
  for (const [company, role, status, day, notes, requiredSkills] of APPLICATIONS) {
    const { matchPercent } = computeMatch({ requiredSkills }, analysis);
    await Application.create({
      userId, company, role, matchPercent, status, notes,
      appliedOn: daysAgo(day),
      createdAt: daysAgo(day),
      updatedAt: daysAgo(Math.max(1, day - 3))
    });
  }

  /* 4. skill progress + practice attempts ---------------------------- */
  let attemptOffset = 0;
  let attemptDay = 58;
  for (const [category, correctRate, lastDay] of SKILL_CATEGORIES) {
    const total = QUESTION_BANK[category]?.length || 0;

    await SkillProgress.create({
      userId, category, completed: total, total, correctRate,
      lastPracticedAt: daysAgo(lastDay),
      createdAt: daysAgo(60), updatedAt: daysAgo(lastDay)
    });

    const setSize = category === 'coding' ? 3 : (category === 'mcq' || category === 'aptitude') ? 8 : 5;
    for (const rate of [0.50, 0.62, 0.75, correctRate]) {
      const correctCount = Math.round(rate * setSize);
      await SkillAttempt.create({
        userId,
        category,
        scorePct: Math.round((correctCount / setSize) * 100),
        correctCount,
        totalCount: setSize,
        questionResults: buildSkillResults(category, correctCount, setSize, attemptOffset),
        createdAt: daysAgo(attemptDay),
        updatedAt: daysAgo(attemptDay)
      });
      attemptOffset += setSize;
      attemptDay -= 3;
    }
  }

  /* 5. mock assessments ---------------------------------------------- */
  for (const [companyName, sectionScores, day] of ASSESSMENTS) {
    const values = Object.values(sectionScores);
    const score = round(values.reduce((a, b) => a + b, 0) / values.length);
    const totalCount = 16;
    const correctCount = Math.round((score / 100) * totalCount);
    await AssessmentAttempt.create({
      userId,
      companyId: await companyIdFor(companyName),
      companyName,
      score,
      passThreshold: PASS_THRESHOLD,
      passed: score >= PASS_THRESHOLD,
      sectionScores,
      questionResults: buildAssessmentResults(correctCount, totalCount),
      createdAt: daysAgo(day), updatedAt: daysAgo(day)
    });
  }

  /* 6. mock interviews ------------------------------------------------ */
  const mostRecentDay = Math.min(...INTERVIEWS.map((x) => x.day));
  let latestInterviewScore = 0;
  for (const iv of INTERVIEWS) {
    const s = summarize(iv.qs);
    if (iv.day === mostRecentDay) latestInterviewScore = s.overallScore * 10;

    const session = await InterviewSession.create({
      userId,
      companyId: await companyIdFor(iv.company),
      companyName: iv.company,
      currentIndex: iv.qs.length,
      status: 'ended',
      overallScore: s.overallScore,
      confidenceScore: s.confidenceScore,
      communicationScore: s.communicationScore,
      technicalScore: s.technicalScore,
      behavioralScore: s.behavioralScore,
      weakTopics: s.weakTopics,
      createdAt: daysAgo(iv.day), updatedAt: daysAgo(iv.day)
    });

    let position = 0;
    for (const [type, prompt, answer, communication, technical, confidence] of iv.qs) {
      await InterviewQuestion.create({
        sessionId: session.id, position: position++, prompt, type, answer,
        communication, technical, confidence,
        createdAt: daysAgo(iv.day), updatedAt: daysAgo(iv.day)
      });
    }
  }

  /* 7. metric snapshots ----------------------------------------------- */
  const POINTS = 10;
  const series = [
    ['ats_score',          Math.max(20, analysis.atsScore - 20),    analysis.atsScore],
    ['resume_score',       Math.max(20, analysis.resumeScore - 20), analysis.resumeScore],
    ['interview_score',    50, latestInterviewScore],
    ['coding_score',       44, 67],
    ['aptitude_score',     58, 75],
    ['applications_count',  1, APPLICATIONS.length]
  ];
  const rows = [];
  for (const [metric, from, to] of series) {
    for (let i = 0; i < POINTS; i++) {
      const t = i / (POINTS - 1);
      const when = daysAgo(60 - i * 6);
      rows.push({
        userId, metric, value: round(from + (to - from) * t),
        recordedAt: when, createdAt: when, updatedAt: when
      });
    }
  }
  await MetricSnapshot.bulkCreate(rows);

  /* -------------------------------------------------------------------- */
  const passedCount = ASSESSMENTS.filter(([, s]) => {
    const v = Object.values(s);
    return v.reduce((a, b) => a + b, 0) / v.length >= PASS_THRESHOLD;
  }).length;

  console.log(`
Demo account ready
  email:    ${DEMO_EMAIL}
  password: ${DEMO_PASSWORD}

  Resume            ATS ${analysis.atsScore}, resume ${analysis.resumeScore}, recruiter ${analysis.recruiterScore}, quality ${analysis.resumeQuality}, JD match ${analysis.jdMatch}\n  Engine output     ${sectionsFound}/${totalSections} sections, ${analysis.skills.length} skills, role: ${analysis.predictedRole}
  Applications      ${APPLICATIONS.length}, covering all 7 pipeline stages
  Skill Builder     ${SKILL_CATEGORIES.length} categories complete, ${SKILL_CATEGORIES.length * 4} practice attempts
  Assessments       ${ASSESSMENTS.length} (${passedCount} passed at threshold ${PASS_THRESHOLD})
  Mock interviews   ${INTERVIEWS.length}, latest overall ${latestInterviewScore / 10}/10
  Metrics           ${rows.length} snapshots across ${series.length} metrics
`);
  await sequelize.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});