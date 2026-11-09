import { readFileSync, watchFile, unwatchFile } from "node:fs";
import { resolve } from "node:path";
import { useEffect, useState } from "react";
import { defaultToolbar, toolbarSchema, type ToolbarValues } from "./toolbar-values";

export function useToolbarTuning(path?: string): ToolbarValues {
  const [values, setValues] = useState(defaultToolbar);
  useEffect(() => {
    if (process.env.NODE_ENV === "production" || !path) return;
    const file = resolve(path);
    const read = () => {
      try {
        setValues(toolbarSchema.parse(JSON.parse(readFileSync(file, "utf8"))));
      } catch {
        setValues(defaultToolbar);
      }
    };
    read();
    watchFile(file, { interval: 100, persistent: false }, read);
    return () => unwatchFile(file, read);
  }, [path]);
  return values;
}
