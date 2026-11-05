# Architecture

Deskform grows alongside one real utility: a local plain-text snippet manager. Product behavior belongs to the app. Shared code is extracted only when the working app demonstrates its responsibility.

## Reference study

Source inspected on 2026-11-05:

- [Toolcraft](https://github.com/pixel-point/toolcraft/tree/4952c4a59dc85a5a29079d81c8666c4898461ab6): `starter/src/app/app-schema.ts`, `app-composition.tsx`, routes, `runtime/schema/define-toolcraft.ts`, `runtime/react/app-shell/compose-toolcraft-app.tsx`, `runtime/state/toolcraft-external-store.ts`, `persistence-controller.ts`, command handlers, UI primitives, framework-boundary acceptance tests, `AGENTS.md`, runtime-boundary and acceptance-testing docs. The starter places product declarations under `src/app` and a much larger reusable runtime under `src/toolcraft`. Adopt explicit typed composition, controls with one interaction owner, durable state boundaries, and real reload/side-effect proof. Defer its canvas schema, timeline, renderer ports, transient state machinery, and extensive source-contract gates. They serve a much larger design-tool problem.
- [1git](https://github.com/1bye/1git/tree/25cfa63128421615c99a4df17de3c050303628bc): Bun workspace and Turbo config; `packages/design-tokens`, `gpuix-stylesheet/src/index.ts`, `gpuix-ui/src/{button,textarea,text}.tsx` and native component tests; `apps/gpuix/src/{main,window-options,native-chrome.d.ts}`; native preload, build, packaging and patch files. Adopt tokens → controls → app separation, typed GPUix styles and native interaction testing. Keep our small style composition helper inside UI instead of creating a fourth package. 1git pins GPUix 0.10.0 and builds a custom addon: titlebar drag ownership, password inputs, text scaling, textarea decoration, diff styling, scrollbars, close protection and other integrations are local patches, not a baseline GPUix contract. Deskform takes none of that patch stack.
- [GPUix](https://github.com/remorses/gpuix/tree/0ce4f41fca8ffb9c18fd1efd2631f0f4b97a1abf): official example app, React renderer, native host types, headless Button and automation/test implementations, plus [native docs](https://gpuix.dev/). Published 0.11.0 supplies Button behavior, automatic Tab/Shift-Tab navigation, cancellable key events, native fields/textarea/selection/undo, scroll containers, headless overlays, a GPU test renderer and live stdio automation. Reuse these instead of reimplementing them. Direct clipboard methods appear in the inspected upstream source but are absent from the published 0.11.0 declarations and addon prototype; isolate an OS clipboard boundary until a matching published release provides them. Use ordinary window chrome until a concrete product need justifies customization. No native patch is required initially.
- [DialKit](https://github.com/joshpuckett/dialkit) and its [agent guide](https://www.dialkit.dev/agent): use the real DOM library in a local browser development panel to tune native toolbar metrics and colors. GPUix cannot mount DialRoot or CSS. A narrow validated development bridge will feed those values to native styles; production retains fixed token defaults.

These are architectural references; no reference-project implementation is copied. Dependencies retain their own licenses. Any future copied implementation must include its upstream notice.

## Initial boundaries

| Package              | Owns                                                                      | Dependencies         |
| -------------------- | ------------------------------------------------------------------------- | -------------------- |
| `@deskform/tokens`   | Semantic palette, spacing, type, radii, control sizes                     | None                 |
| `@deskform/ui`       | Small styled GPUix controls, layout, shell surfaces, focus appearance     | tokens, GPUix, React |
| `@deskform/runtime`  | Typed application declaration/startup and commands extracted from the app | GPUix, React         |
| `@deskform/snippets` | Snippet model, search, editor, selection, persistence schema and workflow | runtime, ui, tokens  |

Packages are private, source-exported workspace packages. Bun bundles the native application directly from TypeScript. There are no redundant library builds. Filesystem persistence starts in the app; extract an atomic document primitive only if it earns another consumer.

## Tool ownership and versions

Bun 1.4.3 supports workspaces; [Vite+ supports Bun](https://viteplus.dev/guide/package-management), and [Turbo accepts Bun workspaces](https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository). `bun.lock` is authoritative. Installed environment: Apple Silicon macOS, Bun 1.4.3, Node 26.13.0, global Vite+ 1.5.0. Pin local Vite+ 1.5.0 and Turbo 2.11.10. Pin both GPUix packages to 0.11.0, including a root override to prevent drift.

The requested [tsrs](https://github.com/oxc-project/tsrs) 0.22.0-ts7.1.0-beta owns strict TypeScript checks (`tsrs --noEmit --fast`). Its source/compatibility docs describe an evolving TypeScript 7 port. Vite+ owns format, type-aware lint and portable Vitest execution; disable its duplicate typecheck. Turbo alone orchestrates and caches deterministic workspace tasks. Native development is `bun --hot`; production uses `bun build --compile`. Native graphics tests are uncached and serial. No Vite browser build is used for the native app.

## Verification approach

Use portable tests for transitions, search, commands and real temporary filesystem persistence. Use GPUix's GPU test renderer for controls, focus and input. Launch the actual window through stdio automation to prove the full workflow and restoration after process restart. Observe clipboard values and saved files, not only React state. Inspect a captured native window visually. Record the distinction between offscreen native tests and OS window behavior in development docs.
