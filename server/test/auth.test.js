import { before, after, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';
import User from '../src/models/User.js';
import Workspace from '../src/models/Workspace.js';
import Membership from '../src/models/Membership.js';
const secret = 'test-only-secret-with-at-least-32-characters';
const origin = 'http://localhost:5173';
const values = { name: 'John Doe', email: ' John@Example.com ', password: 'SecurePassword123!' };
let mongo;
let app;
before(async () => { mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } }); await mongoose.connect(mongo.getUri()); await Promise.all([User.init(), Workspace.init(), Membership.init()]); app = createApp({ jwtSecret: secret }); });
after(async () => { await mongoose.disconnect(); await mongo?.stop(); });
beforeEach(async () => { await Promise.all([User.deleteMany({}), Workspace.deleteMany({}), Membership.deleteMany({})]); });
const register = () => request(app).post('/api/auth/register').set('Origin', origin).send(values);
test('registration atomically creates safe user, workspace and unique owner membership', async () => {
  const res = await register().expect(201);
  assert.equal(res.body.user.email, 'john@example.com'); assert.equal(res.body.workspaces[0].name, "John's Workspace"); assert.equal(res.body.workspaces[0].role, 'owner');
  assert.ok(!JSON.stringify(res.body).includes('passwordHash'));
  assert.match(res.headers['set-cookie'][0], /HttpOnly/); assert.match(res.headers['set-cookie'][0], /SameSite=Lax/);
  const user = await User.findOne().select('+passwordHash'); assert.notEqual(user.passwordHash, values.password);
  assert.equal((await User.findOne()).passwordHash, undefined);
  await assert.rejects(Membership.create({ user: user._id, workspace: res.body.workspaces[0].id, role: 'admin' }), { code: 11000 });
  await register().expect(409); assert.equal(await Workspace.countDocuments(), 1);
});
test('login, wrong credentials, session restoration, logout and JWT revocation', async () => {
  const registered = await register();
  await request(app).post('/api/auth/login').set('Origin', origin).send({ email: values.email, password: 'wrong' }).expect(401);
  const agent = request.agent(app);
  const login = await agent.post('/api/auth/login').set('Origin', origin).send(values).expect(200);
  assert.equal(login.body.user.id, registered.body.user.id);
  await agent.get('/api/auth/me').expect(200);
  await agent.post('/api/auth/logout').set('Origin', origin).send({}).expect(204);
  await agent.get('/api/auth/me').expect(401);
  await request(app).get('/api/auth/me').set('Cookie', login.headers['set-cookie']).expect(401);
});
test('missing, invalid and expired tokens fail safely', async () => {
  await request(app).get('/api/auth/me').expect(401);
  await request(app).get('/api/auth/me').set('Cookie', 'devpulse_session=invalid').expect(401);
  const res = await register();
  const token = jwt.sign({ version: 0 }, secret, { subject: res.body.user.id, expiresIn: -1, issuer: 'devpulse', audience: 'devpulse-browser' });
  await request(app).get('/api/auth/me').set('Cookie', `devpulse_session=${token}`).expect(401);
});
test('workspace membership, malformed IDs, role restrictions and client role escalation', async () => {
  const res = await register(); const cookie = res.headers['set-cookie']; const id = res.body.workspaces[0].id;
  await request(app).get(`/api/workspaces/${id}`).expect(401);
  await request(app).get(`/api/workspaces/${id}`).set('Cookie', cookie).expect(200);
  await request(app).get('/api/workspaces/invalid').set('Cookie', cookie).expect(400);
  await request(app).get(`/api/workspaces/${new mongoose.Types.ObjectId()}`).set('Cookie', cookie).expect(403);
  await request(app).get(`/api/workspaces/${id}/access`).set('Cookie', cookie).expect(200);
  await Membership.updateOne({ user: res.body.user.id }, { role: 'member' });
  await request(app).get(`/api/workspaces/${id}/access?role=owner`).set('Cookie', cookie).expect(403);
  await request(app).get(`/api/workspaces/${id}`).set('Cookie', cookie).expect(200);
});
test('invalid inputs, untrusted origins and registration rollback', async () => {
  await request(app).post('/api/auth/register').send(values).expect(403);
  for (const body of [null, { ...values, email: {} }, { ...values, password: 'short' }, { ...values, name: '<script>' }]) await request(app).post('/api/auth/register').set('Origin', origin).send(body).expect(400);
  const original = Membership.create;
  Membership.create = async () => { throw new Error('Injected failure'); };
  try { await register().expect(500); } finally { Membership.create = original; }
  assert.equal(await User.countDocuments(), 0); assert.equal(await Workspace.countDocuments(), 0);
});
