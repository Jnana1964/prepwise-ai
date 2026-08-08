import { Op } from 'sequelize';
import { Resume, ResumeAnalysis, Application, AssessmentAttempt, InterviewSession, SkillProgress } from '../models/index.js';
import { getTrend, getDelta, getBlendedTrend } from '../services/metrics.js';
import { resolveNextBestAction } from '../services/nextBestAction.js';
import { timeAgo } from '../services/timeAgo.js';
import { QUESTION_BANK } from '../data/skillQuestions.js';

const PASS_THRESHOLD = Number(process.env.MOCK_ASSESSMENT_PASS_THRESHOLD || 80);
const CATEGORIES = ['mcq', 'coding', 'ai_tutor', 'aptitude', 'hr', 'company'];

function isSkillBuilderComplete(rows) {
  const byCategory = Object.fromEntries(rows.map((r) => [r.category, r]));
  return CATEGORIES.filter((c) => c !== 'ai_tutor').every((key) => {
    const total = QUESTION_BANK[key]?.length || 0;
    const completed = byCategory[key]?.completed || 0;
    return total === 0 || completed >= total;
  });
}

// Performance Analytics is READ-ONLY: it aggregates real history into
// trends + deltas and never writes to any table.
export async function getOverview(req, res) {
  const userId = req.userId;

  const [interviewTrend, codingTrend, aptitudeTrend, atsTrend, overviewTrend] = await Promise.all([
    getTrend(userId, 'interview_score'),
    getTrend(userId, 'coding_score'),
    getTrend(userId, 'aptitude_score'),
    getTrend(userId, 'ats_score'),
    getBlendedTrend(userId, ['interview_score', 'coding_score', 'aptitude_score'])
  ]);

  const [interviewDelta, codingDelta, aptitudeDelta, atsDelta] = await Promise.all([
    getDelta(userId, 'interview_score'),
    getDelta(userId, 'coding_score'),
    getDelta(userId, 'aptitude_score'),
    getDelta(userId, 'ats_score')
  ]);

  const latestAnalysis = await ResumeAnalysis.findOne({ where: { userId }, order: [['createdAt', 'DESC']] });
  const skillRows = await SkillProgress.findAll({ where: { userId } });

  const avgInterviewScore = interviewTrend.length ? interviewTrend[interviewTrend.length - 1].value : 0;
  const codingScore = codingTrend.length ? codingTrend[codingTrend.length - 1].value : 0;
  const aptitudeScore = aptitudeTrend.length ? aptitudeTrend[aptitudeTrend.length - 1].value : 0;

  const weakAreas = (latestAnalysis?.weaknesses || []).slice(0, 3).map((w) => ({ name: w }));
  const strongAreas = (latestAnalysis?.strengths || []).slice(0, 3).map((s) => ({ name: s }));

  res.json({
    avgInterviewScore: Math.round((avgInterviewScore / 10) * 10) / 10,
    avgInterviewScoreDelta: Math.round((interviewDelta / 10) * 10) / 10,
    codingScore,
    codingScoreDelta: codingDelta,
    aptitudeScore,
    aptitudeScoreDelta: aptitudeDelta,
    atsImprovement: atsDelta,
    atsImprovementDelta: atsDelta,
    trend: {
      Overview: overviewTrend,
      'Interview Scores': interviewTrend,
      'Skills Progress': codingTrend,
      'Aptitude Progress': aptitudeTrend
    },
    weakAreas,
    strongAreas,
    skillProgress: skillRows.map((r) => ({ category: r.category, completed: r.completed, total: r.total }))
  });
}

// Career Command Center is READ-ONLY except for the derived Next Best
// Action, which is computed (not stored) on every read from persisted
// module state - it never writes to the database either.
export async function getDashboard(req, res) {
  const userId = req.userId;

  const [resume, latestAnalysis, applications, latestAssessment, latestInterview, skillRows, resumeScoreTrend] = await Promise.all([
    Resume.findOne({ where: { userId }, order: [['createdAt', 'DESC']] }),
    ResumeAnalysis.findOne({ where: { userId }, order: [['createdAt', 'DESC']] }),
    Application.findAll({ where: { userId } }),
    AssessmentAttempt.findOne({ where: { userId }, order: [['createdAt', 'DESC']] }),
    InterviewSession.findOne({ where: { userId, status: 'ended' }, order: [['createdAt', 'DESC']] }),
    SkillProgress.findAll({ where: { userId } }),
    getTrend(userId, 'resume_score', 6)
  ]);

  const skillProgressComplete = isSkillBuilderComplete(skillRows);

  const journey = {
    resume: resume ? 'done' : 'pending',
    analysis: latestAnalysis ? 'done' : resume ? 'active' : 'pending',
    mockTests: latestAssessment?.passed ? 'done' : skillRows.some((r) => r.completed > 0) ? 'active' : 'pending',
    interviewPrep: latestInterview ? 'done' : latestAssessment?.passed ? 'active' : 'pending',
    placement: applications.some((a) => a.status === 'offered') ? 'done' : latestInterview ? 'active' : 'pending'
  };
  const doneCount = Object.values(journey).filter((v) => v === 'done').length;
  const activeBonus = Object.values(journey).includes('active') ? 0.5 : 0;
  const progressPercent = Math.round(((doneCount + activeBonus) / 5) * 100);

  const skillAvg = skillRows.length
    ? skillRows.reduce((s, r) => s + (r.total ? (r.completed / r.total) * 100 : 0), 0) / skillRows.length
    : 0;

  const careerReadiness = Math.round(
    (latestAnalysis?.resumeScore || 0) * 0.35 +
      skillAvg * 0.25 +
      (latestAssessment?.score || 0) * 0.2 +
      (latestInterview?.overallScore || 0) * 10 * 0.2
  );

  const weakestArea = latestAnalysis?.weaknesses?.[0];
  const aiRecommendation = {
    text: weakestArea
      ? `Focus on: ${weakestArea.toLowerCase()}. Improving this will have the biggest impact on your placement readiness.`
      : 'Upload your resume to get a personalized recommendation.',
    ctaLabel: 'View Recommendation'
  };

  const nextStep = resolveNextBestAction({
    hasResume: !!resume,
    latestAnalysis,
    applicationsCount: applications.length,
    skillProgressComplete,
    latestAssessment,
    assessmentThreshold: PASS_THRESHOLD,
    hasInterview: !!latestInterview
  });

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentActivity = [
    resume && { message: 'Resume uploaded', at: resume.createdAt },
    latestAnalysis && { message: 'Resume analyzed', at: latestAnalysis.createdAt },
    latestAssessment && { message: `Mock assessment completed (${latestAssessment.companyName})`, at: latestAssessment.createdAt },
    latestInterview && { message: 'Mock interview completed', at: latestInterview.createdAt }
  ]
    .filter(Boolean)
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 4)
    .map((a) => ({ message: a.message, timeAgo: timeAgo(a.at) }));

  res.json({
    resumeScore: latestAnalysis?.resumeScore ?? null,
    resumeScoreTrend: resumeScoreTrend.map((t) => t.value),
    careerReadiness,
    interviewsPrepared: await InterviewSession.count({ where: { userId } }),
    interviewsPreparedThisWeek: await InterviewSession.count({ where: { userId, createdAt: { [Op.gte]: oneWeekAgo } } }),
    applications: applications.length,
    applicationsThisWeek: applications.filter((a) => new Date(a.createdAt) >= oneWeekAgo).length,
    journey,
    progressPercent,
    aiRecommendation,
    nextStep,
    recentActivity
  });
}
