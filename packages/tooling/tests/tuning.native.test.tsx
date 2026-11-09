import { expect, test } from "bun:test";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { useToolbarTuning } from "../src/tuning";
import { defaultToolbar } from "../src/toolbar-values";

test("removing a tuning channel restores native defaults", async () => {
  const directory = mkdtempSync(join(tmpdir(), "deskform-tuning-"));
  const path = join(directory, "toolbar.json");
  writeFileSync(path, JSON.stringify({ ...defaultToolbar, height: 80 }));
  const root = createTestRoot({ width: 400, height: 240 });
  const app = await connectTest(root.renderer);
  function Fixture({ path }: { path?: string }) {
    const values = useToolbarTuning(path);
    return (
      <text testId="height" style={{ fontSize: 14 }}>
        {String(values.height)}
      </text>
    );
  }
  async function settle(expected: string) {
    let value = "";
    for (let attempt = 0; attempt < 20; attempt++) {
      value = await app.getByTestId("height").textContent();
      if (value === expected) break;
      await Bun.sleep(10);
    }
    return value;
  }
  try {
    root.render(<Fixture path={path} />);
    expect(await settle("80")).toBe("80");
    root.render(<Fixture />);
    expect(await settle("64")).toBe("64");
  } finally {
    await app.close();
    root.unmount();
    rmSync(directory, { recursive: true, force: true });
  }
});
