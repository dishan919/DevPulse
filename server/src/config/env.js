import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
dotenv.config({ path: fileURLToPath(new URL('../../../.env', import.meta.url)), quiet: true });
export function readConfig(env = process.env) {
  const port = Number(env.PORT || 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer between 1 and 65535.');
  const clientUrl = env.CLIENT_URL || 'http://localhost:5173';
  if (!/^https?:\/\//.test(clientUrl)) throw new Error('CLIENT_URL must be an HTTP(S) origin.');
  if (!env.MONGODB_URI) throw new Error('MONGODB_URI is required. Copy .env.example to .env.');
  return { port, clientUrl, mongoUri: env.MONGODB_URI, production: env.NODE_ENV === 'production' };
}
