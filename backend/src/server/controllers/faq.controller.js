import { prisma } from '../config/db.js';

export async function listFaqs(_req, res, next) {
	try {
		const faqs = await prisma.faq.findMany({
			where: { isActive: true },
			orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }]
		});
		res.json(faqs);
	} catch (err) { next(err); }
}

export async function getFaq(req, res, next) {
	try {
		const id = Number(req.params.id);
		const faq = await prisma.faq.findUnique({ where: { id } });
		if (!faq) return res.status(404).json({ error: true, message: 'FAQ not found' });
		res.json(faq);
	} catch (err) { next(err); }
}

export async function createFaq(req, res, next) {
	try {
		const { question, answer, sortOrder, isActive } = req.body;
		if (!question || !answer) return res.status(400).json({ error: true, message: 'question and answer required' });
		const faq = await prisma.faq.create({
			data: {
				question,
				answer,
				sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
				isActive: typeof isActive === 'boolean' ? isActive : true
			}
		});
		res.status(201).json(faq);
	} catch (err) { next(err); }
}

export async function updateFaq(req, res, next) {
	try {
		const id = Number(req.params.id);
		const { question, answer, sortOrder, isActive } = req.body;
		const faq = await prisma.faq.update({
			where: { id },
			data: {
				question,
				answer,
				sortOrder,
				isActive
			}
		});
		res.json(faq);
	} catch (err) { next(err); }
}

export async function deleteFaq(req, res, next) {
	try {
		const id = Number(req.params.id);
		await prisma.faq.delete({ where: { id } });
		res.status(204).send();
	} catch (err) { next(err); }
}

