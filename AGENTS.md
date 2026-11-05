# Working on Deskform

Read `docs/architecture.md` and `docs/development.md` before changing boundaries or tooling.

- The app owns snippets, search rules, document validation, and feature state.
- Shared packages never import from `apps/`. Imports follow app → runtime/ui → tokens.
- Prefer published GPUix primitives. Inspect installed types/source before adding native behavior.
- Upgrade `@gpuix/react` and `@gpuix/native` together, keeping exact matching versions and the root override.
- Bun owns workspaces and `bun.lock`; Turbo owns task scheduling/caching; Vite+ owns formatting, lint, portable tests and browser devtools; tsrs owns type checking; Bun owns native launch/build/testing.
- Use `jsxImportSource: "@gpuix/react"`. Native elements are not DOM elements.
- Test observable behavior through the real native renderer. A typecheck, a changed prop, or a mocked renderer does not prove an interaction.
- Keep native interaction tasks uncached and serial. Use temporary data directories in tests, never personal data.
- Verify each coherent milestone and commit it separately. Stage specific files. Keep generated output and machine configuration out of Git.
- Preserve upstream license/attribution when copying code. Architectural inspiration alone is recorded in `docs/architecture.md`.
- Keep the public API small. Extract from an actual consumer; defer generators, plugins and schema engines.
