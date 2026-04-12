import { Router } from 'express';
import * as locationController from '../../controllers/location.controller.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';

const router = Router();

router.get('/', locationController.getLocations);
router.put('/', requireAuth, requireAdmin, locationController.updateLocations);

export default router;