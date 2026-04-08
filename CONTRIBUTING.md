# Contributing to nodeAdmin

Thank you for considering contributing to nodeAdmin! This document outlines how to get your changes into the project cleanly.

nodeAdmin is a rapid-development framework for building enterprise middle/back-office applications. It is explicitly designed to be **forked and extended** — if you are building a product on top of nodeAdmin, most of your work lives in your fork, and only framework-level improvements need to come back here.

## Ways to contribute

- **Report bugs** — open an issue using the Bug Report template. Include reproduction steps, expected vs. actual behavior, and environment info.
- **Suggest features** — open an issue using the Feature Request template. Prefer discussing significant changes before spending time on a PR.
- **Improve documentation** — typos, clarifications, missing examples, translation of error messages and README sections are always welcome.
- **Fix issues** — check the issue tracker for items labeled `good first issue` or `help wanted`.
- **Write plugins** — the plugin marketplace is the intended extension surface. Plugins live in their own repositories; we happily link to community plugins from the README.

## Development setup

Requires Node.js 22+, Docker, and npm 10+.

```bash
# Clone and install
git clone https://github.com/DistroCore/nodeAdmin.git
cd nodeAdmin
npm ci

# Start infrastructure (Postgres, Redis)
npm run infra:up

# Apply database migrations
npm run db:migrate -w coreApi

# Start dev servers
npm run dev:api    # CoreApi backend (port 11451)
npm run dev:web    # AdminPortal frontend (port 3000)
```

Open http://localhost:3000 to see the admin portal. API docs are served at http://localhost:11451/api/docs when `SWAGGER_ENABLED=true` (the default in development).

## Before you open a pull request

Run the full local CI pipeline — the same checks GitHub Actions runs, minus the infrastructure-heavy integration tests:

```bash
npm run ci:local
```

This runs, in order:

1. `npm run format:check` — Prettier
2. `npm run lint` — ESLint (zero warnings allowed)
3. `npm run test:coreApi` + `npm run test:adminPortal` — Vitest unit tests
4. `npm run build` — both apps

All four must pass. If you are changing backend code, also run:

```bash
npm run test:coreApi:integration   # requires npm run infra:up first
npm run m2:acceptance:auto          # end-to-end acceptance test
```

If you are changing dependency versions, run:

```bash
npx audit-ci --config audit-ci.jsonc
node scripts/checkAuditAllowlistExpiry.cjs
```

## Coding conventions

These are enforced by ESLint/Prettier and/or reviewed manually. The full reference is in [CLAUDE.md](CLAUDE.md); the most commonly-tripped rules:

- **Directory names** are `lowercase` (e.g. `components/`, `modules/`).
- **Business file names** are `lowerCamelCase` (e.g. `messagePanel.tsx`, `conversationService.ts`); framework/config files keep their official names.
- **React components** export `PascalCase` function components.
- **Types and interfaces** are `PascalCase`. Prefer `interface` for object shapes and `type` for unions/aliases.
- **No `any`** — if you genuinely need it, add an explanatory comment.
- **No `console.log`** — use NestJS `Logger` and the project's structured logging pipeline.
- **No hardcoded** `tenantId`, `userId`, `conversationId`, or API base URLs — these come from context/config.
- **Outbox pattern for Kafka events** — every business write that needs to publish an event must insert the outbox row in the same DB transaction. Never use direct double-writes.
- Backend (`apps/coreApi`) is **CommonJS**; frontend (`apps/adminPortal`) is **ESM**. Do not mix module systems within an app.

## Commit messages

We follow a [Conventional Commits](https://www.conventionalcommits.org/)–style prefix to make history greppable:

```
<type>(<scope>): <short summary>

<optional body explaining "why", wrapped at ~72 cols>
<optional footer: Fixes #123, Co-authored-by: ..., etc.>
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`, `build`.

Keep each commit focused on one logical change. If your PR grows to cover multiple unrelated concerns, split it.

## Pull request process

1. Fork the repository and create a branch off `master`.
2. Make your changes with tests.
3. Run `npm run ci:local` and make sure it passes.
4. Open a pull request using the template. Link to the related issue if one exists.
5. Address review feedback. Keep the PR rebased on `master` if it falls behind — prefer rebase over merge commits.
6. A maintainer will merge once checks are green and review is resolved.

## Reporting security issues

Please do **not** open a public issue for security vulnerabilities. See [SECURITY.md](SECURITY.md) for the disclosure process.

## Code of conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By participating, you agree to uphold its terms.

## Questions

If something in this document is unclear or incomplete, open an issue with the `documentation` label — the entry barrier for new contributors is itself a contribution target.
