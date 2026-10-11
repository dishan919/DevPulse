import { getReadiness } from '../services/healthService.js';
export function healthController(connection) {
  return {
    live: (_req, res) => res.json({ status: 'ok', service: 'devpulse-api', stage: 'foundation' }),
    ready: (_req, res) => { const state = getReadiness(connection); res.status(state.ready ? 200 : 503).json(state); },
  };
}
