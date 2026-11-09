import { defineConfig } from "vite-plus";
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { toolbarSchema } from "./toolbar-values";

export interface WorkshopOptions {
  tuningFile: string;
  port?: number;
}
export function createWorkshopConfig({ tuningFile, port = 4317 }: WorkshopOptions) {
  const path = resolve(tuningFile);
  return defineConfig({
    root: fileURLToPath(new URL("../workshop", import.meta.url)),
    server: { host: "127.0.0.1", port, strictPort: true },
    plugins: [
      {
        name: "deskform-toolbar-channel",
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
              mkdirSync(dirname(path), { recursive: true });
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
}
