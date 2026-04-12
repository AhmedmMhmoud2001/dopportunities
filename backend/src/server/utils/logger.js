/* Minimal logger abstraction. Could be replaced by pino/winston later. */
export const logger = {
	info: (msg, meta) => console.log(`[INFO] ${msg}`, meta || ''),
	error: (msg, meta) => console.error(`[ERROR] ${msg}`, meta || '')
};
