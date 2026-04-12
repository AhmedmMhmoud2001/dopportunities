import { Router } from 'express';
import * as controller from '../../controllers/homeWorkConsultant.controller.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';

const router = Router();

router.get('/', controller.getHomeWorkConsultant);
router.put('/', requireAuth, requireAdmin, controller.updateHomeWorkConsultant);

export default router;
