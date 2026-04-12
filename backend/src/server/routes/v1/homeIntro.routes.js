import { Router } from 'express';
import * as homeIntroController from '../../controllers/homeIntro.controller.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';

const router = Router();

router.get('/', homeIntroController.getHomeIntro);
router.put('/', requireAuth, requireAdmin, homeIntroController.updateHomeIntro);

export default router;
