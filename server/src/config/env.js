import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
dotenv.config({ path: fileURLToPath(new URL('../../../.env', import.meta.url)), quiet: true });
export function readConfig(env = process.env) {
  const port = Number(env.PORT || 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer between 1 and 65535.');
  const clientUrl = env.CLIENT_URL || 'http://localhost:5173';
  let parsedOrigin;
  try { parsedOrigin = new URL(clientUrl); } catch { throw new Error('CLIENT_URL must be an HTTP(S) origin.'); }
  if (!['http:', 'https:'].includes(parsedOrigin.protocol) || parsedOrigin.origin !== clientUrl) throw new Error('CLIENT_URL must be an HTTP(S) origin without a path.');
  if (!env.MONGODB_URI) throw new Error('MONGODB_URI is required. Copy .env.example to .env.');
  const jwtSecret = env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32 || /replace|example|placeholder/i.test(jwtSecret)) throw new Error('JWT_SECRET must be a random secret of at least 32 characters.');
  if (env.NODE_ENV === 'production' && !clientUrl.startsWith('https://')) throw new Error('Production CLIENT_URL must use HTTPS.');
  return { jwtSecret, port, clientUrl, mongoUri: env.MONGODB_URI, production: env.NODE_ENV === 'production' };
}


