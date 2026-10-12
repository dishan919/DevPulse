export function notFound(_req, res) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Endpoint not found.' } }); }
export function errorHandler(error, _req, res, _next) {
  const status = error.type === 'entity.parse.failed' ? 400 : error.type === 'entity.too.large' ? 413 : error.status || 500;
  const code = error.type === 'entity.parse.failed' ? 'INVALID_JSON' : error.type === 'entity.too.large' ? 'PAYLOAD_TOO_LARGE' : error.code || 'INTERNAL_ERROR';
  const message = error.type === 'entity.parse.failed' ? 'Request body must be valid JSON.' : error.type === 'entity.too.large' ? 'Request body is too large.' : status < 500 ? error.message : 'An unexpected error occurred.';
  if (status >= 500) console.error(error);
  res.status(status).json({ error: { code: status >= 500 ? 'INTERNAL_ERROR' : code, message } });
}
