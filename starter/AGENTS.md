# Building with Deskform

This is a consumer project. Read Deskform's public API/development guides before changing framework configuration: https://github.com/pruthivilabs/deskform/tree/main/docs.

- Keep identity/window configuration in `src/application.ts`, composition in `src/app.tsx`, and native startup in `src/main.tsx`.
- Use `composeApplication` with toolbar/sidebar/content/status ports. Build navigation with `Sidebar`, `SidebarSection` and controlled `NavigationItem`; product feature components fill content.
- Keep product models, validation, state transitions, persistence schemas and feature tests here. Do not modify installed framework sources or copy its shell into a product-specific version.
- Use published controls before inventing native behavior. GPUix is not a DOM renderer. Use its JSX types, native refs/focus APIs and typed styles.
- Define actions once with `createCommands`. Keep enabled conditions and product handlers with the feature. Native fields and overlays own editing and focus.
- Pin `@gpuix/react` and `@gpuix/native` to the same exact version and upgrade together with Deskform compatibility verification.
- Run `bun run check` for strict tsrs type checking, `bun run test:native` for interaction changes and `bun run build` for native packaging changes. Assert visible behavior through the GPUix renderer, not props or mocked components. Add product behavior tests for new features.
- `bun run dev:tools` tunes the native toolbar through an explicit local file channel. Commit selected defaults into product configuration; keep `.deskform` and generated artifacts out of Git.
- Build one visible feature at a time: define its outcome and state, compose the existing shell and controls, then run `bun run dev` to inspect it. Exercise keyboard and pointer interactions through a native renderer test, using temporary data for persistence. Run `bun run check` and the relevant tests before committing the milestone.
- Use `Slider` and `SettingsSection` for numeric settings and `Tabs` only when views need them. Settings state and persistence belong to the product. The starter's layout settings are session-only examples.
- DialKit is the browser development workshop, not a native control or production settings store. Its toolbar bridge is development-only; verify a change in the native window and copy chosen defaults into product code.
- Work in small verified commits. Inspect existing changes first. Keep credentials and personal test data out of the repository.
