import { Router } from 'express';
import * as contactFormSettingsController from '../../controllers/contactFormSettings.controller.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';

const router = Router();

router.get('/', contactFormSettingsController.getContactFormSettings);
router.put('/', requireAuth, requireAdmin, contactFormSettingsController.updateContactFormSettings);

export default router;
