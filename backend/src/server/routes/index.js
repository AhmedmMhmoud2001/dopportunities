import { Router } from 'express';
import healthRouter from './v1/health.routes.js';
import authRouter from './v1/auth.routes.js';
import usersRouter from './v1/users.routes.js';
import pagesRouter from './v1/pages.routes.js';
import blogsRouter from './v1/blogs.routes.js';
import faqsRouter from './v1/faqs.routes.js';
import servicesRouter from './v1/services.routes.js';
import contactsRouter from './v1/contacts.routes.js';
import uploadsRouter from './v1/uploads.routes.js';
import testimonialsRouter from './v1/testimonials.routes.js';
import termsRouter from './v1/terms.routes.js';
import locationsRouter from './v1/locations.routes.js';
import homeFeaturesRouter from './v1/homeFeatures.routes.js';
import homeIntroRouter from './v1/homeIntro.routes.js';
import homeWorkConsultantRouter from './v1/homeWorkConsultant.routes.js';
import footerSocialRouter from './v1/footerSocial.routes.js';

const router = Router();

router.use('/v1/health', healthRouter);
router.use('/v1/auth', authRouter);
router.use('/v1/users', usersRouter);
router.use('/v1/pages', pagesRouter);
router.use('/v1/blogs', blogsRouter);
router.use('/v1/faqs', faqsRouter);
router.use('/v1/services', servicesRouter);
router.use('/v1/contacts', contactsRouter);
router.use('/v1/uploads', uploadsRouter);
router.use('/v1/testimonials', testimonialsRouter);
router.use('/v1/terms', termsRouter);
router.use('/v1/locations', locationsRouter);
router.use('/v1/home-features', homeFeaturesRouter);
router.use('/v1/home-intro', homeIntroRouter);
router.use('/v1/home-work-consultant', homeWorkConsultantRouter);
router.use('/v1/footer-social', footerSocialRouter);

export default router;
