# Development

Use Bun **1.4.3** and Node **26.13.0** (pinned in `.node-version`). The local Vite+ CLI is installed with the workspace; a global `vp` is optional.

```sh
bun install --frozen-lockfile
bun run check
bun run format
```

Turbo runs static checks with deterministic caching. `vp check` formats/lints; per-package tsrs checks types. Native development uses `bun run dev` (Turbo → `bun --hot`); edits remount the React tree in the same native window. Component-local state resets on remount; React Refresh is not configured. `bun run test:native` runs uncached GPU tests and real-window stdio automation serially. A logged-in macOS graphics session is required; sandboxed AppKit can fail during initialization. `bun run build` creates `apps/snippets/dist/deskform-snippets` using Bun compile, with the published native addon embedded. `bun run --cwd apps/snippets start` launches without reload.

Verified: offscreen native pointer/Enter activation, real-window pointer activation and screenshot, hot reload after rewriting a disposable entry, static checks and a compiled native build. The normal OS titlebar is intentional.

The pstack `tdd`, `principle-test-behavior-not-implementation`, `principle-prove-it-works`, `principle-sequence-verifiable-units`, `typescript-best-practices`, and `principle-type-system-discipline` skills were installed from [backnotprop/pstack](https://github.com/backnotprop/pstack) for this build. They are user-level agent tools, not runtime dependencies. Tests should assert user-observable results, use real infrastructure when practical, and preserve failing-before evidence for focused regressions.
