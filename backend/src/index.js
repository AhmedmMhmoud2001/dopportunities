import dotenv from 'dotenv';
dotenv.config();

import app from './server/app.js';
import { logger } from './server/utils/logger.js';

const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

const server = app.listen(port, () => {
	const baseUrl = `http://${host}:${port}`;
	logger.info(`HTTP server listening on port ${port}`);
	logger.info(`API Base URL: ${baseUrl}/api`);
	logger.info(`Swagger Docs: ${baseUrl}/api/docs`);
});

process.on('unhandledRejection', (reason) => {
	logger.error('Unhandled Rejection', { reason });
});

process.on('uncaughtException', (err) => {
	logger.error('Uncaught Exception', { message: err.message, stack: err.stack });
	server.close(() => process.exit(1));
});
