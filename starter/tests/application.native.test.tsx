import { expect, test } from "bun:test";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import { App } from "../src/app";
test("navigation and keyboard commands change the visible page", async () => {
  const root = createTestRoot({ width: 1000, height: 700, keyboardFocusDim: false });
  const app = await connectTest(root.renderer);
  try {
    root.render(<App />);
    await app.getByTestId("settings").click();
    expect(await app.getByTestId("page-title").textContent()).toBe("Settings");
    await app.getByTestId("settings").press("cmd-1");
    expect(await app.getByTestId("page-title").textContent()).toBe("Workspace");
  } finally {
    await app.close();
    root.unmount();
  }
});
