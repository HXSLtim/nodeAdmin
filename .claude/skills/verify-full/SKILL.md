---
name: verify-full
description: Full verification including integration tests, build, and M2 acceptance — requires infrastructure running (npm run infra:up)
disable-model-invocation: true
---

Run the full CI pipeline locally. Infrastructure must be running (`npm run infra:up`).

```bash
npm run ci:local
```

This runs: lint → format check → unit tests → build → integration tests sequentially.

If the user also wants M2 acceptance:

```bash
npm run m2:acceptance:auto
```

Report any failures with context on which stage failed and the relevant error output.
