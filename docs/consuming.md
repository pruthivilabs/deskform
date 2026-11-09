# Build an independent application

The monorepo is Deskform's development home. Consumer products do not become packages under it. `starter/` is a copyable scaffold with identity, typed composition, public controls, an agent contract and one real native behavior test; it contains no product model.

Deskform 0.1.0 is currently unpublished. Use the locally packed artifacts and overrides below. The overrides are required: Bun otherwise attempts to resolve transitive `@deskform/*@0.1.0` references from npm, where these packages do not exist.

```sh
# Inside the Deskform checkout
bun install --frozen-lockfile
bun run pack
DESKFORM_REPO="$PWD"
cp -R starter /path/to/my-utility
cd /path/to/my-utility

for deskform_package in tokens ui runtime tooling; do
  deskform_archive="file:$DESKFORM_REPO/packages/$deskform_package/dist/deskform-$deskform_package-0.1.0.tgz"
  bun pm pkg set "dependencies.@deskform/$deskform_package=$deskform_archive" "overrides.@deskform/$deskform_package=$deskform_archive"
done

bun install
bun run dev
```

Use the same React version as the framework's exact peer requirement, and keep both GPUix packages pinned together. The scaffold supplies the currently verified versions.

In the consumer project:

```sh
bun run check
bun run dev:tools
bun run test:native
bun run build
./dist/utility
```

The native app and DialKit workshop share the explicitly selected `DESKFORM_TUNING_FILE` channel, defaulting to the consumer's `.deskform/toolbar.json`. This works from installed packages; there are no paths back to monorepo configuration. Keep `dist/THIRD_PARTY_NOTICES.txt` with the built executable and add notices for any additional product dependencies.

## Product ownership

- `src/application.ts`: product identity and published native window options.
- `src/app.tsx`: feature state, action declarations and typed toolbar/sidebar/content/status composition.
- `src/main.tsx`: native startup, with no product logic.
- Feature modules: your domain, persistence schema, search and behavior tests.
- `AGENTS.md`: the consumer's agent instructions and framework boundary.

Ask an agent to implement one feature through these public slots and controls, then prove its state transitions and native interactions. The scaffold test demonstrates clicking navigation and invoking the same action through a shortcut. Add actual product outcomes; do not replace native verification with prop snapshots.

`bun run test:consumer` in the framework repository automates a fresh temporary consumer: it installs the packed artifacts, runs the scaffold native tests, compiles the app and drives the executable. The browser suite also launches the packed workshop from an independent consumer and measures its native toolbar after a real DialKit change.

This workflow does not publish packages, create a generator, or produce a signed installer. Publishing and versioned releases remain a subsequent milestone. Until then, the local archive paths in the consumer manifest must remain accessible when dependencies are reinstalled.
