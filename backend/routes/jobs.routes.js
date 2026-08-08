import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getMatches, getJobDetail, syncInternshalaJobs } from '../controllers/jobs.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/matches', getMatches);
router.post('/sync-internshala', syncInternshalaJobs);
router.get('/:jobId', getJobDetail);

export default router;
