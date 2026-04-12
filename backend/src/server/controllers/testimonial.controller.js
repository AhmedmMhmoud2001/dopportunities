import { prisma } from '../config/db.js';

const DEFAULT_SECTION_TITLE = '# آراء عملائنا';
const DEFAULT_SECTION_DESCRIPTION =
	'لوريم ايبسوم دولار سيت أميت إنفيدونت كويس سيت لامبور نوسترو أيت سيت إنتروليكيشن كونسيكوات. ايبسوم أليكويب أيت كويرات بيريتيتيس. ليجاتوس سيت توب فوليتيات. إيليت، دولار تيت ليجاتوس لابوري لامبور كويرات. ارينتي لابوريس دونك،';

export async function getTestimonialsSection(_req, res, next) {
	try {
		let row = await prisma.testimonialsSection.findFirst();
		if (!row) {
			row = await prisma.testimonialsSection.create({
				data: {
					sectionTitle: DEFAULT_SECTION_TITLE,
					sectionDescription: DEFAULT_SECTION_DESCRIPTION
				}
			});
		}
		res.json({
			sectionTitle: row.sectionTitle,
			sectionDescription: row.sectionDescription
		});
	} catch (err) {
		next(err);
	}
}

export async function updateTestimonialsSection(req, res, next) {
	try {
		const { sectionTitle, sectionDescription } = req.body || {};
		let row = await prisma.testimonialsSection.findFirst();
		if (!row) {
			row = await prisma.testimonialsSection.create({
				data: {
					sectionTitle:
						typeof sectionTitle === 'string' && sectionTitle.trim()
							? sectionTitle.trim()
							: DEFAULT_SECTION_TITLE,
					sectionDescription:
						typeof sectionDescription === 'string' ? sectionDescription : DEFAULT_SECTION_DESCRIPTION
				}
			});
		} else {
			row = await prisma.testimonialsSection.update({
				where: { id: row.id },
				data: {
					...(typeof sectionTitle === 'string'
						? { sectionTitle: sectionTitle.trim() || row.sectionTitle }
						: {}),
					...(typeof sectionDescription === 'string' ? { sectionDescription } : {})
				}
			});
		}
		res.json({
			sectionTitle: row.sectionTitle,
			sectionDescription: row.sectionDescription
		});
	} catch (err) {
		next(err);
	}
}

export async function listTestimonials(_req, res, next) {
	try {
		const testimonials = await prisma.testimonial.findMany({
			where: { isActive: true },
			orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
			select: { id: true, name: true, quote: true, text: true, imageUrl: true, sortOrder: true, isActive: true }
		});
		res.json(testimonials);
	} catch (err) { next(err); }
}

export async function getTestimonial(req, res, next) {
	try {
		const id = Number(req.params.id);
		const item = await prisma.testimonial.findFirst({ where: { id } });
		if (!item) return res.status(404).json({ error: true, message: 'Testimonial not found' });
		res.json(item);
	} catch (err) { next(err); }
}

export async function createTestimonial(req, res, next) {
	try {
		const { name, quote, text, imageUrl, sortOrder, isActive } = req.body;
		if (!name || !text) {
			return res.status(400).json({ error: true, message: 'name and text are required' });
		}
		const item = await prisma.testimonial.create({
			data: {
				name,
				quote: quote || null,
				text,
				imageUrl: imageUrl || null,
				sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
				isActive: typeof isActive === 'boolean' ? isActive : true
			}
		});
		res.status(201).json(item);
	} catch (err) { next(err); }
}

export async function updateTestimonial(req, res, next) {
	try {
		const id = Number(req.params.id);
		const { name, quote, text, imageUrl, sortOrder, isActive } = req.body;
		const item = await prisma.testimonial.update({
			where: { id },
			data: { name, quote, text, imageUrl, sortOrder, isActive }
		});
		res.json(item);
	} catch (err) { next(err); }
}

export async function deleteTestimonial(req, res, next) {
	try {
		const id = Number(req.params.id);
		await prisma.testimonial.delete({ where: { id } });
		res.status(204).send();
	} catch (err) { next(err); }
}

