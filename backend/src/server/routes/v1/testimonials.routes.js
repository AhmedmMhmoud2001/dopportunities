import { Router } from 'express';
import * as testimonialController from '../../controllers/testimonial.controller.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';

const router = Router();

// Public — يجب أن يسبق /:id حتى لا يُفسَّر "section" كمعرّف رقمي
router.get('/section', testimonialController.getTestimonialsSection);
router.get('/', testimonialController.listTestimonials);
router.get('/:id', testimonialController.getTestimonial);

// Admin
router.put('/section', requireAuth, requireAdmin, testimonialController.updateTestimonialsSection);
router.post('/', requireAuth, requireAdmin, testimonialController.createTestimonial);
router.put('/:id', requireAuth, requireAdmin, testimonialController.updateTestimonial);
router.delete('/:id', requireAuth, requireAdmin, testimonialController.deleteTestimonial);

export default router;

