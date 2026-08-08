import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { listApplications, createApplication, updateApplication, deleteApplication } from '../controllers/applications.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/', listApplications);
router.post('/', createApplication);
router.patch('/:id', updateApplication);
router.delete('/:id', deleteApplication);

export default router;
