import express from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
export default function authRoutes(config) {
  const router = express.Router();
  const controller = authController(config);
  const limit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: { code: 'RATE_LIMITED', message: 'Too many authentication attempts. Try again later.' } } });
  router.post('/register', limit, controller.register);
  router.post('/login', limit, controller.login);
  router.get('/me', authenticate(config), controller.me);
  router.post('/logout', authenticate(config), controller.logout);
  return router;
}
