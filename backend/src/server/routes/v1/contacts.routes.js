import { Router } from 'express';
import * as contactController from '../../controllers/contact.controller.js';
import { requireAuth, requireAdmin, optionalAuth } from '../../middleware/auth.js';

const router = Router();

// Public (with optional auth to associate user if available)
router.post('/', optionalAuth, contactController.createContactRequest);
// Must be before /:id — otherwise "my" / "notifications" are treated as ids
router.get('/my', requireAuth, contactController.listMyContactRequests);
router.get('/track/:code', contactController.getContactRequestByCode);
router.get('/notifications/summary', requireAuth, requireAdmin, contactController.getContactNotificationsSummary);
router.post('/notifications/mark-seen', requireAuth, requireAdmin, contactController.markContactNotificationsSeen);
router.get('/stats/overview', requireAuth, requireAdmin, contactController.getContactRequestStats);
router.get('/', requireAuth, requireAdmin, contactController.listContactRequests);
router.get('/:id', contactController.getContactRequest);
router.put('/:id', requireAuth, requireAdmin, contactController.updateContactRequest);
router.delete('/:id', requireAuth, requireAdmin, contactController.deleteContactRequest);

export default router;
