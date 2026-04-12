import { Router } from 'express';
import * as serviceController from '../../controllers/service.controller.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';

const router = Router();

// Public
router.get('/', serviceController.listServices);
router.get('/:idOrSlug', serviceController.getService);

// Admin
router.post('/', requireAuth, requireAdmin, serviceController.createService);
router.put('/:id', requireAuth, requireAdmin, serviceController.updateService);
router.delete('/:id', requireAuth, requireAdmin, serviceController.deleteService);

export default router;

