# Security Policy

## Supported Versions

nodeAdmin is under active development. Only the latest commit on `master` receives security fixes. Once the project reaches a stable release, this table will be expanded with per-version support windows.

| Version           | Supported     |
| ----------------- | ------------- |
| `master` (latest) | ✅            |
| Tagged releases   | ❌ (none yet) |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.** Public disclosure before a fix is available puts every downstream fork and deployment at risk.

Instead, report security issues privately through one of:

1. **GitHub Security Advisories** (preferred) — Use the "Report a vulnerability" button on the [Security tab](https://github.com/DistroCore/nodeAdmin/security/advisories/new) of this repository. This creates a private advisory only you and the maintainers can see.
2. **Email** — Send details to `a2778978136@163.com` with the subject prefix `[SECURITY]`.

### What to include

- A clear description of the vulnerability and its impact.
- Steps to reproduce, ideally as a minimal test case.
- Affected components (backend module, frontend component, infrastructure config, dependency).
- The commit or version you verified against.
- Any suggested mitigations or patches.

### What to expect

- **Acknowledgment**: Within 72 hours of your report, you will receive confirmation that it was received and is being triaged.
- **Assessment**: Within 7 days, you will receive an initial assessment — whether the issue is confirmed, the severity we assign it, and our tentative fix plan.
- **Fix and disclosure**: Confirmed vulnerabilities are patched on `master` first. Coordinated disclosure (public advisory + CVE if applicable) happens after a reasonable window for downstream forks to pull the fix, typically 14–30 days depending on severity.
- **Credit**: If you would like to be credited in the advisory, tell us how you would like to be named. Anonymous reports are also fine.

## Dependency vulnerabilities

nodeAdmin's CI runs [`audit-ci`](https://github.com/IBM/audit-ci) with a documented allowlist (`audit-ci.jsonc`) on every push and pull request. The gate blocks on high and critical severities in production dependencies. Known but unfixable transitive advisories are allowlisted with explicit expiry dates (enforced by `scripts/checkAuditAllowlistExpiry.cjs`) so they cannot silently become permanent.

If you notice a new advisory against a production dependency, please still report it — the gate may not have run yet for the commit you are looking at, or the advisory may be newly published.

## Scope

The following **are in scope** for security reports:

- `apps/coreApi/` — backend services, authentication, authorization, multi-tenancy, audit logging, plugin sandbox.
- `apps/adminPortal/` — frontend, including XSS, CSRF, and credential-handling issues.
- `packages/shared-types/` and any other shared packages.
- CI/CD workflows under `.github/` if they leak secrets or enable supply-chain attacks.
- `infra/docker/` and `docker-compose.yml` if they misconfigure network exposure or credentials.
- Documentation in `docs/` if it advises insecure practices.

The following **are out of scope**:

- Vulnerabilities in downstream forks that do not originate from nodeAdmin itself.
- Issues in optional infrastructure components (Grafana, Alertmanager, k6) unless nodeAdmin's configuration causes the vulnerability.
- Denial of service from unrealistic traffic levels against the default development configuration.
- Social engineering or physical attacks.

Thank you for helping keep nodeAdmin and its downstream users safe.
