# DevPulse

Distributed API Monitoring & Incident Management Platform.

## Current stage: authentication and workspace access control

Implemented: React/Vite landing page and responsive application shell, light/dark theme, real account registration and login, JWT cookie sessions, session restoration, logout, default workspaces and owner memberships, workspace switching, backend membership/role authorization, and live API readiness checks. Protected application routes show real user/workspace details and an honest monitoring empty state.

Monitor CRUD, actual monitoring, incidents, analytics, notifications, invitations/team management, Redis/BullMQ, Socket.IO and public status pages remain unimplemented. Landing artwork is illustrative. The worker deliberately exits because checks are not running.

## Setup

Requires Node.js 22.12+ and MongoDB with transaction support (replica set or Atlas). A standalone MongoDB server cannot perform registration transactions.

```powershell
Copy-Item .env.example .env
npm install
docker compose up -d mongo
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Put the generated secret into `JWT_SECRET` in your local `.env`. The example is deliberately rejected; never commit real secrets. Compose initializes a single-node `rs0` replica set. Wait until its health check reports healthy. An existing MongoDB volume is retained. For another database, configure its replica set URI in `MONGODB_URI`.

```sh
npm run dev:server
npm run dev:client
```

Visit http://localhost:5173. API: http://localhost:4000. Use the same hostname for both services (do not mix localhost and 127.0.0.1). Root `.env` configures the server; use `client/.env` for `VITE_API_URL`. No secret belongs in a `VITE_` variable.

| Variable | Purpose |
| --- | --- |
| PORT | API port, default 4000 |
| MONGODB_URI | Required transaction-capable MongoDB URI |
| CLIENT_URL | Exact frontend origin; HTTPS required in production |
| NODE_ENV | `production` enables Secure cookies |
| JWT_SECRET | Required random secret of at least 32 characters; example values rejected |
| VITE_API_URL | Frontend API base URL, default http://localhost:4000/api |
| REDIS_HOST / REDIS_PORT | Reserved, unused |

Production requires HTTPS and frontend/API on the same site for SameSite=Lax cookies. Cross-site deployment requires a separately reviewed cookie/CSRF design. Do not enable proxy trust without configuring the deployment's actual trusted proxy.

## Authentication and authorization

Registration validates name/email/password, normalizes email, hashes passwords using bcrypt (cost 12), and atomically creates a User, Workspace and unique owner Membership. Passwords require 12 characters with uppercase, lowercase and a number, and cannot exceed bcrypt's 72-byte limit. Duplicate emails return 409. Password hashes are excluded by default and explicitly omitted from API serializers.

Login returns generic invalid-credential errors. Authentication uses HS256 JWTs with explicit issuer/audience and an eight-hour expiration, stored only in HttpOnly, SameSite=Lax cookies (Secure in production). No authentication token is stored in localStorage/sessionStorage or returned to JavaScript. Mutation requests require an Origin exactly matching CLIENT_URL, including login/register/logout, to prevent CSRF. CLI API requests must also supply this Origin header. CORS permits that frontend with credentials. Authentication attempts have an additional rate limit.

`AuthProvider` restores `/auth/me`, owns login/register/logout and workspace state, and delays protected rendering until restoration completes. Session connection errors show a retry. Login/register redirect authenticated users to the dashboard. Logout increments a persisted session version, revoking all existing account sessions, clears the cookie and redirects through the route guard to login. Account-wide logout is intentional; no refresh tokens or per-device sessions exist yet.

Future workspace APIs can compose `authenticate(config) ? requireWorkspaceMembership ? requireRole('owner', 'admin')`. Membership and role are always read from MongoDB; client-provided roles are ignored. Workspace switching changes the selected accessible workspace in memory; refreshing selects the first accessible workspace. No invitations or workspace creation UI is included.

## API

| Endpoint | Behavior |
| --- | --- |
| POST /api/auth/register | Creates account, workspace and owner membership; establishes session |
| POST /api/auth/login | Validates credentials; establishes session |
| GET /api/auth/me | Safe user and accessible workspaces; requires session |
| POST /api/auth/logout | Revokes account sessions and clears cookie |
| GET /api/workspaces/:workspaceId | Requires membership; returns safe workspace details |
| GET /api/workspaces/:workspaceId/access | Owner/admin access check, returns current role |
| GET /api/health | Process liveness |
| GET /api/health/ready | Database readiness |

Errors use `{ error: { code, message } }`. Unknown APIs return JSON 404. Helmet, request limits, safe errors and general rate limiting remain active.

## Validation

```sh
npm run lint
npm test
npm run build
```

Backend tests include real MongoDB replica-set integration using mongodb-memory-server: registration, workspace/member creation, uniqueness, hashing and safe serialization, login, wrong credentials, missing/invalid/expired sessions, restoration, logout revocation, membership/role checks, ObjectId validation, Origin rejection and transaction rollback. First execution downloads a MongoDB test binary and requires network access. Existing health/security tests remain.

Frontend tests cover API error handling/cancellation, form validation, failed/successful login, successful registration, guest redirects, authenticated access, session restoration/retry, logout and workspace switching. These tests do not establish production deployment readiness. Email verification, password reset, refresh/per-device sessions and end-to-end deployed browser verification remain future work.

## Architecture and next stage

React ? Express ? MongoDB. The monitoring worker, Redis/BullMQ scheduling and Socket.IO remain planned. `npm run dev:worker` reports that monitoring is unavailable and exits with code 1.

**Next: Persistent Monitor CRUD + validation + workspace ownership + public/private visibility settings.** After that: safe HTTP checks with SSRF protections, scheduling, incidents, analytics and notifications. No monitoring URLs are fetched in this stage. No pushes or deployments are performed.
