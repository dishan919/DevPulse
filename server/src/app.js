import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { healthRoutes } from './routes/healthRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import { authenticate, requireWorkspaceMembership, requireRole } from './middleware/auth.js';
export function createApp({ clientUrl = 'http://localhost:5173', connection = mongoose.connection, jwtSecret = process.env.JWT_SECRET, production = false } = {}) {
  const app = express();
  const config = { jwtSecret, production };
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: clientUrl, credentials: true }));
  app.use(rateLimit({ windowMs: 60000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again shortly.' } } }));
  app.use(express.json({ limit: '32kb' }));
  // Browser mutations must originate from the configured UI. No cookie-authenticated cross-origin writes.
  app.use((req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.headers.origin !== clientUrl) return res.status(403).json({ error: { code: 'INVALID_ORIGIN', message: 'Request origin is not allowed.' } });
    next();
  });
  app.use('/api/auth', authRoutes(config));
  app.get('/api/workspaces/:workspaceId', authenticate(config), requireWorkspaceMembership, (req, res) => res.json({ workspace: { id: String(req.membership.workspace._id), name: req.membership.workspace.name, slug: req.membership.workspace.slug, role: req.membership.role } }));
  app.get('/api/workspaces/:workspaceId/access', authenticate(config), requireWorkspaceMembership, requireRole('owner', 'admin'), (req, res) => res.json({ role: req.membership.role }));
  app.use('/api', healthRoutes(connection));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
