import { prisma } from '../config/db.js';

export async function getHealth(_req, res, next) {
	try {
		await prisma.$queryRaw`SELECT 1`;
		res.status(200).json({
			status: 'ok',
			uptime: process.uptime(),
			timestamp: Date.now()
		});
	} catch (err) {
		next({ status: 500, message: 'Database not reachable' });
	}
}
