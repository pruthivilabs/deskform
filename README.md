# Deskform

A small framework for building native desktop applications with React, TypeScript, GPUix and Bun. Deskform supplies reusable surfaces, controls, application composition and development/verification tools for humans and coding agents.

This repository contains framework packages and domain-neutral verification fixtures. Product applications belong in separate consumer projects.

```sh
bun install --frozen-lockfile
bun run check
bun run test
bun run test:native
bun run dev
```

`dev` opens the framework workbench used by native tests. `bun run dev:tools` opens the DialKit toolbar workshop. `bun run test:devtools` checks the browser-to-native bridge; install its Chromium with `bun run test:devtools:install`. `bun run test:production` compiles and launches a neutral consumer outside the checkout.

| Package             | Responsibility                                               |
| ------------------- | ------------------------------------------------------------ |
| `@deskform/tokens`  | Semantic colors, typography, spacing and sizing              |
| `@deskform/ui`      | GPUix controls and native workspace surfaces                 |
| `@deskform/runtime` | Typed application composition, commands and desktop behavior |
| `@deskform/tooling` | Native development/build CLI and DialKit bridge              |

Bun owns workspaces and the single lockfile; Turbo orchestrates tasks; Vite+ provides lint, formatting, portable tests and browser tooling; tsrs checks types. GPUix React/native are both pinned to 0.11.0. The verified graphics/build target is macOS arm64.

Create an independent product from this checkout:

```sh
bun run create /path/to/my-app
cd /path/to/my-app
bun install
bun run dev
```

The new project includes its own unpublished Deskform package archives. See the [consumer setup](docs/consuming.md) for configuration, native tests, and build details. Its Settings page demonstrates light and dark appearance and reusable layout sliders. Settings are session-only until the product adds persistence.

For a macOS app icon, add a square PNG at `assets/icon.png` in the new project, run `bun run icon`, update the name and identifier in its `bundle` script, and run `bun run bundle`. The resulting `.app` is unsigned. `bun run test:consumer` verifies independent projects outside this repository.

Read [architecture](docs/architecture.md), [public APIs](docs/api.md), [development](docs/development.md), and [agent instructions](AGENTS.md).
