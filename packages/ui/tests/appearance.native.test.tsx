import { expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { connectTest } from "@gpuix/react/automation";
import { createTestRoot } from "@gpuix/react/testing";
import { useState } from "react";
import { AppearanceProvider, AppFrame, Button, Text, type Appearance } from "../src";

test("appearance selection changes the rendered native surface", async () => {
  const directory = mkdtempSync(join(tmpdir(), "deskform-appearance-"));
  const root = createTestRoot({ width: 400, height: 240, keyboardFocusDim: false });
  const app = await connectTest(root.renderer);
  function Fixture() {
    const [appearance, setAppearance] = useState<Appearance>("dark");
    return (
      <AppearanceProvider appearance={appearance}>
        <AppFrame>
          <Text>Example</Text>
          <Button testId="appearance" onPress={() => setAppearance("light")}>
            Use light appearance
          </Button>
        </AppFrame>
      </AppearanceProvider>
    );
  }
  try {
    root.render(<Fixture />);
    root.renderer.captureScreenshot(join(directory, "dark.png"));
    await app.getByTestId("appearance").click();
    root.renderer.captureScreenshot(join(directory, "light.png"));
    const pixel = (name: string) => {
      const bmp = join(directory, `${name}.bmp`);
      const result = Bun.spawnSync([
        "/usr/bin/sips",
        "-s",
        "format",
        "bmp",
        join(directory, `${name}.png`),
        "--out",
        bmp,
      ]);
      expect(result.exitCode).toBe(0);
      const data = readFileSync(bmp);
      const offset = data.readUInt32LE(10);
      return [...data.subarray(offset, offset + 3)];
    };
    expect(pixel("dark")).not.toEqual(pixel("light"));
  } finally {
    await app.close();
    root.unmount();
    rmSync(directory, { recursive: true, force: true });
  }
});
