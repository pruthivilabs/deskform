# Framework APIs

`@deskform/tokens` exports `color`, `space`, `radius`, `type` and `control` in native logical pixels.

`@deskform/ui` exports `Text`, `Button`, controlled `Input`/`Textarea`, `Row`, `Stack`, `AppFrame`, `Workspace`, `Sidebar`, `SidebarSection`, `NavigationItem`, `Toolbar`, `ConfirmDialog` and typed `style(...)`. Inputs require an accessible name. GPUix owns native editing, selection, focus traversal and overlay behavior. Buttons use `onPress`, string labels and native disabled behavior. `style` merges conditional layers and interaction states without a global registry.

`@deskform/runtime` exports typed `defineApplication`/`composeApplication`/`startApplication`, `createCommands` and `clipboard`. Commands also have a portable `@deskform/runtime/commands` entry point that does not load the native host. They enforce unique action/shortcut ownership, exact primary modifiers, disabled conditions, repeat handling and event cancellation. Product handlers remain consumer-owned. The clipboard adapter currently uses macOS `pbcopy` over stdin.

`@deskform/tooling/build` exports `buildNativeApplication({entrypoint,outfile})`. The `deskform` CLI provides `dev`, `build` and `devtools`. The build embeds the published native addon and collects framework dependency notices.

`@deskform/tooling/tuning` exports `useToolbarTuning(path)`; `@deskform/tooling/toolbar` supplies validated values/defaults. `@deskform/tooling/vite` exports `createWorkshopConfig({tuningFile,port})`. The channel path is explicit so a consumer can connect a native window and its browser workshop without product-specific conventions. Only development reads the channel.

These packages are local workspace sources, not published registry releases. The consumer installation workflow is documented as it is verified; do not assume an npm package exists.

## Native surfaces and composition

`AppFrame` arranges a toolbar, optional sidebar/inspector, consumer content and status area around an inset workspace. `Sidebar` is independently usable: give it a required `label`, `defaultWidth` for local sizing, or controlled `width` plus `onWidthChange`. It constrains widths to the window, supports pointer dragging, Left/Right/Home/End keys, Escape cancellation and a collapsed state that unmounts its controls. `SidebarSection` groups content; `NavigationItem` is controlled by `selected`/`onSelect` and uses GPUix's Button behavior. `Toolbar` requires an accessible name.

`composeApplication(application, {toolbar, sidebar, inspector, content, status, commands})` assembles those public slots. Its `.element` can be returned from a consumer React component, so feature state remains local. `startApplication({application, element:<App/>})` opens that component in the native host. Application declarations snapshot window settings, use `id` for the published native `appId`, and expose the published window-chrome options. Native `titlebarTransparent`/`windowBackground` are supported options; 1git's patched drag behavior is not supplied.

`ConfirmDialog` now has generic default locator IDs `confirm-dialog-cancel` and `confirm-dialog-confirm`, configurable through `testId`. It owns modal command containment, initial Cancel focus and restoration; product action names are not embedded in the control.
