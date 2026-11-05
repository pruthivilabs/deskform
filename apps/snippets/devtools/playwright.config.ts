import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";
export default defineConfig({
  testDir: ".",
  testMatch: "toolbar.spec.ts",
  workers: 1,
  timeout: 30_000,
  outputDir: "../output/playwright",
  reporter: "list",
  use: { channel: "chromium", baseURL: "http://127.0.0.1:4317", trace: "retain-on-failure" },
  webServer: {
    command: "bun run dev:tools",
    cwd: resolve(import.meta.dirname, ".."),
    url: "http://127.0.0.1:4317",
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },
});
