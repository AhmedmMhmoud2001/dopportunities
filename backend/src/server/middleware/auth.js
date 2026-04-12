import { verifyJwt } from '../utils/jwt.js';

export function requireAuth(req, res, next) {
	const header = req.headers.authorization || '';
	const token = header.startsWith('Bearer ') ? header.slice(7) : null;
	if (!token) return res.status(401).json({ error: true, message: 'Unauthorized' });
	try {
		const payload = verifyJwt(token);
		req.user = payload;
		next();
	} catch {
		return res.status(401).json({ error: true, message: 'Invalid token' });
	}
}

export function requireAdmin(req, res, next) {
	if (!req.user || req.user.role !== 'admin') {
		return res.status(403).json({ error: true, message: 'Forbidden' });
	}
	next();
}

// Optional auth: if a valid Bearer token is present, attach req.user; otherwise continue without error.
export function optionalAuth(req, res, next) {
	try {
		const header = req.headers.authorization || '';
		const token = header.startsWith('Bearer ') ? header.slice(7) : null;
		if (token) {
			const payload = verifyJwt(token);
			req.user = payload;
		}
	} catch {
		// ignore invalid token for optional auth
	}
	next();
}