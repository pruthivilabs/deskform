import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname, "../..");
export default defineConfig({
  testDir: ".",
  testMatch: "toolbar.spec.ts",
  workers: 1,
  timeout: 30_000,
  outputDir: "../../output/playwright",
  reporter: "list",
  use: { channel: "chromium", baseURL: "http://127.0.0.1:4327", trace: "retain-on-failure" },
  webServer: {
    command: "bun run dev:workshop",
    cwd: root,
    url: "http://127.0.0.1:4327",
    reuseExistingServer: false,
    timeout: 15000,
    env: {
      DESKFORM_TUNING_FILE: resolve(root, "output/workshop-tuning.json"),
      DESKFORM_WORKSHOP_PORT: "4327",
    },
  },
});
