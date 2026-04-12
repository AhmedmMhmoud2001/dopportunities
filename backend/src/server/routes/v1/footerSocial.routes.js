import { Router } from 'express';
import * as footerSocialController from '../../controllers/footerSocial.controller.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';

const router = Router();

router.get('/', footerSocialController.getFooterSocial);
router.put('/', requireAuth, requireAdmin, footerSocialController.updateFooterSocial);

export default router;
