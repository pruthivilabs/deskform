# Architecture

Deskform is a framework for independent desktop applications. The monorepo groups framework packages; it does not contain a product application. The neutral workbench in `tests/fixtures` exists only to exercise framework contracts through a real renderer.

## Reference decisions

Source inspected on 2026-11-05 and revisited for the framework sprint on 2026-11-09:

- [Toolcraft](https://github.com/pixel-point/toolcraft/tree/4952c4a59dc85a5a29079d81c8666c4898461ab6): studied starter app declarations, `define-toolcraft`, typed composition ports, runtime-owned surfaces/state, command ownership, `AGENTS.md`, runtime-boundary rules, and composition/acceptance tests. Adopt a clear boundary between framework-owned assembly and product-owned content/actions. Verify typed contracts separately from native interactions. Its canvas/timeline schema, signed source tree, source-integrity machinery and renderer system solve a larger design-tool problem and are deferred.
- [1git](https://github.com/1bye/1git/tree/25cfa63128421615c99a4df17de3c050303628bc): studied tokens, typed styles, GPUix controls/tests, startup, native builds, `fixture/app-shell.tsx`, `resizable-sidebar.tsx`, window options and packaging. Adopt separation of outer chrome, workspace surface, navigation/sidebar and content; bounded resizing belongs to the sidebar, not product code. Repository themes, grain, patterns and corner animation remain product concerns. Its custom titlebar-drag ownership and native patches are not published GPUix capabilities.
- [GPUix](https://github.com/remorses/gpuix/tree/0ce4f41fca8ffb9c18fd1efd2631f0f4b97a1abf) and [official docs](https://gpuix.dev/): reuse published Button, Dialog, focus traversal, native fields, scrolling, test renderer and stdio automation. No native patch. Direct clipboard methods visible in upstream source are absent from the pinned 0.11.0 addon, so the small macOS clipboard adapter remains isolated.
- [DialKit](https://www.dialkit.dev/): its real DOM controls run in a local browser workshop. An explicitly configured, validated file channel supplies native toolbar values. Production ignores tuning. It is not mounted in the native tree.

These are architectural references. No Toolcraft or 1git implementation was copied. Retain notices for any future reused source. The native build emits the installed framework dependency licenses with its executable.

[Fluid Functionalism](https://www.fluidfunctionalism.com/) informs the native visual direction: neutral nested surfaces, a shared control rhythm, concise typography, clear selection and keyboard access. GPUix implementations are independently written and do not reproduce its browser components. Its motion, full surface ladder and theme switching are not yet implemented.

## Package boundaries

| Package | Owns                                                    | Depends on                                  |
| ------- | ------------------------------------------------------- | ------------------------------------------- |
| tokens  | Semantic design values                                  | No framework package                        |
| ui      | Styled GPUix controls and composable workspace surfaces | tokens, GPUix, React                        |
| runtime | Application declarations/assembly and desktop commands  | ui where assembly requires it, GPUix, React |
| tooling | Native build/development and browser tuning channel     | tokens, GPUix, Bun, Vite+, DialKit          |

Consumer products own their models, search rules, feature state and storage schema. Framework packages never import products or test fixtures. Keep additional packages tied to a real responsibility and consumer. The packages export TypeScript sources for Bun and are verified as local archives in an independent project; they are not published to npm. React is a peer dependency so controls use the consumer's React instance. The copyable `starter/` supplies composition and agent instructions without becoming a workspace product.

## Tooling and verification

Bun 1.4.3 owns workspaces and `bun.lock`; Turbo 2.11.10 is the only task orchestrator. Vite+ 1.5.0 owns format, lint, portable Vitest tests and the browser workshop. tsrs 0.22.0-ts7.1.0-beta owns strict type checking. GPUix React/native remain exactly 0.11.0; upgrade them together.

Native development is Bun hot reload. Production uses `Bun.build({compile})`. A small static-addon resolver is necessary because the published GPUix dynamic loader does not embed its `.node` binding through a one-line compile command; the adapter uses [Bun's supported N-API embedding path](https://bun.sh/docs/bundler/executables#embed-n-api-addons), with the published binary unchanged.

Cache deterministic static checks and portable tests. Keep native/browser interaction and host-dependent builds uncached; graphics tasks run serially. Verify public composition, controls and focus through GPUix, then launch the real desktop fixture and the compiled executable outside the checkout. Type checks and prop snapshots are not evidence of native behavior.

See the [sprint decision log](sprints/2026-11-09-framework.md) for the scope correction and ownership audit.
