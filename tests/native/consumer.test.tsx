import { expect, test } from "bun:test";
import { launch } from "@gpuix/react/automation";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createStandaloneConsumer } from "../support/consumer";
import ui from "../../packages/ui/package.json" with { type: "json" };

test("packed framework packages install and run in a standalone consumer", async () => {
  const consumer = await createStandaloneConsumer();
  try {
    await consumer.run(["run", "check"]);
    await consumer.run(["run", "test:native"]);
    await consumer.run(["run", "build"]);
    const app = await launch({
      command: join(consumer.directory, "dist/utility"),
      cwd: consumer.directory,
    });
    try {
      expect(await app.getByTestId("page-title").textContent()).toBe("Workspace");
      await app.getByTestId("settings").click();
      expect(await app.getByTestId("page-title").textContent()).toBe("Settings");
    } finally {
      await app.close();
    }
  } finally {
    consumer.dispose();
  }
}, 60000);

test("create command makes an independent project and refuses to overwrite it", async () => {
  const directory = mkdtempSync(join(tmpdir(), "deskform-create-"));
  const project = join(directory, "example");
  async function run(args: string[], cwd: string) {
    const child = Bun.spawn([process.execPath, ...args], { cwd, stdout: "pipe", stderr: "pipe" });
    const [stdout, stderr, status] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    return { status, output: stdout + stderr };
  }
  try {
    const created = await run([resolve("scripts/create.ts"), project], process.cwd());
    expect(created.status).toBe(0);
    expect(existsSync(join(project, `vendor/deskform-ui-${ui.version}.tgz`))).toBe(true);
    const install = await run(["install"], project);
    if (install.status !== 0) throw new Error(install.output);
    const check = await run(["run", "check"], project);
    if (check.status !== 0) throw new Error(check.output);
    const duplicate = await run([resolve("scripts/create.ts"), project], process.cwd());
    expect(duplicate.status).not.toBe(0);
    expect(existsSync(join(project, "src/app.tsx"))).toBe(true);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}, 60000);
