import { expect, test } from "bun:test";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import { App } from "../src/app";

test("the native app responds to pointer and keyboard activation", async () => {
  const root = createTestRoot({ width: 1000, height: 700 });
  const app = await connectTest(root.renderer);
  try {
    root.render(<App />);
    await app.getByTestId("new-snippet").click();
    expect(await app.getByTestId("count").textContent()).toBe("Created: 1");
    await app.getByTestId("new-snippet").press("enter");
    expect(await app.getByTestId("count").textContent()).toBe("Created: 2");
  } finally {
    await app.close();
    root.unmount();
  }
});
