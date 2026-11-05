import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

if (process.platform !== "darwin" || process.arch !== "arm64") {
  throw new Error(
    "The verified production build currently targets macOS arm64. Add and verify another published addon target before expanding this build.",
  );
}
const nativeRequire = createRequire(import.meta.resolve("@gpuix/native"));
const addon = nativeRequire.resolve("@gpuix/native-darwin-arm64");
const result = await Bun.build({
  entrypoints: [resolve(import.meta.dirname, "../src/main.tsx")],
  target: "bun",
  compile: { outfile: resolve(import.meta.dirname, "../dist/deskform-snippets") },
  minify: true,
  define: { "process.env.NODE_ENV": '"production"' },
  plugins: [
    {
      name: "gpuix-published-native-addon",
      setup(build) {
        build.onResolve({ filter: /^@gpuix\/native$/ }, () => ({
          path: "binding",
          namespace: "deskform-native",
        }));
        build.onLoad({ filter: /.*/, namespace: "deskform-native" }, () => ({
          loader: "js",
          contents: `import binding from ${JSON.stringify(addon)};
export const { AvailableUpdate, GpuixRenderer, TestGpuixRenderer, checkUpdate, hasTestGpuixRenderer, isTerminal } = binding;
export const __napiBindingTarget = "native";`,
        }));
      },
    },
  ],
});
if (!result.success) throw new AggregateError(result.logs, "Native build failed");

const gpuixRequire = createRequire(import.meta.resolve("@gpuix/react"));
const reconciler = gpuixRequire.resolve("react-reconciler");
const reconcilerRequire = createRequire(reconciler);
const dependencies: [string, string][] = [
  ["@gpuix/react (Apache-2.0)", import.meta.resolve("@gpuix/react")],
  [
    "@gpuix/native including the published addon (Apache-2.0)",
    import.meta.resolve("@gpuix/native"),
  ],
  ["React (MIT)", import.meta.resolve("react")],
  ["react-reconciler (MIT)", reconciler],
  ["scheduler (MIT)", reconcilerRequire.resolve("scheduler")],
  ["Zod (MIT)", import.meta.resolve("zod")],
];
let notices = "Deskform Snippets — bundled dependency licenses\n";
for (const [name, entry] of dependencies) {
  let directory = dirname(entry.startsWith("file:") ? fileURLToPath(entry) : entry);
  while (!existsSync(resolve(directory, "LICENSE"))) {
    const parent = dirname(directory);
    if (parent === directory) throw new Error(`Missing license for ${name}`);
    directory = parent;
  }
  notices += `\n--- ${name} ---\n${readFileSync(resolve(directory, "LICENSE"), "utf8")}\n`;
}
const bunLicense = Bun.spawn([process.execPath, "--license"], { stdout: "pipe", stderr: "pipe" });
const runtimeLicense = await new Response(bunLicense.stdout).text();
if ((await bunLicense.exited) !== 0) throw new Error("Could not collect the Bun runtime license");
notices += `\n--- Bun runtime ---\n${runtimeLicense}\n`;
writeFileSync(resolve(import.meta.dirname, "../dist/THIRD_PARTY_NOTICES.txt"), notices);
process.stdout.write("Built dist/deskform-snippets and THIRD_PARTY_NOTICES.txt.\n");
