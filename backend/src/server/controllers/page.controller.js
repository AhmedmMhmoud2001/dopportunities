import { prisma } from '../config/db.js';

export async function listPages(_req, res, next) {
	try {
		const pages = await prisma.page.findMany();
		res.json(pages);
	} catch (err) { next(err); }
}

export async function getPage(req, res, next) {
	try {
		const { idOrSlug } = req.params;
		const where = Number.isNaN(Number(idOrSlug)) ? { slug: idOrSlug } : { id: Number(idOrSlug) };
		const page = await prisma.page.findFirst({ where });
		if (!page) return res.status(404).json({ error: true, message: 'Page not found' });
		res.json(page);
	} catch (err) { next(err); }
}

export async function createPage(req, res, next) {
	try {
		const { slug, title, content } = req.body;
		if (!slug || !title) return res.status(400).json({ error: true, message: 'slug and title required' });
		const page = await prisma.page.create({ data: { slug, title, content: content || '' } });
		res.status(201).json(page);
	} catch (err) { next(err); }
}

export async function updatePage(req, res, next) {
	try {
		const id = Number(req.params.id);
		const { slug, title, content } = req.body;
		const page = await prisma.page.update({ where: { id }, data: { slug, title, content } });
		res.json(page);
	} catch (err) { next(err); }
}

export async function deletePage(req, res, next) {
	try {
		const id = Number(req.params.id);
		await prisma.page.delete({ where: { id } });
		res.status(204).send();
	} catch (err) { next(err); }
}
