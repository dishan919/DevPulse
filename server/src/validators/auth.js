export function fail(status, code, message) { return Object.assign(new Error(message), { status, code }); }
export function validateAuth(body, registration = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw fail(400, 'VALIDATION_ERROR', 'Provide valid account details.');
  const { name, email, password } = body;
  if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw fail(400, 'VALIDATION_ERROR', 'Enter a valid email address.');
  if (typeof password !== 'string' || !password || Buffer.byteLength(password) > 72) throw fail(400, 'VALIDATION_ERROR', 'Password must contain 1–72 bytes.');
  if (registration && (password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password))) throw fail(400, 'VALIDATION_ERROR', 'Use at least 12 characters with uppercase, lowercase and a number.');
  if (registration && (typeof name !== 'string' || !name.trim() || name.trim().length > 100 || (/[<>]/.test(name) || [...name].some(char => char.charCodeAt(0) < 32)))) throw fail(400, 'VALIDATION_ERROR', 'Enter a name of 1–100 characters without markup.');
  return { name: registration ? name.trim() : undefined, email: email.trim().toLowerCase(), password };
}

