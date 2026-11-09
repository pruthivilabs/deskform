import { expect, test } from "bun:test";
import { launch } from "@gpuix/react/automation";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
test("the framework-built executable works outside the checkout", async () => {
  const directory = mkdtempSync(join(tmpdir(), "deskform-production-"));
  const app = await launch({ command: resolve("output/deskform-fixture"), cwd: directory });
  try {
    await app.getByTestId("input").fill("Standalone consumer");
    expect(await app.getByTestId("echo").textContent()).toBe("Standalone consumer");
    await app.getByTestId("action").click();
    expect(await app.getByTestId("count").textContent()).toBe("1");
  } finally {
    await app.close();
    rmSync(directory, { recursive: true, force: true });
  }
}, 20000);
