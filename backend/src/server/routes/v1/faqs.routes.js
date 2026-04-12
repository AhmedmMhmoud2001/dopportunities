import { Router } from 'express';
import * as faqController from '../../controllers/faq.controller.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';

const router = Router();

// Public
router.get('/', faqController.listFaqs);
router.get('/:id', faqController.getFaq);

// Admin
router.post('/', requireAuth, requireAdmin, faqController.createFaq);
router.put('/:id', requireAuth, requireAdmin, faqController.updateFaq);
router.delete('/:id', requireAuth, requireAdmin, faqController.deleteFaq);

export default router;

