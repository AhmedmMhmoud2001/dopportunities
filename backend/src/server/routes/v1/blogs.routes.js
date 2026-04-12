import { Router } from 'express';
import * as blogController from '../../controllers/blog.controller.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';

const router = Router();

// Public
router.get('/', blogController.listBlogs);
router.get('/:idOrSlug', blogController.getBlog);

// Admin
router.post('/', requireAuth, requireAdmin, blogController.createBlog);
router.put('/:id', requireAuth, requireAdmin, blogController.updateBlog);
router.delete('/:id', requireAuth, requireAdmin, blogController.deleteBlog);

export default router;
