import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { healthRoutes } from './routes/healthRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import authRoutes from "./routes/authRoutes.js";
export function createApp({ clientUrl = 'http://localhost:5173', connection = mongoose.connection } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: clientUrl }));
  app.use(rateLimit({ windowMs: 60000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again shortly.' } } }));
  app.use(express.json({ limit: '32kb' }));
  app.use("/api/auth", authRoutes);
  app.use('/api', healthRoutes(connection));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
