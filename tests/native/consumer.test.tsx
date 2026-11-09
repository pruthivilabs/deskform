import { expect, test } from "bun:test";
import { launch } from "@gpuix/react/automation";
import { join } from "node:path";
import { createStandaloneConsumer } from "../support/consumer";

test("packed framework packages install and run in a standalone consumer", async () => {
  const consumer = await createStandaloneConsumer();
  try {
    await consumer.run(["run", "check"]);
    await consumer.run(["run", "test:native"]);
    await consumer.run(["run", "build"]);
    const app = await launch({
      command: join(consumer.directory, "dist/utility"),
      cwd: consumer.directory,
    });
    try {
      expect(await app.getByTestId("page-title").textContent()).toBe("Workspace");
      await app.getByTestId("settings").click();
      expect(await app.getByTestId("page-title").textContent()).toBe("Settings");
    } finally {
      await app.close();
    }
  } finally {
    consumer.dispose();
  }
}, 60000);
