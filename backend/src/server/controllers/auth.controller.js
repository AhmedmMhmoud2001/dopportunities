import bcrypt from 'bcrypt';
import { prisma } from '../config/db.js';
import { signJwt } from '../utils/jwt.js';

export async function signup(req, res, next) {
	try {
		const { email, password, name } = req.body;
		if (!email || !password) return res.status(400).json({ error: true, message: 'email and password required' });
		const existing = await prisma.user.findUnique({ where: { email } });
		if (existing) return res.status(409).json({ error: true, message: 'Email already in use' });
		const passwordHash = await bcrypt.hash(password, 10);
		const user = await prisma.user.create({
			data: { email, passwordHash, name: name || null }
		});
		const token = signJwt({ sub: user.id, email: user.email, role: user.role });
		res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
	} catch (err) {
		next(err);
	}
}

export async function signin(req, res, next) {
	try {
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ error: true, message: 'email and password required' });
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) return res.status(401).json({ error: true, message: 'Invalid credentials' });
		const ok = await bcrypt.compare(password, user.passwordHash);
		if (!ok) return res.status(401).json({ error: true, message: 'Invalid credentials' });
		const token = signJwt({ sub: user.id, email: user.email, role: user.role });
		res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
	} catch (err) {
		next(err);
	}
}
