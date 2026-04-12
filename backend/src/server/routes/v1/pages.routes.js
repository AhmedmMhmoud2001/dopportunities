import { Router } from 'express';
import * as pageController from '../../controllers/page.controller.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';

const router = Router();

// Public read
router.get('/', pageController.listPages);
router.get('/:idOrSlug', pageController.getPage);

// Admin manage
router.post('/', requireAuth, requireAdmin, pageController.createPage);
router.put('/:id', requireAuth, requireAdmin, pageController.updatePage);
router.delete('/:id', requireAuth, requireAdmin, pageController.deletePage);

export default router;
