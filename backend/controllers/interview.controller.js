import { InterviewSession, InterviewQuestion, ResumeAnalysis, AssessmentAttempt, Company, SkillProgress } from '../models/index.js';
import { HR_QUESTIONS, BEHAVIORAL_QUESTIONS, TECHNICAL_QUESTIONS_BY_COMPANY } from '../data/interviewQuestions.js';
import { scoreAnswer, summarizeSession } from '../services/interviewScoring.js';
import { recordMetric } from '../services/metrics.js';

// Same single threshold as Mock Assessment - see assessment.controller.js.
const PASS_THRESHOLD = Number(process.env.MOCK_ASSESSMENT_PASS_THRESHOLD || 80);

async function buildQuestionSet(userId, company) {
  const analysis = await ResumeAnalysis.findOne({ where: { userId }, order: [['createdAt', 'DESC']] });

  const resumeQuestions = analysis
    ? [{ prompt: `I see you're aiming for a ${analysis.predictedRole} role - walk me through your strongest project.`, type: 'resume' }]
    : [];

  const projectQuestions = (analysis?.projects || []).slice(0, 1).map((p) => ({
    prompt: `Tell me more about "${p.title}" - what was your specific contribution?`,
    type: 'project'
  }));

  const technical = TECHNICAL_QUESTIONS_BY_COMPANY[company] || TECHNICAL_QUESTIONS_BY_COMPANY.TCS;

  return [...resumeQuestions, ...projectQuestions, ...technical, ...BEHAVIORAL_QUESTIONS.slice(0, 1), ...HR_QUESTIONS.slice(0, 1)];
}

export async function startInterview(req, res) {
  const { company = 'TCS', companyId } = req.body;

  const latestAssessment = await AssessmentAttempt.findOne({
    where: { userId: req.userId, companyName: company },
    order: [['createdAt', 'DESC']]
  });
  if (!latestAssessment || latestAssessment.score < PASS_THRESHOLD) {
    return res.status(403).json({
      message: `Score ${PASS_THRESHOLD}%+ on the ${company} Mock Assessment to unlock the AI Mock Interview.`
    });
  }

  let resolvedCompanyId = companyId || null;
  if (!resolvedCompanyId) {
    const match = await Company.findOne({ where: { name: company } });
    resolvedCompanyId = match?.id || null;
  }

  const questionData = await buildQuestionSet(req.userId, company);
  const session = await InterviewSession.create({ userId: req.userId, companyId: resolvedCompanyId, companyName: company });

  const questions = await InterviewQuestion.bulkCreate(
    questionData.map((q, i) => ({ sessionId: session.id, position: i, prompt: q.prompt, type: q.type })),
    { returning: true }
  );

  res.status(201).json({
    sessionId: session.id,
    company,
    question: questions[0].prompt,
    questionIndex: 1,
    totalQuestions: questions.length
  });
}

export async function answerQuestion(req, res) {
  const { answer } = req.body;
  if (!answer || !answer.trim()) return res.status(400).json({ message: 'answer is required' });

  const session = await InterviewSession.findOne({ where: { id: req.params.sessionId, userId: req.userId } });
  if (!session || session.status === 'ended') return res.status(404).json({ message: 'Session not found or already ended' });

  const questions = await InterviewQuestion.findAll({ where: { sessionId: session.id }, order: [['position', 'ASC']] });
  const current = questions[session.currentIndex];
  if (!current) return res.status(400).json({ message: 'No more questions in this session' });

  const feedback = scoreAnswer(answer, current.type);
  current.answer = answer;
  current.communication = feedback.communication;
  current.technical = feedback.technical;
  current.confidence = feedback.confidence;
  await current.save();

  session.currentIndex += 1;
  await session.save();

  const isLastQuestion = session.currentIndex >= questions.length;

  res.json({
    lastFeedback: feedback,
    isLastQuestion,
    question: isLastQuestion ? null : questions[session.currentIndex].prompt,
    questionIndex: session.currentIndex + 1,
    totalQuestions: questions.length
  });
}

export async function endInterview(req, res) {
  const session = await InterviewSession.findOne({ where: { id: req.params.sessionId, userId: req.userId } });
  if (!session) return res.status(404).json({ message: 'Session not found' });

  const questions = await InterviewQuestion.findAll({ where: { sessionId: session.id } });
  const answered = questions.filter((q) => q.answer);
  const summary = summarizeSession(
    answered.map((q) => ({ type: q.type, feedback: { communication: q.communication, technical: q.technical, confidence: q.confidence } }))
  );

  session.status = 'ended';
  session.overallScore = summary.overallScore;
  session.communicationScore = summary.communicationScore;
  session.technicalScore = summary.technicalScore;
  session.confidenceScore = summary.confidenceScore;
  session.behavioralScore = summary.behavioralScore;
  session.weakTopics = summary.weakTopics;
  await session.save();

  await recordMetric(req.userId, 'interview_score', summary.overallScore);

  const topicToCategory = { 'Technical Depth': 'coding', Communication: 'hr', Confidence: 'aptitude' };
  for (const topic of summary.weakTopics) {
    const category = topicToCategory[topic];
    if (!category) continue;
    await SkillProgress.findOrCreate({
      where: { userId: req.userId, category },
      defaults: { userId: req.userId, category, completed: 0, total: 0, correctRate: 0 }
    });
  }

  res.json(summary);
}

// Track Record - AI Mock Interview tab. Only finished sessions (status
// 'ended') show up here - an in-progress session isn't "history" yet.
// Each session's questions come back nested and already in order, so the
// frontend doesn't need a second call per session.
export async function getInterviewHistory(req, res) {
  const sessions = await InterviewSession.findAll({
    where: { userId: req.userId, status: 'ended' },
    order: [['createdAt', 'DESC']],
    include: [{ model: InterviewQuestion, as: 'questions', separate: true, order: [['position', 'ASC']] }],
    limit: 100
  });
  res.json({ sessions });
}