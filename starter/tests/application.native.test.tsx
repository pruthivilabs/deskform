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
    await app.getByTestId("appearance-light").click();
    await app.getByTestId("appearance-light").press("left");
    await app.getByTestId("sidebar-width").press("left");
    expect(await app.getByTestId("sidebar-width-value").textContent()).toBe("280 px");
    expect((await app.getByTestId("sidebar").bounds()).width).toBe(280);
    await app.getByTestId("settings").press("cmd-1");
    expect(await app.getByTestId("page-title").textContent()).toBe("Workspace");
    await app.getByTestId("toggle-sidebar").click();
    expect(await app.getByTestId("sidebar").count()).toBe(0);
    await app.getByTestId("toggle-sidebar").click();
    expect(await app.getByTestId("sidebar").count()).toBe(1);
  } finally {
    await app.close();
    root.unmount();
  }
});

test("sidebar setting reflects the available window width", async () => {
  const root = createTestRoot({ width: 760, height: 500, keyboardFocusDim: false });
  const app = await connectTest(root.renderer);
  try {
    root.render(<App />);
    await app.getByTestId("settings").click();
    await app.getByTestId("sidebar-width").press("end");
    expect(await app.getByTestId("sidebar-width-value").textContent()).toBe("342 px");
    expect((await app.getByTestId("sidebar").bounds()).width).toBe(342);
  } finally {
    await app.close();
    root.unmount();
  }
});
