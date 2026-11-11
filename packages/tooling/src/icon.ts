import { constants, copyFileSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";

function command(args: string[]): string {
  const result = Bun.spawnSync(args, { stdout: "pipe", stderr: "pipe" });
  if (result.exitCode !== 0)
    throw new Error(`${args[0]} failed: ${result.stderr.toString().trim()}`);
  return result.stdout.toString();
}

/** Convert a square PNG into a macOS iconset using the system image tools. */
export function createMacIcon(source: string, outfile: string): void {
  if (process.platform !== "darwin") throw new Error("Icon conversion requires macOS.");
  if (extname(outfile).toLowerCase() !== ".icns") throw new Error("Icon output must end in .icns.");
  const input = resolve(source);
  const info = command([
    "/usr/bin/sips",
    "-g",
    "format",
    "-g",
    "pixelWidth",
    "-g",
    "pixelHeight",
    input,
  ]);
  const width = Number(info.match(/pixelWidth:\s*(\d+)/)?.[1]);
  const height = Number(info.match(/pixelHeight:\s*(\d+)/)?.[1]);
  if (!/format:\s*png\b/.test(info) || !Number.isFinite(width) || width !== height || width < 512) {
    throw new Error("Provide a square PNG of at least 512 × 512 pixels.");
  }
  const temporary = mkdtempSync(join(tmpdir(), "deskform-icon-"));
  try {
    const iconset = join(temporary, "AppIcon.iconset");
    mkdirSync(iconset);
    for (const size of [16, 32, 128, 256, 512]) {
      for (const scale of [1, 2]) {
        const pixels = String(size * scale);
        const suffix = scale === 2 ? "@2x" : "";
        command([
          "/usr/bin/sips",
          "-z",
          pixels,
          pixels,
          input,
          "--out",
          join(iconset, `icon_${size}x${size}${suffix}.png`),
        ]);
      }
    }
    const generated = join(temporary, "AppIcon.icns");
    command(["/usr/bin/iconutil", "--convert", "icns", "--output", generated, iconset]);
    const destination = resolve(outfile);
    mkdirSync(dirname(destination), { recursive: true });
    copyFileSync(generated, destination, constants.COPYFILE_EXCL);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}
