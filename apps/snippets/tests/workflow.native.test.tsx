import { expect, test } from "bun:test";
import { connectTest } from "@gpuix/react/automation";
import { createTestRoot } from "@gpuix/react/testing";
import { App } from "../src/app";

test("users create, search, select, copy and confirm deletion through native controls", async () => {
  const root = createTestRoot({ width: 1000, height: 700, keyboardFocusDim: false });
  const app = await connectTest(root.renderer);
  const copies: string[] = [];
  try {
    root.render(
      <App
        copyText={async (text) => {
          copies.push(text);
        }}
      />,
    );
    await app.getByTestId("new-snippet").click();
    await app.getByTestId("title").fill("Deploy");
    await app.getByTestId("content").fill("bun run build");
    await app.getByTestId("new-snippet").click();
    await app.getByTestId("title").fill("Coffee");
    await app.getByTestId("content").fill("Café ☕\nBreak time");
    await app.getByTestId("search").fill("DEPLOY build");
    expect(await app.getByText("Deploy").count()).toBe(1);
    expect(await app.getByText("Coffee").count()).toBe(0);
    await app.getByText("Deploy").click();
    await app.getByTestId("content").press("cmd-shift-c");
    expect(copies).toEqual(["bun run build"]);
    await app.getByTestId("content").press("cmd-shift-backspace");
    expect(root.renderer.getFocusedElementId()).toBe(
      (await app.getByTestId("cancel-delete").element()).id,
    );
    await app.getByTestId("cancel-delete").press("escape");
    expect(await app.getByText("Deploy").count()).toBe(1);
    await app.getByTestId("delete-snippet").click();
    root.renderer.simulateKeystrokes("tab");
    expect(root.renderer.getFocusedElementId()).toBe(
      (await app.getByTestId("confirm-delete").element()).id,
    );
    await app.getByTestId("confirm-delete").click();
    expect(await app.getByText("Deploy").count()).toBe(0);
    await app.getByTestId("search").fill("");
    expect(await app.getByText("Coffee").count()).toBe(1);
    expect(await app.getByTestId("character-count").textContent()).toBe("17 characters");
  } finally {
    await app.close();
    root.unmount();
  }
});

test.each([
  { width: 760, height: 500 },
  { width: 1440, height: 900 },
])("the editor keeps its primary actions within the supported window: %p", async (size) => {
  const root = createTestRoot({ ...size, keyboardFocusDim: false });
  const app = await connectTest(root.renderer);
  try {
    root.render(<App />);
    await app.getByTestId("new-snippet").click();
    await app
      .getByTestId("title")
      .fill(
        "A long snippet title that must fit in the sidebar and remain editable in a small window",
      );
    for (const id of ["title", "content", "copy-snippet", "delete-snippet", "character-count"]) {
      const box = await app.getByTestId(id).bounds();
      expect(box.width).toBeGreaterThan(0);
      expect(box.height).toBeGreaterThan(0);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(size.width);
      expect(box.y + box.height).toBeLessThanOrEqual(size.height);
    }
  } finally {
    await app.close();
    root.unmount();
  }
});
