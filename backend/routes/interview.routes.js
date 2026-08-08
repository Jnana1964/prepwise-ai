import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { startInterview, answerQuestion, endInterview, getInterviewHistory } from '../controllers/interview.controller.js';

const router = Router();

router.use(requireAuth);
router.post('/start', startInterview);
router.post('/:sessionId/answer', answerQuestion);
router.post('/:sessionId/end', endInterview);
router.get('/history', getInterviewHistory);

export default router;