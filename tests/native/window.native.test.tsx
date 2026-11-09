import { expect, test } from "bun:test";
import { launch } from "@gpuix/react/automation";
import { mkdirSync } from "node:fs";
test("a consumer fixture starts a real window and responds to commands and text input", async () => {
  const app = await launch({ command: process.execPath, args: ["tests/fixtures/entry.tsx"] });
  try {
    await app.getByTestId("input").fill("Native text — Café ☕");
    expect(await app.getByTestId("echo").textContent()).toBe("Native text — Café ☕");
    await app.getByTestId("input").press("cmd-n");
    expect(await app.getByTestId("count").textContent()).toBe("1");
    await app.getByTestId("action").click();
    expect(await app.getByTestId("count").textContent()).toBe("2");
    mkdirSync("output", { recursive: true });
    await app.screenshot({ path: "output/framework-native.png" });
  } finally {
    await app.close();
  }
}, 20000);
