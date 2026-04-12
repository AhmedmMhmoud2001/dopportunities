import { prisma } from '../config/db.js';

export async function listServices(_req, res, next) {
	try {
		const services = await prisma.service.findMany({
			where: { isActive: true },
			orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
			select: { id: true, title: true, slug: true, imageUrl: true, sortOrder: true, isActive: true }
		});
		res.json(services);
	} catch (err) { next(err); }
}

export async function getService(req, res, next) {
	try {
		const { idOrSlug } = req.params;
		const where = Number.isNaN(Number(idOrSlug)) ? { slug: idOrSlug } : { id: Number(idOrSlug) };
		const service = await prisma.service.findFirst({ where });
		if (!service) return res.status(404).json({ error: true, message: 'Service not found' });
		res.json(service);
	} catch (err) { next(err); }
}

export async function createService(req, res, next) {
	try {
		const { title, slug, description, imageUrl, sortOrder, isActive } = req.body;
		if (!title || !slug || !description) {
			return res.status(400).json({ error: true, message: 'title, slug, description required' });
		}
		const service = await prisma.service.create({
			data: {
				title,
				slug,
				description,
				imageUrl: imageUrl || null,
				sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
				isActive: typeof isActive === 'boolean' ? isActive : true
			}
		});
		res.status(201).json(service);
	} catch (err) { next(err); }
}

export async function updateService(req, res, next) {
	try {
		const id = Number(req.params.id);
		const { title, slug, description, imageUrl, sortOrder, isActive } = req.body;
		const service = await prisma.service.update({
			where: { id },
			data: {
				title,
				slug,
				description,
				imageUrl,
				sortOrder,
				isActive
			}
		});
		res.json(service);
	} catch (err) { next(err); }
}

export async function deleteService(req, res, next) {
	try {
		const id = Number(req.params.id);
		await prisma.service.delete({ where: { id } });
		res.status(204).send();
	} catch (err) { next(err); }
}

