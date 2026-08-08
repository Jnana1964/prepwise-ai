import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { searchCompanies } from '../controllers/companies.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/search', searchCompanies);

export default router;
