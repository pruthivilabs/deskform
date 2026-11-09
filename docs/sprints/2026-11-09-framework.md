# Framework sprint — 2026-11-09

The user clarified that Deskform should supply a framework for AI-assisted desktop application development, with no product under `apps`. The existing snippet implementation remains in Git history.

## Decisions and problems addressed

- Put native build and DialKit integration in `@deskform/tooling`. The product had owned the bundler adapter, file channel, schema, watcher, browser host and integration tests.
- Keep a neutral renderer fixture under `tests/fixtures`. Snippet CRUD, search and persistence tests do not establish a reusable framework contract and leave with the product.
- Expose portable commands through a public subpath. Portable callers had to import a private module to avoid initializing the native host.
- Separate outer frame, workspace and bounded sidebar; a mandatory fixed 290px two-column wrapper is insufficient for independent desktop apps.
- Make typed assembly and consumer ownership explicit, following Toolcraft's composition boundary without adopting its broad schema engine or integrity machinery.
- Prove package consumption outside the repository and document the agent workflow; private source exports alone are not an installation story.

## Deliberate constraints

Published GPUix 0.11.0 needs a static-addon build adapter. Its direct clipboard API is not published. DialKit renders in the DOM. Native verification requires graphics access. Retain those concrete platform boundaries rather than adding an unverified native fork.

The cleanup subagent found no redundant production comments in UI/runtime. It strengthened per-action activation checks and eliminated a possible null-to-null focus assertion, then added cancellation/repeat/disabled-command tests. All run against public behavior and real native controls.
