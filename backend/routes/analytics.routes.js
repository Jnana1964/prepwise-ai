import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getOverview, getDashboard } from '../controllers/analytics.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/overview', getOverview);
router.get('/dashboard', getDashboard);

export default router;
