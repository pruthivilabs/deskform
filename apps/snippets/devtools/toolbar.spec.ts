import { expect, test } from "@playwright/test";
import { launch } from "@gpuix/react/automation";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { toolbarSchema } from "../src/toolbar-values";

const appDirectory = resolve(import.meta.dirname, "..");
const bridge = join(appDirectory, ".deskform", "toolbar.json");

test("a real DialKit slider changes the running native toolbar", async ({ page }) => {
  const previous = existsSync(bridge) ? readFileSync(bridge, "utf8") : null;
  const directory = mkdtempSync(join(tmpdir(), "deskform-dialkit-"));
  const app = await launch({
    command: "bun",
    args: ["src/main.tsx"],
    cwd: appDirectory,
    env: { NODE_ENV: "development", DESKFORM_DATA_DIR: directory, DESKFORM_DEVTOOLS_FILE: bridge },
  });
  try {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expect(page.getByRole("status")).toHaveText("Applied to native development toolbar");
    const height = page.getByRole("slider", { name: "Height", exact: true });
    await height.focus();
    await page.keyboard.press("ArrowRight");
    await expect
      .poll(() => toolbarSchema.parse(JSON.parse(readFileSync(bridge, "utf8"))).height)
      .toBe(65);
    await expect
      .poll(async () => (await app.getByTestId("editor-toolbar").bounds()).height)
      .toBe(65);
    mkdirSync(join(appDirectory, "output"), { recursive: true });
    await page.screenshot({ path: join(appDirectory, "output", "dialkit-workshop.png") });
    await app.screenshot({ path: join(appDirectory, "output", "dialkit-native.png") });
    expect(errors).toEqual([]);
  } finally {
    await page.close();
    await app.close();
    if (previous !== null) writeFileSync(bridge, previous);
    else rmSync(bridge, { force: true });
    rmSync(directory, { recursive: true, force: true });
  }
});
