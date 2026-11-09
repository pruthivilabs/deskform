import { resolve } from "node:path";
import { createWorkshopConfig } from "./vite";
const tuningFile = process.env.DESKFORM_TUNING_FILE ?? resolve(".deskform/toolbar.json");
const port = Number(process.env.DESKFORM_WORKSHOP_PORT ?? "4317");
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error("Invalid workshop port");
export default createWorkshopConfig({ tuningFile, port });
