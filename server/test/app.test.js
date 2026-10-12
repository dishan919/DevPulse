import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { readConfig } from '../src/config/env.js';
test('liveness does not pretend the database is ready', async () => {
  const app = createApp({ connection: { readyState: 0 } });
  const live = await request(app).get('/api/health').expect(200);
  assert.equal(live.body.stage, 'foundation');
  const ready = await request(app).get('/api/health/ready').expect(503);
  assert.equal(ready.body.database, 'unavailable');
});
test('readiness reflects a connected database', async () => {
  await request(createApp({ connection: { readyState: 1 } })).get('/api/health/ready').expect(200);
});
test('unknown APIs return safe JSON with security headers', async () => {
  const response = await request(createApp()).get('/api/monitors').expect(404);
  assert.equal(response.body.error.code, 'NOT_FOUND');
  assert.ok(response.headers['x-content-type-options']);
  assert.equal(response.headers['x-powered-by'], undefined);
});
test('malformed JSON is rejected without leaking internals', async () => {
  const response = await request(createApp()).post('/api/health').set('Content-Type', 'application/json').send('{').expect(400);
  assert.equal(response.body.error.code, 'INVALID_JSON');
});
test('CORS uses the configured frontend origin', async () => {
  const response = await request(createApp({ clientUrl: 'https://app.example.com' })).get('/api/health');
  assert.equal(response.headers['access-control-allow-origin'], 'https://app.example.com');
});
test('startup configuration rejects missing database and invalid ports', () => {
  assert.throws(() => readConfig({}), /MONGODB_URI/);
  assert.throws(() => readConfig({ MONGODB_URI: 'mongodb://localhost/test', PORT: '-1' }), /PORT/);
});

test('authentication configuration rejects weak secrets and insecure production origins', () => {
  const base = { MONGODB_URI: 'mongodb://localhost/test' };
  assert.throws(() => readConfig(base), /JWT_SECRET/);
  assert.throws(() => readConfig({ ...base, JWT_SECRET: 'replace-with-placeholder-at-least-32-characters' }), /JWT_SECRET/);
  assert.throws(() => readConfig({ ...base, JWT_SECRET: 'a'.repeat(48), NODE_ENV: 'production' }), /HTTPS/);
});

