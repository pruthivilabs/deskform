# Framework sprint — 2026-11-09

The user clarified that Deskform should supply a framework for AI-assisted desktop application development, with no product under `apps`. The existing snippet implementation remains in Git history.

## Decisions and problems addressed

- Put native build and DialKit integration in `@deskform/tooling`. The product had owned the bundler adapter, file channel, schema, watcher, browser host and integration tests.
- Keep a neutral renderer fixture under `tests/fixtures`. Snippet CRUD, search and persistence tests do not establish a reusable framework contract and leave with the product.
- Expose portable commands through a public subpath. Portable callers had to import a private module to avoid initializing the native host.
- Separate outer frame, workspace and bounded sidebar; a mandatory fixed 290px two-column wrapper is insufficient for independent desktop apps.
- Make typed assembly and consumer ownership explicit, following Toolcraft's composition boundary without adopting its broad schema engine or integrity machinery.
- Prove package consumption outside the repository and document the agent workflow; private source exports alone are not an installation story.
- Use React peer dependencies and explicit local archive overrides. Packed packages must share the consumer's React; unpublished transitive dependencies must not silently resolve from a registry.
- Keep the workshop's tsconfig self-contained and select Vite's module runner. The packed Node-based workshop otherwise fails to load TypeScript dependencies under `node_modules`.
- Restore toolbar defaults when its explicit channel is removed. The original hook retained stale values after disconnecting; a native regression test first reproduced that failure.
- Keep a pointer resize in control of its gesture until release or Escape, and clear it when the panel collapses. Keyboard resizing must not overwrite an in-progress drag.
- Derive consumer archive names from package manifests. The final audit found a hardcoded test version that would have broken the consumption check after a release bump.

## Deliberate constraints

Published GPUix 0.11.0 needs a static-addon build adapter. Its direct clipboard API is not published. DialKit renders in the DOM. Native verification requires graphics access. Retain those concrete platform boundaries rather than adding an unverified native fork.

The cleanup subagent found no redundant production comments in UI/runtime. It strengthened per-action activation checks and eliminated a possible null-to-null focus assertion, then added cancellation/repeat/disabled-command tests. All run against public behavior and real native controls.

## Completed verification

| Command                         | Evidence                                                                                                                                                                                                    |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun install --frozen-lockfile` | Single workspace lockfile installs unchanged                                                                                                                                                                |
| `bun run check`                 | Vite+ formatting/lint and tsrs pass for all packages and test tooling                                                                                                                                       |
| `bun run test`                  | Six portable tests cover command ownership/dispatch, configuration snapshots and channel validation                                                                                                         |
| `bun run test:native`           | Eight renderer/window tests cover pointer/keyboard activation, disabled controls, Unicode/multiline input, Tab traversal, sidebar limits/gestures, modal focus/command containment and tuning disconnection |
| `bun run test:devtools`         | Two browser/native tests drive real DialKit sliders, including an installed workshop in a separate consumer                                                                                                 |
| `bun run test:consumer`         | Fresh temporary consumer installs four packed packages, passes tsrs and its native navigation test, builds, and drives its compiled executable                                                              |
| `bun run test:production`       | Compiled fixture launches outside the checkout, accepts input/actions and ignores development tuning even when supplied through the environment                                                             |

The native screenshot was inspected after running the real window. Its divider now keeps a thin resting border with a wider interactive area; button labels use an explicit native flex layout for centering. Screenshots, binaries, notices, archives, temporary manifests and test data remain untracked.

The final boundary audit found no further consumption blocker after the archive-version fix. The result is a framework monorepo with `tokens`, `ui`, `runtime` and `tooling`; `starter/` is a copyable consumer scaffold outside the workspaces. The snippet app and its product schema remain only in history.

## Remaining work

Verification currently covers Apple Silicon macOS. OS chrome effects, VoiceOver, IME, RTL, other platforms, signing and installers remain unverified or unimplemented as described in the development guide. Packages are not published; the documented local archive workflow is required.

The next useful framework milestone is a versioned package release and compatibility matrix, so independent applications can replace local archives with reproducible released dependencies. Product persistence should remain consumer-owned until multiple consumers establish a shared storage contract.
