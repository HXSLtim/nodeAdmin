---
name: dev
description: Quick reference for starting the development environment
disable-model-invocation: true
---

## Start Development Environment

### 1. Infrastructure (if not running)

```bash
npm run infra:up
```

This starts PostgreSQL (55432), PgBouncer (6432), and Redis (56379).

### 2. Initialize Database (first time only)

```bash
node scripts/initDb.cjs
```

### 3. Start Dev Servers

Run in separate terminals or use `$ARGUMENTS` to pick one:

- `api` — `npm run dev:api` (NestJS on port 11451)
- `web` — `npm run dev:web` (Vite on port 3000)
- `both` or no argument — start both

### Default Credentials

- Email: `admin@nodeadmin.dev`
- Password: `Admin123456`
- Role: super-admin, default tenant
