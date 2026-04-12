import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

async function verifyConnection() {
	try {
		await prisma.$queryRaw`SELECT 1`;
		logger.info('Prisma connected to MySQL');
	} catch (err) {
		logger.error('Prisma connection error', { message: err.message });
	}
}

verifyConnection();

export { prisma };
