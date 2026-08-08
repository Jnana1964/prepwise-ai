import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { submitAssessment, getLatestAssessment, getEligibility, getAssessmentHistory } from '../controllers/assessment.controller.js';

const router = Router();

router.use(requireAuth);
router.post('/', submitAssessment);
router.get('/latest', getLatestAssessment);
router.get('/eligibility', getEligibility);
router.get('/history', getAssessmentHistory);

export default router;