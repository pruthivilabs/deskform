import { expect, test } from "bun:test";
import { launch } from "@gpuix/react/automation";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

test("a real native window launches and accepts a pointer action", async () => {
  const app = await launch({ command: process.execPath, args: ["src/main.tsx"] });
  try {
    await app.getByTestId("new-snippet").click();
    await app.getByTestId("title").fill("A useful command");
    await app.getByTestId("content").fill("bun run check");
    expect(await app.getByTestId("character-count").textContent()).toBe("13 characters");
    mkdirSync("output", { recursive: true });
    await app.screenshot({ path: "output/native-startup.png" });
  } finally {
    await app.close();
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
