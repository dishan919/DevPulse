# DevPulse

Distributed API Monitoring & Incident Management Platform. A university and portfolio project for understanding service availability, detecting outages, and coordinating recovery.

## Current stage: architecture foundation

Implemented: a responsive React landing page and workspace shell, light/dark theme persistence, dashboard empty states, live API readiness checks with retry, and an Express API with MongoDB connectivity. Landing-page artwork is explicitly illustrative; application statistics are unavailable until real monitoring data exists.

**This stage is not a production monitoring system.** Authentication, workspace membership, monitor CRUD, endpoint checks, incidents, analytics, notifications, and public status pages are not implemented. The preview workspace contains no private data and is not protected yet. Feature routes explain their implementation status instead of offering fake actions. The worker entry point exits explicitly because checks are not running.

## Architecture

```mermaid
flowchart LR
  React[React / Vite] -->|REST — implemented health API| API[Express API]
  API --> Mongo[MongoDB]
  API -. planned .-> Redis[Redis / BullMQ]
  Redis -. planned .-> Worker[Separate monitoring worker]
  Worker -. safe HTTP checks — planned .-> Endpoints[External APIs]
  Worker -. persisted results — planned .-> Mongo
  API -. authorized Socket.IO — planned .-> React
```

## Stack and structure

JavaScript, React, Vite, React Router, Recharts, Express, Mongoose, Helmet, ESLint, Node's test runner, Vitest, and Supertest. Redis/BullMQ, JWT/bcrypt, and Socket.IO will be added in their implementation stages.

```text
client/src/  assets, components, context, hooks, layouts, pages, services, utils, styles
server/src/  config, controllers, middleware, models, routes, services, validators,
             utils, socket, jobs, app.js, server.js
worker/src/  workers, services, jobs, utils, worker.js
```

## Local setup

Requires Node.js 22.12+ (Node 24 recommended), npm, and MongoDB. From the project root:

```powershell
Copy-Item .env.example .env
npm install
docker compose up -d mongo
```

Docker is optional: a local MongoDB instance can use the default URI instead. In separate terminals:

```sh
npm run dev:server
npm run dev:client
```

Visit http://localhost:5173. The API listens on http://localhost:4000. Startup fails clearly if MongoDB cannot connect. The root `.env` is loaded by the server; Vite only exposes variables prefixed with `VITE_`. Set `VITE_API_URL` in `client/.env` if changing the default API address.

`npm run dev:worker` currently reports that the engine is not implemented and exits with code 1. It will become a separate BullMQ process in the monitoring stage.

## Environment

| Variable | Purpose |
| --- | --- |
| PORT | API port, default 4000 |
| MONGODB_URI | Required MongoDB connection string |
| CLIENT_URL | Allowed frontend origin |
| NODE_ENV | Runtime mode |
| VITE_API_URL | Frontend API base URL; put in client/.env to override |
| JWT_SECRET | Reserved for authentication; replace example before enabling auth |
| REDIS_HOST / REDIS_PORT | Reserved for worker scheduling |

Never commit `.env` or real credentials.

## Validation

```sh
npm run lint
npm test
npm run build
npm run preview -w client
```

Backend tests verify liveness/readiness separation, safe errors, malformed JSON handling, configuration validation, CORS, and security headers without requiring MongoDB. Frontend service tests verify API data, errors, connection failures, and cancellation. These are foundation tests, not evidence of a functioning monitoring engine. Real MongoDB integration and browser flows need validation in subsequent stages.

## API overview

| Endpoint | Behavior |
| --- | --- |
| GET /api/health | Process liveness and implementation stage |
| GET /api/health/ready | 200 when MongoDB is connected; 503 otherwise |
| All other endpoints | JSON 404 |

## Security considerations

The API uses Helmet, a JSON body size limit, rate limiting, configured CORS, safe error responses, and environment configuration. These controls do not replace authentication and authorization. Do not expose this foundation as a production service.

The worker will perform requests to untrusted URLs. Before enabling it, implement SSRF defenses that resolve and validate all IPv4/IPv6 addresses, pin requests to validated addresses, block loopback/private/link-local/metadata ranges, reject unsafe redirects or revalidate every hop, and use bounded timeouts and response sizes. No user-provided URLs are fetched in this stage.

Docker Compose currently starts MongoDB only and binds its port to loopback. Redis, API, worker, frontend containers, and production deployment configuration belong to later stages. No deployments or pushes are performed.

## Next implementation stages

1. Mongoose user/workspace/membership models, bcrypt/JWT authentication, backend role authorization, protected frontend routes, and auth tests.
2. Persistent monitor CRUD, validation, public visibility settings, and workspace switching.
3. Redis/BullMQ scheduling, safe HTTP checks, failure thresholds, incident creation/recovery, and worker tests.
4. Real history and analytics, authorized Socket.IO updates, notifications, team/settings management, public status pages.
5. Safe demo seed data, complete Docker environment, integration tests, CI, and deployment hardening.

## Screenshots

Capture the landing page, light/dark dashboard, and mobile workspace after browser verification. Subsequent screenshots should show actual seeded database data and working monitoring flows.
