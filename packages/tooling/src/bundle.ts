import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { buildNativeApplication } from "./build";

export interface MacBundleOptions {
  entrypoint: string;
  outfile: string;
  name: string;
  id: string;
  icon: string;
}

const xml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

/** Build an unsigned macOS application bundle with a consumer-supplied ICNS icon. */
export async function buildMacBundle({
  entrypoint,
  outfile,
  name,
  id,
  icon,
}: MacBundleOptions): Promise<void> {
  if (process.platform !== "darwin" || process.arch !== "arm64")
    throw new Error("App bundles currently require macOS arm64.");
  if (
    extname(outfile) !== ".app" ||
    !name.trim() ||
    !/^[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(id)
  )
    throw new Error("Provide an .app destination, a name, and a reverse-DNS bundle identifier.");
  const iconData = readFileSync(resolve(icon));
  if (
    iconData.length < 8 ||
    iconData.toString("ascii", 0, 4) !== "icns" ||
    iconData.readUInt32BE(4) !== iconData.length
  )
    throw new Error("Icon must be a valid .icns file.");
  const bundle = resolve(outfile);
  mkdirSync(dirname(bundle), { recursive: true });
  mkdirSync(bundle);
  const contents = resolve(bundle, "Contents");
  const macos = resolve(contents, "MacOS");
  const resources = resolve(contents, "Resources");
  mkdirSync(macos, { recursive: true });
  mkdirSync(resources);
  await buildNativeApplication({ entrypoint, outfile: resolve(macos, "app") });
  copyFileSync(resolve(icon), resolve(resources, "AppIcon.icns"));
  writeFileSync(
    resolve(contents, "Info.plist"),
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleName</key><string>${xml(name)}</string>
<key>CFBundleDisplayName</key><string>${xml(name)}</string>
<key>CFBundleIdentifier</key><string>${xml(id)}</string>
<key>CFBundleExecutable</key><string>app</string>
<key>CFBundleIconFile</key><string>AppIcon</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleVersion</key><string>1</string>
<key>CFBundleShortVersionString</key><string>1.0</string>
</dict></plist>\n`,
  );
}
