import { Router } from 'express';
import * as homeFeaturesController from '../../controllers/homeFeatures.controller.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';

const router = Router();

router.get('/', homeFeaturesController.getHomeFeatures);
router.put('/', requireAuth, requireAdmin, homeFeaturesController.updateHomeFeatures);

export default router;
