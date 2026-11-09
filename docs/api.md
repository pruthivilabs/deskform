# Framework APIs

`@deskform/tokens` exports `color`, `space`, `radius`, `type` and `control` in native logical pixels.

`@deskform/ui` exports `Text`, `Button`, controlled `Input`/`Textarea`, `Row`, `Stack`, `Shell`, `Toolbar`, `ConfirmDialog` and typed `style(...)`. Inputs require an accessible name. GPUix owns native editing, selection, focus traversal and overlay behavior. Buttons use `onPress`, string labels and native disabled behavior. `style` merges conditional layers and interaction states without a global registry.

`@deskform/runtime` exports typed `defineApplication`/`startApplication`, `createCommands` and `clipboard`. Commands also have a portable `@deskform/runtime/commands` entry point that does not load the native host. They enforce unique action/shortcut ownership, exact primary modifiers, disabled conditions, repeat handling and event cancellation. Product handlers remain consumer-owned. The clipboard adapter currently uses macOS `pbcopy` over stdin.

`@deskform/tooling/build` exports `buildNativeApplication({entrypoint,outfile})`. The `deskform` CLI provides `dev`, `build` and `devtools`. The build embeds the published native addon and collects framework dependency notices.

`@deskform/tooling/tuning` exports `useToolbarTuning(path)`; `@deskform/tooling/toolbar` supplies validated values/defaults. `@deskform/tooling/vite` exports `createWorkshopConfig({tuningFile,port})`. The channel path is explicit so a consumer can connect a native window and its browser workshop without product-specific conventions. Only development reads the channel.

These packages are local workspace sources, not published registry releases. The consumer installation workflow is documented as it is verified; do not assume an npm package exists.
