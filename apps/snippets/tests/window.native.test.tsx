import { expect, test } from "bun:test";
import { clipboard } from "@deskform/runtime";
import { launch } from "@gpuix/react/automation";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("a real native window saves edits and restores them after process restart", async () => {
  const readClipboard = async () => new Response(Bun.spawn(["/usr/bin/pbpaste"]).stdout).text();
  const previousClipboard = await readClipboard();
  const directory = mkdtempSync(join(tmpdir(), "deskform-window-"));
  const app = await launch({
    command: process.execPath,
    args: ["src/main.tsx"],
    env: { DESKFORM_DATA_DIR: directory },
  });
  try {
    await app.getByTestId("new-snippet").click();
    await app.getByTestId("title").fill("A useful command");
    await app.getByTestId("content").fill("bun run check");
    expect(await app.getByTestId("character-count").textContent()).toBe("13 characters");
    mkdirSync("output", { recursive: true });
    await app.screenshot({ path: "output/native-startup.png" });
    await app.getByTestId("copy-snippet").click();
    let copied = "";
    for (let attempt = 0; attempt < 40; attempt++) {
      copied = await readClipboard();
      if (copied === "bun run check") break;
      await Bun.sleep(25);
    }
    expect(copied).toBe("bun run check");
    const saved = JSON.parse(readFileSync(join(directory, "snippets.json"), "utf8"));
    expect(saved.snippets[0].title).toBe("A useful command");
    expect(saved.snippets[0].content).toBe("bun run check");
    await app.close();
    const restored = await launch({
      command: process.execPath,
      args: ["src/main.tsx"],
      env: { DESKFORM_DATA_DIR: directory },
    });
    try {
      expect(await restored.getByTestId("character-count").textContent()).toBe("13 characters");
      expect(await restored.getByTestId(`snippet-${saved.selectedId}`).textContent()).toBe(
        "A useful commandbun run check",
      );
      await restored.getByTestId("content").press("end");
      await restored.getByTestId("content").press("x");
      expect(await restored.getByTestId("character-count").textContent()).toBe("14 characters");
      expect(
        JSON.parse(readFileSync(join(directory, "snippets.json"), "utf8")).snippets[0].content,
      ).toBe("bun run checkx");
      await restored.getByTestId("delete-snippet").click();
      await restored.getByTestId("confirm-delete").click();
      expect(await restored.getByTestId("title").count()).toBe(0);
      expect(JSON.parse(readFileSync(join(directory, "snippets.json"), "utf8")).snippets).toEqual(
        [],
      );
    } finally {
      await restored.close();
    }
  } finally {
    await app.close();
    await clipboard.write(previousClipboard);
    rmSync(directory, { recursive: true, force: true });
  }
}, 20_000);

test("bun --hot remounts content in the existing native window", async () => {
  mkdirSync(".deskform", { recursive: true });
  const directory = mkdtempSync(".deskform/reload-");
  const entry = join(directory, "main.tsx");
  const source = (label: string) => `import { render } from "@gpuix/react";
render(<text testId="reload-label" style={{color:"#ffffff",fontSize:20}}>${label}</text>, {title:"Deskform reload verification",width:400,height:240});`;
  writeFileSync(entry, source("Before reload"));
  const app = await launch({ command: process.execPath, args: ["--hot", entry] });
  try {
    expect(await app.getByTestId("reload-label").textContent()).toBe("Before reload");
    writeFileSync(entry, source("After reload"));
    let value = "";
    for (let attempt = 0; attempt < 50; attempt++) {
      value = await app.getByTestId("reload-label").textContent();
      if (value === "After reload") break;
      await Bun.sleep(100);
    }
    expect(value).toBe("After reload");
  } finally {
    await app.close();
    rmSync(directory, { recursive: true, force: true });
  }
}, 20_000);
