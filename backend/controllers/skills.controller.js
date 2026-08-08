import { SkillProgress, SkillAttempt } from '../models/index.js';
import { QUESTION_BANK } from '../data/skillQuestions.js';
import { recordMetric } from '../services/metrics.js';
import { answerTutorQuestion, feedbackOnOpenAnswer } from '../services/aiTutor.js';

const CATEGORIES = ['mcq', 'coding', 'ai_tutor', 'aptitude', 'hr', 'company'];

const PRACTICE_SET_SIZE = { mcq: 8, aptitude: 8, hr: 5, company: 5 };

export async function getOverview(req, res) {
  const rows = await SkillProgress.findAll({ where: { userId: req.userId } });
  const byCategory = Object.fromEntries(rows.map((r) => [r.category, r]));

  const categories = CATEGORIES.map((key) => {
    const row = byCategory[key];
    const total = QUESTION_BANK[key]?.length || 0;
    const completed = row?.completed || 0;
    return {
      key,
      completed,
      total,
      // Capped at 100 - completed accumulates across every rotation lap
      // forever, so without a cap the bar would overflow past "full".
      progress: total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0,
      // null (not 0) when the user has never submitted anything for this
      // category yet, so the UI can hide the score pill instead of
      // showing a misleading "0%".
      scorePct: row ? Math.round((row.correctRate || 0) * 100) : null
    };
  });

  const allComplete = categories.every((c) => c.total === 0 || c.completed >= c.total);

  res.json({ categories, allComplete });
}

export async function getPractice(req, res) {
  const category = req.params.category;
  if (!CATEGORIES.includes(category)) return res.status(400).json({ message: 'Unknown category' });

  if (category === 'ai_tutor') {
    return res.json({
      questions: [],
      aiEnabled: !!process.env.GEMINI_API_KEY,
      message: process.env.GEMINI_API_KEY
        ? 'Ask the AI tutor anything about your weak topics.'
        : 'AI Tutor requires GEMINI_API_KEY to be set in the backend .env file.'
    });
  }

  const bank = QUESTION_BANK[category] || [];
  const size = PRACTICE_SET_SIZE[category] || bank.length;

  // Rotate through the bank instead of pure-random reshuffling, so a
  // fresh session picks up where the last one left off and no question
  // can come back around until the whole bank has been served once.
  // `completed` (cumulative answers ever submitted for this category) is
  // reused as the rotation offset - no extra DB column needed.
  const progress = await SkillProgress.findOne({ where: { userId: req.userId, category } });
  const offset = bank.length ? (progress?.completed || 0) % bank.length : 0;
  const rotated = bank.length ? [...bank.slice(offset), ...bank.slice(0, offset)] : bank;
  const questions = rotated.slice(0, size);

  res.json({ questions, aiEnabled: !!process.env.GEMINI_API_KEY });
}

export async function submitAnswer(req, res) {
  const { category, correct } = req.body;
  if (!CATEGORIES.includes(category)) return res.status(400).json({ message: 'Unknown category' });
  if (typeof correct !== 'boolean') return res.status(400).json({ message: 'correct (boolean) is required' });

  const [progress] = await SkillProgress.findOrCreate({
    where: { userId: req.userId, category },
    defaults: { userId: req.userId, category, completed: 0, total: 0, correctRate: 0 }
  });

  const newCompleted = progress.completed + 1;
  const correctCount = Math.round(progress.correctRate * progress.completed) + (correct ? 1 : 0);
  progress.completed = newCompleted;
  progress.total = Math.max(progress.total, newCompleted);
  progress.correctRate = newCompleted > 0 ? correctCount / newCompleted : 0;
  progress.lastPracticedAt = new Date();
  await progress.save();

  if (category === 'aptitude') await recordMetric(req.userId, 'aptitude_score', Math.round(progress.correctRate * 100));
  if (category === 'coding') await recordMetric(req.userId, 'coding_score', Math.round(progress.correctRate * 100));

  res.json({ category, completed: progress.completed, correctRate: progress.correctRate });
}

// Wipes Skill Builder progress entirely (not just zeroing it - deleting the
// rows) so getOverview sees no row for any category: progress bars render
// empty, score pills disappear, and getPractice's rotation restarts from
// the very first question in each bank. This is what "Back to Skill
// Builder" after a failed Mock Assessment calls before navigating.
export async function resetProgress(req, res) {
  await SkillProgress.destroy({ where: { userId: req.userId } });
  res.json({ reset: true });
}
// Called once when a Skill Builder session finishes (the summary screen) -
// persists the whole session as a permanent Track Record entry, separate
// from the live SkillProgress counter above.
export async function saveAttempt(req, res) {
  const { category, scorePct, correctCount, totalCount, questionResults } = req.body;
  if (!CATEGORIES.includes(category) || category === 'ai_tutor') {
    return res.status(400).json({ message: 'Unknown or non-gradeable category' });
  }
  if (typeof scorePct !== 'number' || typeof correctCount !== 'number' || typeof totalCount !== 'number') {
    return res.status(400).json({ message: 'scorePct, correctCount, totalCount (numbers) are required' });
  }
  const attempt = await SkillAttempt.create({
    userId: req.userId,
    category,
    scorePct,
    correctCount,
    totalCount,
    questionResults: Array.isArray(questionResults) ? questionResults : []
  });
  res.status(201).json({ id: attempt.id });
}

// Track Record - Skill Builder tab. Returns every past session, newest
// first, each already carrying its full question-by-question breakdown so
// the frontend doesn't need a second detail call.
export async function getSkillHistory(req, res) {
  const attempts = await SkillAttempt.findAll({
    where: { userId: req.userId },
    order: [['createdAt', 'DESC']],
    limit: 100
  });
  res.json({ attempts });
}
export async function askAiTutor(req, res) {
  const { question, topic } = req.body;
  if (!question || !question.trim()) {
    return res.status(400).json({ message: 'question is required' });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ message: 'AI Tutor requires GEMINI_API_KEY to be set in the backend .env file.' });
  }
  try {
    const answer = await answerTutorQuestion({ question, topic });
    res.json({ answer });
  } catch (err) {
    console.error('[ai-tutor]', err.message);
    res.status(502).json({ message: 'AI Tutor is temporarily unavailable. Try again in a moment.' });
  }
}

export async function getAnswerFeedback(req, res) {
  const { prompt, answer } = req.body;
  if (!prompt || !answer || !answer.trim()) {
    return res.status(400).json({ message: 'prompt and answer are required' });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ message: 'AI feedback requires GEMINI_API_KEY to be set in the backend .env file.' });
  }
  try {
    const feedback = await feedbackOnOpenAnswer({ prompt, answer });
    res.json({ feedback });
  } catch (err) {
    console.error('[ai-feedback]', err.message);
    res.status(502).json({ message: 'AI feedback is temporarily unavailable. Try again in a moment.' });
  }
}