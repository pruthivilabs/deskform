#!/usr/bin/env bun
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildNativeApplication } from "./build";
import { buildMacBundle } from "./bundle";
import { createMacIcon } from "./icon";

const [command, entrypoint, ...args] = process.argv.slice(2);
function valueAfter(flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index < 0 ? undefined : args[index + 1];
}
async function run(args: string[], env = process.env): Promise<void> {
  const child = Bun.spawn(args, { stdin: "inherit", stdout: "inherit", stderr: "inherit", env });
  process.on("SIGINT", () => child.kill("SIGINT"));
  process.on("SIGTERM", () => child.kill("SIGTERM"));
  process.exitCode = await child.exited;
}
if (command === "icon") {
  const outfile = valueAfter("--outfile");
  if (!entrypoint || !outfile)
    throw new Error("Usage: deskform icon <square.png> --outfile <icon.icns>");
  createMacIcon(entrypoint, outfile);
} else if (command === "bundle") {
  const outfile = valueAfter("--outfile");
  const name = valueAfter("--name");
  const id = valueAfter("--id");
  const icon = valueAfter("--icon");
  if (!entrypoint || !outfile || !name || !id || !icon)
    throw new Error(
      "Usage: deskform bundle <entry.tsx> --outfile <name.app> --name <name> --id <bundle-id> --icon <icon.icns>",
    );
  await buildMacBundle({ entrypoint, outfile, name, id, icon });
} else if (command === "build") {
  const outfile = valueAfter("--outfile");
  if (!entrypoint || !outfile)
    throw new Error("Usage: deskform build <entry.tsx> --outfile <executable>");
  await buildNativeApplication({ entrypoint, outfile });
} else if (command === "dev") {
  if (!entrypoint) throw new Error("Usage: deskform dev <entry.tsx>");
  await run([process.execPath, "--hot", resolve(entrypoint)], {
    ...process.env,
    NODE_ENV: "development",
    DESKFORM_TUNING_FILE: process.env.DESKFORM_TUNING_FILE ?? resolve(".deskform/toolbar.json"),
  });
} else if (command === "devtools") {
  const vp = resolve(dirname(fileURLToPath(import.meta.resolve("vite-plus"))), "../bin/vp");
  await run(
    [
      vp,
      "dev",
      "--configLoader",
      "runner",
      "--config",
      fileURLToPath(new URL("./workshop-config.ts", import.meta.url)),
    ],
    {
      ...process.env,
      DESKFORM_TUNING_FILE: process.env.DESKFORM_TUNING_FILE ?? resolve(".deskform/toolbar.json"),
    },
  );
} else {
  process.stderr.write("Usage: deskform <build|bundle|icon|dev|devtools> [entry.tsx] [options]\n");
  process.exitCode = 1;
}
