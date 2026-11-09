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

Give `src/application.ts` your product identity. Replace the empty content surface with your features; keep the framework's frame/sidebar/controls and the provided agent instructions. There is no generator or plugin system.
