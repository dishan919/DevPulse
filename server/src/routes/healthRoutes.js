import { Router } from 'express';
import { healthController } from '../controllers/healthController.js';
export function healthRoutes(connection) {
  const router = Router();
  const controller = healthController(connection);
  router.get('/health', controller.live);
  router.get('/health/ready', controller.ready);
  return router;
}
