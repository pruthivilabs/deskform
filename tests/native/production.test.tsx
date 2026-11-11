import { expect, test } from "bun:test";
import { launch } from "@gpuix/react/automation";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
test("the framework-built executable works outside the checkout", async () => {
  const directory = mkdtempSync(join(tmpdir(), "deskform-production-"));
  const tuningFile = join(directory, "toolbar.json");
  writeFileSync(tuningFile, JSON.stringify({ height: 80, gap: 8, padding: 24, accent: "#b9c8ff" }));
  const app = await launch({
    command: resolve("output/deskform-fixture"),
    cwd: directory,
    env: { NODE_ENV: "development", DESKFORM_TUNING_FILE: tuningFile },
  });
  try {
    expect((await app.getByTestId("toolbar").bounds()).height).toBe(64);
    await app.getByTestId("input").fill("Standalone consumer");
    expect(await app.getByTestId("echo").textContent()).toBe("Standalone consumer");
    await app.getByTestId("action").click();
    expect(await app.getByTestId("count").textContent()).toBe("1");
  } finally {
    await app.close();
    rmSync(directory, { recursive: true, force: true });
  }
}, 20000);

test("a macOS bundle carries the requested icon and runs its executable", async () => {
  const directory = mkdtempSync(join(tmpdir(), "deskform-bundle-"));
  const systemIcon =
    "/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericApplicationIcon.icns";
  const image = join(directory, "source.png");
  const icon = join(directory, "icons/AppIcon.icns");
  const bundle = join(directory, "dist/Example.app");
  try {
    const makeImage = Bun.spawnSync([
      "/usr/bin/sips",
      "-s",
      "format",
      "png",
      "-z",
      "512",
      "512",
      systemIcon,
      "--out",
      image,
    ]);
    expect(makeImage.exitCode).toBe(0);
    const makeIcon = Bun.spawnSync([
      process.execPath,
      resolve("packages/tooling/src/cli.ts"),
      "icon",
      image,
      "--outfile",
      icon,
    ]);
    expect(makeIcon.exitCode).toBe(0);
    const unpack = Bun.spawnSync([
      "/usr/bin/iconutil",
      "--convert",
      "iconset",
      "--output",
      join(directory, "verify.iconset"),
      icon,
    ]);
    expect(unpack.exitCode).toBe(0);
    expect(
      readFileSync(join(directory, "verify.iconset/icon_512x512@2x.png")).length,
    ).toBeGreaterThan(0);
    const repeat = Bun.spawnSync([
      process.execPath,
      resolve("packages/tooling/src/cli.ts"),
      "icon",
      image,
      "--outfile",
      icon,
    ]);
    expect(repeat.exitCode).not.toBe(0);
    const command = Bun.spawn(
      [
        process.execPath,
        resolve("packages/tooling/src/cli.ts"),
        "bundle",
        resolve("tests/fixtures/entry.tsx"),
        "--outfile",
        bundle,
        "--name",
        "Example & Co",
        "--id",
        "dev.example.bundle",
        "--icon",
        icon,
      ],
      { stdout: "pipe", stderr: "pipe" },
    );
    const errors = await new Response(command.stderr).text();
    expect(await command.exited).toBe(0);
    expect(errors).toBe("");
    expect(readFileSync(join(bundle, "Contents/Resources/AppIcon.icns"))).toEqual(
      readFileSync(icon),
    );
    const plist = Bun.spawnSync(["/usr/bin/plutil", "-lint", join(bundle, "Contents/Info.plist")]);
    expect(plist.exitCode).toBe(0);
    expect(readFileSync(join(bundle, "Contents/Info.plist"), "utf8")).toContain("Example &amp; Co");
    const app = await launch({ command: join(bundle, "Contents/MacOS/app"), cwd: directory });
    try {
      await app.getByTestId("action").click();
      expect(await app.getByTestId("count").textContent()).toBe("1");
    } finally {
      await app.close();
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}, 30000);
