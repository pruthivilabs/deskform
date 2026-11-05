import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    options: { typeAware: true, typeCheck: false },
    ignorePatterns: ["**/dist/**", "**/output/**", ".deskform/**"],
    rules: { "no-console": "error" },
  },
  fmt: { ignorePatterns: ["bun.lock", "**/dist/**", "**/output/**", ".deskform/**"] },
});
