<!--
Thanks for contributing to nodeAdmin! Please fill out every section — reviewers rely on it.
If this PR addresses an open issue, reference it with "Fixes #123".
-->

## Summary

<!-- One paragraph: what does this PR change, and why? -->

## Type of change

- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change (migration / behavior change required for existing forks)
- [ ] Documentation only
- [ ] CI / tooling / build
- [ ] Refactor (no behavior change)

## Scope check

- [ ] This change is **framework-level** (DX, stability, extensibility, security).
- [ ] This change does **not** add a business vertical that belongs in a downstream fork.

## Testing

<!-- How did you verify this change? -->

- [ ] `npm run format:check`
- [ ] `npm run lint` (zero warnings)
- [ ] `npm run test:coreApi`
- [ ] `npm run test:adminPortal`
- [ ] `npm run build`
- [ ] Integration tests, if applicable (`npm run test:coreApi:integration`)
- [ ] Manual verification steps:

```
<!-- paste the exact commands you ran, or the UI steps you followed -->
```

## Dependency / security

- [ ] No new dependencies
- [ ] New dependencies added — ran `npx audit-ci --config audit-ci.jsonc` and `node scripts/checkAuditAllowlistExpiry.cjs`
- [ ] If an allowlist entry was added to `audit-ci.jsonc`, it has an explicit expiry date and a justification comment

## Documentation

- [ ] Updated `docs/` where relevant
- [ ] Updated `CLAUDE.md` / `AGENTS.md` / `GEMINI.md` if the change affects coding conventions or commands
- [ ] Updated `docs/governance/decisionLog.md` if this is an architectural decision
- [ ] README / CONTRIBUTING / SECURITY adjustments are in this PR (not deferred)

## Breaking change notes

<!-- If this is a breaking change, describe the migration steps downstream forks must take. Leave empty otherwise. -->

## Related

<!-- Link related issues, decisions, spec docs. Use "Fixes #", "Refs #", or explicit paths like docs/governance/decisionLog.md#D-020 -->
