import { expect, test } from "@playwright/test";
import { launch } from "@gpuix/react/automation";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { toolbarSchema } from "@deskform/tooling/toolbar";
const root = resolve(import.meta.dirname, "../..");
const tuningFile = resolve(root, "output/workshop-tuning.json");
test("DialKit tunes an independently launched native consumer", async ({ page }) => {
  const app = await launch({
    command: "bun",
    args: ["tests/fixtures/entry.tsx"],
    cwd: root,
    env: { NODE_ENV: "development", DESKFORM_TUNING_FILE: tuningFile },
  });
  try {
    await page.goto("/");
    await expect(page.getByRole("status")).toHaveText("Applied to native development toolbar");
    await page.getByRole("slider", { name: "Height", exact: true }).focus();
    await page.keyboard.press("ArrowRight");
    await expect
      .poll(() => toolbarSchema.parse(JSON.parse(readFileSync(tuningFile, "utf8"))).height)
      .toBe(65);
    await expect.poll(async () => (await app.getByTestId("toolbar").bounds()).height).toBe(65);
    mkdirSync(resolve(root, "output"), { recursive: true });
    await page.screenshot({ path: resolve(root, "output/workshop.png") });
  } finally {
    await page.close();
    await app.close();
    rmSync(tuningFile, { force: true });
  }
});
