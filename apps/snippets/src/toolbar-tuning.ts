import { readFileSync, watchFile, unwatchFile } from "node:fs";
import { resolve } from "node:path";
import { useEffect, useState } from "react";
import { defaultToolbar, toolbarSchema, type ToolbarValues } from "./toolbar-values";

export function useToolbarTuning(): ToolbarValues {
  const [values, setValues] = useState(defaultToolbar);
  useEffect(() => {
    if (process.env.NODE_ENV === "production" || !process.env.DESKFORM_DEVTOOLS_FILE) return;
    const path = resolve(process.env.DESKFORM_DEVTOOLS_FILE);
    const read = () => {
      try {
        setValues(toolbarSchema.parse(JSON.parse(readFileSync(path, "utf8"))));
      } catch {
        setValues(defaultToolbar);
      }
    };
    read();
    watchFile(path, { interval: 100, persistent: false }, read);
    return () => unwatchFile(path, read);
  }, []);
  return values;
}
