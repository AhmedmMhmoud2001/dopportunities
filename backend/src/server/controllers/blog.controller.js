import { prisma } from '../config/db.js';

export async function listBlogs(req, res, next) {
	try {
		const take = Math.min(Number(req.query.limit || 20), 100);
		const skip = Math.max(Number(req.query.offset || 0), 0);
		
		// Get total count and blogs
		const [blogs, total] = await Promise.all([
			prisma.blog.findMany({
				skip,
				take,
				orderBy: { publishedAt: 'desc' }
			}),
			prisma.blog.count()
		]);
		
		res.json(blogs);
	} catch (err) { next(err); }
}

export async function getBlog(req, res, next) {
	try {
		const { idOrSlug } = req.params;
		const where = Number.isNaN(Number(idOrSlug)) ? { slug: idOrSlug } : { id: Number(idOrSlug) };
		const blog = await prisma.blog.findFirst({ where });
		if (!blog) return res.status(404).json({ error: true, message: 'Blog post not found' });
		res.json(blog);
	} catch (err) { next(err); }
}

export async function createBlog(req, res, next) {
	try {
		const { title, author, publishedAt, content, slug, imageUrl } = req.body;
		if (!title || !content || !slug) return res.status(400).json({ error: true, message: 'title, content, slug required' });
		const blog = await prisma.blog.create({
			data: { title, author: author || null, publishedAt: publishedAt ? new Date(publishedAt) : null, content, slug, imageUrl: imageUrl || null }
		});
		res.status(201).json(blog);
	} catch (err) { next(err); }
}

export async function updateBlog(req, res, next) {
	try {
		const id = Number(req.params.id);
		const { title, author, publishedAt, content, slug, imageUrl } = req.body;
		const blog = await prisma.blog.update({
			where: { id },
			data: {
				title,
				author,
				publishedAt: typeof publishedAt !== 'undefined' ? (publishedAt ? new Date(publishedAt) : null) : undefined,
				content,
				slug,
				imageUrl
			}
		});
		res.json(blog);
	} catch (err) { next(err); }
}

export async function deleteBlog(req, res, next) {
	try {
		const id = Number(req.params.id);
		await prisma.blog.delete({ where: { id } });
		res.status(204).send();
	} catch (err) { next(err); }
}
