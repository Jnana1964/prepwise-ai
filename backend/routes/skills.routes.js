import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  getOverview,
  getPractice,
  submitAnswer,
  resetProgress,
  saveAttempt,
  getSkillHistory,
  askAiTutor,
  getAnswerFeedback
} from '../controllers/skills.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/overview', getOverview);
router.get('/practice/:category', getPractice);
router.post('/attempt/:attemptId/answer', submitAnswer);
router.post('/reset', resetProgress);
router.post('/attempts', saveAttempt);
router.get('/history', getSkillHistory);
router.post('/ai-tutor/ask', askAiTutor);
router.post('/feedback', getAnswerFeedback);

export default router;