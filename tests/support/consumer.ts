import { spawn } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import manifest from "../../starter/package.json" with { type: "json" };
import runtime from "../../packages/runtime/package.json" with { type: "json" };
import tokens from "../../packages/tokens/package.json" with { type: "json" };
import tooling from "../../packages/tooling/package.json" with { type: "json" };
import ui from "../../packages/ui/package.json" with { type: "json" };

const root = resolve(import.meta.dirname, "../..");
export const bunExecutable = process.versions.bun ? process.execPath : "bun";

export async function createStandaloneConsumer() {
  const dependencies = { ...manifest.dependencies, ...manifest.devDependencies };
  const overrides: Record<string, string> = { ...manifest.overrides };
  for (const [directory, framework] of Object.entries({ tokens, ui, runtime, tooling })) {
    const filename = `${framework.name.replace("@", "").replace("/", "-")}-${framework.version}.tgz`;
    const archive = resolve(root, `packages/${directory}/dist/${filename}`);
    if (!existsSync(archive)) throw new Error(`Missing ${archive}; run bun run pack first.`);
    Object.assign(dependencies, { [framework.name]: `file:${archive}` });
    overrides[framework.name] = `file:${archive}`;
  }
  const directory = mkdtempSync(join(tmpdir(), "deskform-consumer-"));
  const dispose = () => rmSync(directory, { recursive: true, force: true });
  const run = (args: string[]): Promise<void> =>
    new Promise((done, reject) => {
      const child = spawn(bunExecutable, args, {
        cwd: directory,
        stdio: ["ignore", "pipe", "pipe"],
      });
      let output = "";
      child.stdout.setEncoding("utf8").on("data", (chunk: string) => {
        output += chunk;
      });
      child.stderr.setEncoding("utf8").on("data", (chunk: string) => {
        output += chunk;
      });
      child.once("error", reject);
      child.once("exit", (code, signal) => {
        if (code === 0) done();
        else reject(new Error(`bun ${args.join(" ")} failed (${signal ?? code})\n${output}`));
      });
    });
  try {
    cpSync(join(root, "starter"), directory, { recursive: true });
    writeFileSync(
      join(directory, "package.json"),
      JSON.stringify({ ...manifest, dependencies, overrides, devDependencies: {} }),
    );
    await run(["install"]);
    return { directory, run, dispose };
  } catch (error) {
    dispose();
    throw error;
  }
}
