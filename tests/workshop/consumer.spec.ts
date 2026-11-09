import { expect, test } from "@playwright/test";
import { launch } from "@gpuix/react/automation";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { toolbarSchema } from "@deskform/tooling/toolbar";
import { bunExecutable, createStandaloneConsumer } from "../support/consumer";

test("packed workshop tooling tunes a standalone native consumer", async ({ page }) => {
  test.setTimeout(60000);
  const consumer = await createStandaloneConsumer();
  const tuningFile = join(consumer.directory, ".deskform", "consumer-tuning.json");
  const origin = "http://127.0.0.1:4328";
  const environment = {
    ...process.env,
    NODE_ENV: "development",
    DESKFORM_TUNING_FILE: tuningFile,
    DESKFORM_WORKSHOP_PORT: "4328",
  };
  const server = spawn(bunExecutable, ["run", "dev:tools"], {
    cwd: consumer.directory,
    env: environment,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let serverOutput = "";
  server.stdout.setEncoding("utf8").on("data", (chunk: string) => {
    serverOutput += chunk;
  });
  server.stderr.setEncoding("utf8").on("data", (chunk: string) => {
    serverOutput += chunk;
  });
  const stopped = new Promise<void>((done) => {
    server.once("exit", () => done());
  });
  try {
    try {
      await expect
        .poll(
          async () => {
            if (server.exitCode !== null) throw new Error("Packed workshop exited");
            try {
              const response = await fetch(origin);
              return response.ok ? "ready" : `${response.status}: ${await response.text()}`;
            } catch {
              return "unreachable";
            }
          },
          { timeout: 15000 },
        )
        .toBe("ready");
    } catch (error) {
      throw new Error(`Packed workshop did not become ready:\n${serverOutput}`, { cause: error });
    }
    const app = await launch({
      command: bunExecutable,
      args: ["src/main.tsx"],
      cwd: consumer.directory,
      env: environment,
    });
    try {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(origin);
      await expect(page.getByRole("status")).toHaveText("Applied to native development toolbar");
      expect((await app.getByTestId("toolbar").bounds()).height).toBe(64);
      await page.getByRole("slider", { name: "Height", exact: true }).focus();
      await page.keyboard.press("ArrowRight");
      await expect
        .poll(() => toolbarSchema.parse(JSON.parse(readFileSync(tuningFile, "utf8"))).height)
        .toBe(65);
      await expect.poll(async () => (await app.getByTestId("toolbar").bounds()).height).toBe(65);
      expect(errors).toEqual([]);
    } finally {
      await app.close();
    }
  } finally {
    await page.close();
    if (server.pid && server.exitCode === null) process.kill(-server.pid, "SIGTERM");
    await stopped;
    consumer.dispose();
  }
});
