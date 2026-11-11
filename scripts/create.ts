import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const targetArgument = process.argv[2];
if (!targetArgument || process.argv.length !== 3) {
  throw new Error("Usage: bun run create <new-project-directory>");
}

const target = resolve(targetArgument);
const packages = ["tokens", "ui", "runtime", "tooling"];
const pack = Bun.spawn([process.execPath, "run", "pack"], {
  cwd: root,
  stdout: "inherit",
  stderr: "inherit",
});
if ((await pack.exited) !== 0) throw new Error("Could not pack Deskform packages.");

// mkdir without recursive deliberately refuses to overwrite an existing project.
await mkdir(target);
await cp(resolve(root, "starter"), target, { recursive: true });
await mkdir(resolve(target, "vendor"));
const manifestPath = resolve(target, "package.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
for (const name of packages) {
  const packageManifest = JSON.parse(
    await readFile(resolve(root, "packages", name, "package.json"), "utf8"),
  );
  const filename = `deskform-${name}-${packageManifest.version}.tgz`;
  await cp(resolve(root, "packages", name, "dist", filename), resolve(target, "vendor", filename));
  const archive = `file:./vendor/${filename}`;
  if (name === "tooling") manifest.devDependencies[packageManifest.name] = archive;
  else manifest.dependencies[packageManifest.name] = archive;
  manifest.overrides[packageManifest.name] = archive;
}
manifest.name = basename(target)
  .toLowerCase()
  .replace(/[^a-z0-9._-]+/g, "-");
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(`Created ${target}. Run bun install, then bun run dev.\n`);
