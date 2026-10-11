export function notFound(_req, res) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Endpoint not found.' } }); }
export function errorHandler(error, _req, res, _next) {
  const badJson = error.type === 'entity.parse.failed';
  const tooLarge = error.type === 'entity.too.large';
  if (!badJson && !tooLarge) console.error(error);
  res.status(badJson ? 400 : tooLarge ? 413 : 500).json({ error: { code: badJson ? 'INVALID_JSON' : tooLarge ? 'PAYLOAD_TOO_LARGE' : 'INTERNAL_ERROR', message: badJson ? 'Request body must be valid JSON.' : tooLarge ? 'Request body is too large.' : 'An unexpected error occurred.' } });
}
