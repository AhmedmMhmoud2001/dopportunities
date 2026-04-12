import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';

function startOfUTCWeekMonday(d) {
	const x = new Date(d.getTime());
	x.setUTCHours(0, 0, 0, 0);
	const day = x.getUTCDay();
	const offset = day === 0 ? -6 : 1 - day;
	x.setUTCDate(x.getUTCDate() + offset);
	return x;
}

function startOfUTCMonth(d) {
	return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
}

function startOfUTCYear(d) {
	return new Date(Date.UTC(d.getUTCFullYear(), 0, 1, 0, 0, 0, 0));
}

function addDaysUTC(d, n) {
	const x = new Date(d.getTime());
	x.setUTCDate(x.getUTCDate() + n);
	return x;
}

function addMonthsUTC(d, n) {
	const x = new Date(d.getTime());
	x.setUTCMonth(x.getUTCMonth() + n);
	return x;
}

function packPeriodStats(current, previous) {
	let changePercent = null;
	if (previous > 0) {
		changePercent = Math.round(((current - previous) / previous) * 1000) / 10;
	} else if (current === 0) {
		changePercent = 0;
	}
	return { current, previous, changePercent };
}

export async function createContactRequest(req, res, next) {
	try {
		const { firstName, secondName, phoneNumber, activity } = req.body;
		if (!firstName || !secondName || !phoneNumber || !activity) {
			return res.status(400).json({ error: true, message: 'firstName, secondName, phoneNumber, activity are required' });
		}
		// Generate unique 6+ digit tracking code
		let trackingCode;
		for (let i = 0; i < 5; i++) {
			const num = Math.floor(100000 + Math.random() * 900000); // 6 digits
			const exists = await prisma.contactRequest.findUnique({ where: { trackingCode: String(num) } });
			if (!exists) { trackingCode = String(num); break; }
		}
		if (!trackingCode) {
			// Fallback to timestamp suffix
			trackingCode = String(Math.floor(Date.now() % 1_000_000)).padStart(6, '0');
		}
		const maybeUserId = req.user?.sub ? Number(req.user.sub) : undefined;
		const contact = await prisma.contactRequest.create({
			data: { trackingCode, userId: maybeUserId, firstName, secondName, phoneNumber, activity }
		});
		logger.info('New contact request submitted', {
			id: contact.id,
			trackingCode: contact.trackingCode,
			phoneNumber: contact.phoneNumber,
			activity: contact.activity
		});
		res.status(201).json(contact);
	} catch (err) { next(err); }
}

export async function getContactNotificationsSummary(req, res, next) {
	try {
		res.set('Cache-Control', 'private, no-store, no-cache, must-revalidate');
		res.set('Pragma', 'no-cache');
		const unreadCount = await prisma.contactRequest.count({ where: { seenByAdminAt: null } });
		const recent = await prisma.contactRequest.findMany({
			where: { seenByAdminAt: null },
			orderBy: { createdAt: 'desc' },
			take: 10,
			select: {
				id: true,
				trackingCode: true,
				firstName: true,
				secondName: true,
				phoneNumber: true,
				activity: true,
				createdAt: true
			}
		});
		res.json({ unreadCount, recent });
	} catch (err) { next(err); }
}

export async function markContactNotificationsSeen(req, res, next) {
	try {
		const ids = req.body?.ids;
		if (Array.isArray(ids) && ids.length > 0) {
			const idNums = ids.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0);
			if (idNums.length) {
				await prisma.contactRequest.updateMany({
					where: { id: { in: idNums } },
					data: { seenByAdminAt: new Date() }
				});
			}
		} else {
			await prisma.contactRequest.updateMany({
				where: { seenByAdminAt: null },
				data: { seenByAdminAt: new Date() }
			});
		}
		res.json({ ok: true });
	} catch (err) { next(err); }
}

/** Aggregates for dashboard overview: contact requests = «الطلبات» (week/month/year vs previous period). */
export async function getContactRequestStats(req, res, next) {
	try {
		const now = new Date();
		const weekStart = startOfUTCWeekMonday(now);
		const prevWeekStart = addDaysUTC(weekStart, -7);
		const monthStart = startOfUTCMonth(now);
		const prevMonthStart = addMonthsUTC(monthStart, -1);
		const yearStart = startOfUTCYear(now);
		const prevYearStart = new Date(Date.UTC(now.getUTCFullYear() - 1, 0, 1, 0, 0, 0, 0));

		const [
			total,
			weekCurrent,
			weekPrevious,
			monthCurrent,
			monthPrevious,
			yearCurrent,
			yearPrevious,
			statusGroups,
		] = await Promise.all([
			prisma.contactRequest.count(),
			prisma.contactRequest.count({
				where: { createdAt: { gte: weekStart, lte: now } },
			}),
			prisma.contactRequest.count({
				where: { createdAt: { gte: prevWeekStart, lt: weekStart } },
			}),
			prisma.contactRequest.count({
				where: { createdAt: { gte: monthStart, lte: now } },
			}),
			prisma.contactRequest.count({
				where: { createdAt: { gte: prevMonthStart, lt: monthStart } },
			}),
			prisma.contactRequest.count({
				where: { createdAt: { gte: yearStart, lte: now } },
			}),
			prisma.contactRequest.count({
				where: { createdAt: { gte: prevYearStart, lt: yearStart } },
			}),
			prisma.contactRequest.groupBy({
				by: ['status'],
				_count: { _all: true },
			}),
		]);

		const byStatus = Object.fromEntries(statusGroups.map((g) => [g.status, g._count._all]));

		res.json({
			total,
			week: packPeriodStats(weekCurrent, weekPrevious),
			month: packPeriodStats(monthCurrent, monthPrevious),
			year: packPeriodStats(yearCurrent, yearPrevious),
			byStatus,
			generatedAt: now.toISOString(),
		});
	} catch (err) {
		next(err);
	}
}

export async function listContactRequests(req, res, next) {
	try {
		const take = Math.min(Number(req.query.limit || 20), 100);
		const skip = Math.max(Number(req.query.offset || 0), 0);
		const items = await prisma.contactRequest.findMany({
			skip,
			take,
			orderBy: { createdAt: 'desc' }
		});
		res.json(items);
	} catch (err) { next(err); }
}

export async function listMyContactRequests(req, res, next) {
	try {
		const userId = req.user?.sub ? Number(req.user.sub) : null;
		if (!userId) return res.status(401).json({ error: true, message: 'Unauthorized' });
		const items = await prisma.contactRequest.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				trackingCode: true,
				status: true,
				activity: true,
				createdAt: true,
				notes: true
			}
		});
		res.json(items);
	} catch (err) { next(err); }
}

export async function getContactRequest(req, res, next) {
	try {
		const id = Number(req.params.id);
		const item = await prisma.contactRequest.findUnique({ where: { id } });
		if (!item) return res.status(404).json({ error: true, message: 'Contact request not found' });
		res.json(item);
	} catch (err) { next(err); }
}

export async function getContactRequestByCode(req, res, next) {
	try {
		const code = String(req.params.code || '').trim();
		if (!code) return res.status(400).json({ error: true, message: 'tracking code required' });
		const item = await prisma.contactRequest.findUnique({ where: { trackingCode: code } });
		if (!item) return res.status(404).json({ error: true, message: 'Contact request not found' });
		res.json(item);
	} catch (err) { next(err); }
}
export async function updateContactRequest(req, res, next) {
	try {
		const id = Number(req.params.id);
		const { firstName, secondName, phoneNumber, activity, status, notes } = req.body;
		const item = await prisma.contactRequest.update({
			where: { id },
			data: { firstName, secondName, phoneNumber, activity, status, notes }
		});
		res.json(item);
	} catch (err) { next(err); }
}

export async function deleteContactRequest(req, res, next) {
	try {
		const id = Number(req.params.id);
		await prisma.contactRequest.delete({ where: { id } });
		res.status(204).send();
	} catch (err) { next(err); }
}
