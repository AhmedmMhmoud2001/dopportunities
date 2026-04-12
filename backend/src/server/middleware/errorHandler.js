export function errorHandler(err, _req, res, _next) {
	const isPrismaUnique = err && err.code === 'P2002';
	const status = isPrismaUnique ? 409 : (err?.status || 500);
	const message = isPrismaUnique ? 'Slug already exists' : (err?.message || 'Internal Server Error');
	const details = err?.details || undefined;
	res.status(status).json({
		error: true,
		message,
		...(details ? { details } : {})
	});
}
