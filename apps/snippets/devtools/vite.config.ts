import { defineConfig } from "vite-plus";
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { toolbarSchema } from "../src/toolbar-values";

export default defineConfig({
  root: import.meta.dirname,
  server: { host: "127.0.0.1", port: 4317, strictPort: true },
  plugins: [
    {
      name: "deskform-native-toolbar",
      configureServer(server) {
        server.middlewares.use("/__deskform/toolbar", async (request, response) => {
          if (request.method !== "POST") {
            response.writeHead(405).end();
            return;
          }
          if (request.headers.origin !== `http://${request.headers.host}`) {
            response.writeHead(403).end();
            return;
          }
          try {
            let body = "";
            for await (const chunk of request) {
              body += String(chunk);
              if (body.length > 2048) {
                response.writeHead(413).end();
                return;
              }
            }
            const values = toolbarSchema.parse(JSON.parse(body));
            const directory = resolve(import.meta.dirname, "../.deskform");
            mkdirSync(directory, { recursive: true });
            const path = resolve(directory, "toolbar.json");
            writeFileSync(`${path}.tmp`, JSON.stringify(values));
            renameSync(`${path}.tmp`, path);
            response.writeHead(204).end();
          } catch {
            response.writeHead(400).end("Invalid toolbar values");
          }
        });
      },
    },
  ],
});
