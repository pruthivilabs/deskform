import { expect, test } from "bun:test";
import { launch } from "@gpuix/react/automation";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { documentSchema } from "../src/document";

test("the compiled executable runs outside the checkout with native editing and fixed production tokens", async () => {
  const directory = mkdtempSync(join(tmpdir(), "deskform-production-"));
  const tuning = join(directory, "toolbar.json");
  writeFileSync(tuning, JSON.stringify({ height: 88, gap: 20, padding: 32, accent: "#ff0000" }));
  const app = await launch({
    command: resolve("dist/deskform-snippets"),
    cwd: directory,
    env: { NODE_ENV: "development", DESKFORM_DATA_DIR: directory, DESKFORM_DEVTOOLS_FILE: tuning },
  });
  try {
    expect((await app.getByTestId("editor-toolbar").bounds()).height).toBe(64);
    await app.getByTestId("new-snippet").click();
    await app.getByTestId("title").fill("Production snippet");
    await app.getByTestId("content").fill("Runs without node_modules");
    expect(await app.getByTestId("character-count").textContent()).toBe("25 characters");
    const saved = documentSchema.parse(
      JSON.parse(readFileSync(join(directory, "snippets.json"), "utf8")),
    );
    expect(saved.snippets[0]?.content).toBe("Runs without node_modules");
  } finally {
    await app.close();
    rmSync(directory, { recursive: true, force: true });
  }
}, 20_000);
