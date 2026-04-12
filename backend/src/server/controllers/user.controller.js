import { prisma } from '../config/db.js';
import bcrypt from 'bcrypt';

export async function listUsers(_req, res, next) {
	try {
		const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, createdAt: true } });
		res.json(users);
	} catch (err) { next(err); }
}

export async function getUser(req, res, next) {
	try {
		const id = Number(req.params.id);
		const user = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, name: true, role: true, createdAt: true } });
		if (!user) return res.status(404).json({ error: true, message: 'User not found' });
		res.json(user);
	} catch (err) { next(err); }
}

export async function createUser(req, res, next) {
	try {
		const { email, password, name, role } = req.body;
		if (!email || !password) return res.status(400).json({ error: true, message: 'email and password required' });
		const passwordHash = await bcrypt.hash(password, 10);
		const user = await prisma.user.create({ data: { email, passwordHash, name: name || null, role: role || 'user' } });
		res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
	} catch (err) { next(err); }
}

export async function updateUser(req, res, next) {
	try {
		const id = Number(req.params.id);
		const { email, password, name, role } = req.body;
		const data = {};
		if (email) data.email = email;
		if (typeof name !== 'undefined') data.name = name;
		if (role) data.role = role;
		if (password) data.passwordHash = await bcrypt.hash(password, 10);
		const user = await prisma.user.update({ where: { id }, data, select: { id: true, email: true, name: true, role: true } });
		res.json(user);
	} catch (err) { next(err); }
}

export async function deleteUser(req, res, next) {
	try {
		const id = Number(req.params.id);
		await prisma.user.delete({ where: { id } });
		res.status(204).send();
	} catch (err) { next(err); }
}
