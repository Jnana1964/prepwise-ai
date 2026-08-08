import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { uploadResume as uploadMiddleware } from '../middleware/upload.middleware.js';
import {
  uploadResume,
  listResumes,
  getAnalysis,
  improveResume,
  tailorResume,
  generateTailoredResume,
  applySuggestions,
  updateContent,
  getContent
} from '../controllers/resume.controller.js';

const router = Router();

router.use(requireAuth);
router.post('/upload', uploadMiddleware.single('resume'), uploadResume);
router.get('/', listResumes);
router.get('/:resumeId/analysis', getAnalysis);
router.post('/:resumeId/improve', improveResume);
router.post('/:resumeId/tailor', tailorResume);
router.post('/:resumeId/tailor/generate', generateTailoredResume);
router.post('/:resumeId/apply-suggestions', applySuggestions);
router.get('/:resumeId/content', getContent);
router.put('/:resumeId/content', updateContent);

export default router;
