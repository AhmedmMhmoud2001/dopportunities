import { Router } from 'express';
import * as siteBrandingController from '../../controllers/siteBranding.controller.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';

const router = Router();

router.get('/', siteBrandingController.getSiteBranding);
router.put('/', requireAuth, requireAdmin, siteBrandingController.updateSiteBranding);

export default router;
