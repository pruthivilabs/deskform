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
    await app.getByTestId("title").fill("Deploy command");
    await app.getByTestId("content").fill("bun run build");
    expect(await app.getByTestId("character-count").textContent()).toBe("13 characters");
    await app.getByTestId("content").press("cmd-n");
    expect(await app.getByTestId("character-count").textContent()).toBe("0 characters");
    expect(root.renderer.getFocusedElementId()).toBe((await app.getByTestId("title").element()).id);
    await app.getByTestId("title").press("cmd-f");
    expect(root.renderer.getFocusedElementId()).toBe(
      (await app.getByTestId("search").element()).id,
    );
  } finally {
    await app.close();
    root.unmount();
  }
});
