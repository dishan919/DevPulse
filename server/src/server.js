import User from './models/User.js';
import Workspace from './models/Workspace.js';
import Membership from './models/Membership.js';
import { createApp } from './app.js';
import { readConfig } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
let server;
try {
  const config = readConfig();
  await connectDatabase(config.mongoUri);
  await Promise.all([User.init(), Workspace.init(), Membership.init()]);
  server = createApp(config).listen(config.port, () => console.log(`DevPulse API listening on port ${config.port}`));
} catch (error) {
  console.error(`Startup failed: ${error.message}`);
  await disconnectDatabase();
  process.exitCode = 1;
}
let stopping = false;
async function shutdown() {
  if (stopping) return;
  stopping = true;
  const timer = setTimeout(() => process.exit(1), 10000).unref();
  if (server) await new Promise((resolve) => server.close(resolve));
  await disconnectDatabase();
  clearTimeout(timer);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

