# Working on Deskform

Read `docs/architecture.md`, `docs/api.md` and `docs/development.md` before changing boundaries or tooling.

- Deskform is a framework repository. Product applications live in consumer projects, not under `apps/` here. Keep only domain-neutral native verification fixtures under `tests/fixtures`.
- Framework packages never import from fixtures or consumer product code. Dependencies flow consumer → runtime/ui/tooling → tokens.
- Prefer published GPUix primitives. Inspect installed types/source before adding native behavior.
- Upgrade `@gpuix/react` and `@gpuix/native` together, keeping exact matching versions and the root override.
- Bun owns workspaces and `bun.lock`; Turbo owns task scheduling/caching; Vite+ owns formatting, lint, portable tests and browser devtools; tsrs owns type checking; Bun owns native launch/build/testing.
- Use `jsxImportSource: "@gpuix/react"`. Native elements are not DOM elements.
- Test observable behavior through the real native renderer. A typecheck, a changed prop, or a mocked renderer does not prove an interaction.
- Keep native interaction tasks uncached and serial. Use temporary data directories in tests, never personal data.
- Verify each coherent milestone and commit it separately. Stage specific files. Keep generated output and machine configuration out of Git.
- Preserve upstream license/attribution when copying code. Architectural inspiration alone is recorded in `docs/architecture.md`.
- Keep the public API small. Extract from an actual consumer; defer generators, plugins and schema engines.

- Use `bun run check`, `bun run test`, `bun run test:native`, `bun run test:devtools`, and `bun run test:production` for the relevant surfaces. `bun run test:consumer` packs and installs the starter in a temporary independent project, then checks types, native behavior and its compiled executable. Chromium setup is `bun run test:devtools:install`.
- The static-addon resolver in `packages/tooling/src/build.ts` is required for the verified standalone build. Keep its exports aligned with the pinned published GPUix package and retain generated dependency notices with distributed artifacts.
- DialKit belongs to the browser workshop, not the GPUix tree. Keep its bridge local, validated, ignored by Git, and disabled in compiled production.
