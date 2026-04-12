import { Router } from 'express';
import * as userController from '../../controllers/user.controller.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, requireAdmin, userController.listUsers);
router.get('/:id', requireAuth, requireAdmin, userController.getUser);
router.post('/', requireAuth, requireAdmin, userController.createUser);
router.put('/:id', requireAuth, requireAdmin, userController.updateUser);
router.delete('/:id', requireAuth, requireAdmin, userController.deleteUser);

export default router;
