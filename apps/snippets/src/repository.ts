import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import { documentSchema, emptyDocument, type SnippetDocument } from "./document";

export type LoadResult =
  | { kind: "ready"; document: SnippetDocument }
  | { kind: "blocked"; message: string };

export function defaultDataDirectory(): string {
  if (process.env.DESKFORM_DATA_DIR) return process.env.DESKFORM_DATA_DIR;
  if (process.platform === "darwin")
    return join(homedir(), "Library", "Application Support", "Deskform", "Snippets");
  if (process.platform === "win32")
    return join(
      process.env.LOCALAPPDATA ?? join(homedir(), "AppData", "Local"),
      "Deskform",
      "Snippets",
    );
  return join(
    process.env.XDG_DATA_HOME ?? join(homedir(), ".local", "share"),
    "deskform",
    "snippets",
  );
}

export class SnippetRepository {
  readonly path: string;
  private checkpoint: string | null = null;
  private writable = false;
  constructor(directory: string) {
    this.path = join(directory, "snippets.json");
  }

  load(): LoadResult {
    try {
      const text = existsSync(this.path) ? readFileSync(this.path, "utf8") : null;
      const document = text === null ? emptyDocument : documentSchema.parse(JSON.parse(text));
      this.checkpoint = text;
      this.writable = true;
      return { kind: "ready", document };
    } catch {
      this.writable = false;
      return {
        kind: "blocked",
        message: `Could not read ${this.path}. The original file is preserved. Repair or move it, then restart.`,
      };
    }
  }

  save(document: SnippetDocument): void {
    if (!this.writable)
      throw new Error("Saving is blocked because the original document could not be read.");
    const serialized = `${JSON.stringify(documentSchema.parse(document), null, 2)}\n`;
    mkdirSync(dirname(this.path), { recursive: true });
    const lockPath = `${this.path}.lock`;
    let lock: number;
    try {
      lock = openSync(lockPath, "wx", 0o600);
    } catch {
      throw new Error(
        "Another save is in progress. Retry shortly. If the app crashed, remove snippets.json.lock after closing all instances.",
      );
    }
    const temporary = `${this.path}.${process.pid}.${crypto.randomUUID()}.tmp`;
    try {
      const current = existsSync(this.path) ? readFileSync(this.path, "utf8") : null;
      if (current !== this.checkpoint)
        throw new Error(
          "The library changed outside this window. Your edits are still here. Restart to load the file; copy unsaved text first.",
        );
      const fd = openSync(temporary, "wx", 0o600);
      try {
        writeFileSync(fd, serialized, "utf8");
        fsyncSync(fd);
      } finally {
        closeSync(fd);
      }
      renameSync(temporary, this.path);
      this.checkpoint = serialized;
    } finally {
      rmSync(temporary, { force: true });
      closeSync(lock);
      rmSync(lockPath, { force: true });
    }
  }
}
