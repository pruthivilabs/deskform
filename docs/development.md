# Development

Use Bun **1.4.3** and Node **26.13.0** (pinned in `.node-version`). The local Vite+ CLI is installed with the workspace; a global `vp` is optional.

```sh
bun install --frozen-lockfile
bun run check
bun run format
```

Turbo runs static checks with deterministic caching. `vp check` formats/lints; per-package tsrs checks types. The native app and tests are added incrementally in subsequent commits.

The pstack `tdd`, `principle-test-behavior-not-implementation`, `principle-prove-it-works`, `principle-sequence-verifiable-units`, `typescript-best-practices`, and `principle-type-system-discipline` skills were installed from [backnotprop/pstack](https://github.com/backnotprop/pstack) for this build. They are user-level agent tools, not runtime dependencies. Tests should assert user-observable results, use real infrastructure when practical, and preserve failing-before evidence for focused regressions.
