import { Router } from 'express';
import * as termsController from '../../controllers/terms.controller.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', termsController.getTerms);

// Admin routes
router.get('/admin', requireAuth, requireAdmin, termsController.getAdminTerms);
router.put('/admin', requireAuth, requireAdmin, termsController.updateTerms);

export default router;