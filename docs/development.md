# Development

Use Bun 1.4.3, Node 26.13.0 and a logged-in Apple Silicon macOS desktop for the verified native path. Packages install published GPUix binaries; no local Rust build is needed.

```sh
bun install --frozen-lockfile
bun run check
bun run test
bun run test:native
bun run test:production
bun run test:consumer
```

`check` combines Vite+ format/lint and tsrs type checks. Portable tests use Vite+ Vitest. Native tests use Bun and the actual GPUix renderer; the root neutral fixture also launches as a real window. Production verification builds that consumer and launches it from a temporary directory outside the checkout.

```sh
bun run dev
bun run dev:tools
```

The first command opens the framework workbench with Bun hot reload. The second serves DialKit at http://127.0.0.1:4317. Both use `.deskform/toolbar.json` in the current project by default. `DESKFORM_TUNING_FILE` explicitly selects another shared channel; `DESKFORM_WORKSHOP_PORT` changes the workshop port. The native consumer passes the selected path to `useToolbarTuning(path)`. Invalid values fall back to tokens; compiled production ignores tuning.

```sh
bun run test:devtools:install
bun run test:devtools
```

The browser tests own separate servers on ports 4327 and 4328 and disposable test channels. They drive actual DialKit sliders and observe native geometry, including from installed packages in an independent consumer. They do not reuse an arbitrary development server or modify personal application data. The CLI selects Vite's module runner so installed TypeScript dependencies can load in the Node-based workshop config.

Root `build` compiles the neutral fixture; consumers use `deskform build <entry.tsx> --outfile <path>`. Keep its generated `THIRD_PARTY_NOTICES.txt` with distributed binaries. The first supported build target is macOS arm64. Signing, notarization, installers, other clipboard backends and other platform builds are not implemented.

GPUix needs native JSX types (`jsxImportSource: "@gpuix/react"`). Its styles use logical pixels and `flexGrow`, not arbitrary DOM/CSS APIs. GPUix automation's `press()` emits key-down; Space activation tests must send explicit key-down and key-up. Graphics tests need access to the actual desktop session and may fail inside a sandbox.

Generated binaries, screenshots and traces live under ignored `output/`. Native and browser tasks are serial and uncached. Hot reload remounts component state; React Refresh is not configured. OS chrome effects, VoiceOver, IME composition, RTL and other operating systems require additional verification.

Agent tools used in this sprint: pstack behavior/verification/TypeScript skills and the explicitly installed `caldoai/skills` `untangle-codebase` skill. The latter drove the ownership decision log and a separate comment/test cleanup audit.

Consumer setup and the local archive/override requirement are documented in [consuming Deskform](consuming.md). `starter/` is excluded from root workspaces; it is copied into a separate product project.
