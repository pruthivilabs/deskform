# Deskform consumer scaffold

This is a copyable consumer scaffold, not a product application or a workspace package. Deskform 0.1.0 is not published to npm. First follow the repository's local-package installation guide; do not run an unconfigured registry install.

After local package installation:

```sh
bun run check
bun run dev
bun run dev:tools
bun run test:native
bun run build
```

To produce a macOS application with your own icon, put a square PNG of at least 512 × 512 pixels at `assets/icon.png` and run `bun run icon`. This creates `assets/AppIcon.icns` using macOS image tools; 1024 × 1024 avoids enlarging the largest representation. You can also supply an existing `.icns` file. Edit the name and bundle identifier in the `bundle` script to match `src/application.ts`, then run `bun run bundle`. The icon and bundle destinations must not already exist. The bundle is unsigned; keep the included third-party notices when distributing it.

Give `src/application.ts` your product identity. Replace the empty content surface with your features; keep the framework's frame/sidebar/controls and the provided agent instructions. Settings includes session-only examples of reusable numeric sliders. The product owns durable preferences. Optional tabs are available when a feature needs multiple views.
