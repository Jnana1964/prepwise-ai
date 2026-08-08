import { AssessmentAttempt, Company, SkillProgress } from '../models/index.js';
import { QUESTION_BANK } from '../data/skillQuestions.js';

const PASS_THRESHOLD = Number(process.env.MOCK_ASSESSMENT_PASS_THRESHOLD || 80);

const CATEGORIES = ['mcq', 'coding', 'ai_tutor', 'aptitude', 'hr', 'company'];

async function isSkillBuilderComplete(userId) {
  const rows = await SkillProgress.findAll({ where: { userId } });
  const byCategory = Object.fromEntries(rows.map((r) => [r.category, r]));
  return CATEGORIES.filter((c) => c !== 'ai_tutor').every((key) => {
    const total = QUESTION_BANK[key]?.length || 0;
    const completed = byCategory[key]?.completed || 0;
    return total === 0 || completed >= total;
  });
}

export async function getEligibility(req, res) {
  const skillBuilderComplete = await isSkillBuilderComplete(req.userId);
  res.json({ skillBuilderComplete, passThreshold: PASS_THRESHOLD });
}

export async function submitAssessment(req, res) {
  const { company, companyId, sectionScores, questionResults } = req.body;
  if (!company || !sectionScores) return res.status(400).json({ message: 'company and sectionScores are required' });

  const skillBuilderComplete = await isSkillBuilderComplete(req.userId);
  if (!skillBuilderComplete) {
    return res.status(403).json({
      message: 'Complete every Skill Builder category before taking a Mock Assessment.'
    });
  }

  let resolvedCompanyId = companyId || null;
  if (!resolvedCompanyId) {
    const match = await Company.findOne({ where: { name: company } });
    resolvedCompanyId = match?.id || null;
  }

  const values = Object.values(sectionScores).filter((v) => typeof v === 'number');
  const score = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  const passed = score >= PASS_THRESHOLD;

  const attempt = await AssessmentAttempt.create({
    userId: req.userId,
    companyId: resolvedCompanyId,
    companyName: company,
    score,
    passThreshold: PASS_THRESHOLD,
    passed,
    sectionScores,
    questionResults: Array.isArray(questionResults) ? questionResults : []
  });

  res.status(201).json({ id: attempt.id, score, passed, passThreshold: PASS_THRESHOLD });
}

export async function getLatestAssessment(req, res) {
  const { company } = req.query;
  const where = { userId: req.userId, ...(company ? { companyName: company } : {}) };
  const attempt = await AssessmentAttempt.findOne({ where, order: [['createdAt', 'DESC']] });
  res.json({ attempt, passThreshold: PASS_THRESHOLD });
}

// Track Record - Mock Assessment tab.
export async function getAssessmentHistory(req, res) {
  const attempts = await AssessmentAttempt.findAll({
    where: { userId: req.userId },
    order: [['createdAt', 'DESC']],
    limit: 100
  });
  res.json({ attempts });
}