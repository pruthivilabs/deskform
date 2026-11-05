import { emptyLibrary, reduceLibrary, type Action, type Library } from "./model";
import type { SnippetDocument } from "./document";
import type { SnippetRepository } from "./repository";

export type SaveStatus =
  | { kind: "temporary" | "saved" }
  | { kind: "error" | "blocked"; message: string };
export interface Snapshot {
  library: Library;
  status: SaveStatus;
}

export class SnippetStore {
  private snapshot: Snapshot;
  private listeners = new Set<() => void>();
  constructor(private repository?: SnippetRepository) {
    const loaded = repository?.load();
    this.snapshot =
      loaded?.kind === "blocked"
        ? { library: emptyLibrary, status: loaded }
        : {
            library: loaded ? { ...loaded.document, query: "" } : emptyLibrary,
            status: { kind: repository ? "saved" : "temporary" },
          };
  }
  getSnapshot = (): Snapshot => this.snapshot;
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  dispatch = (action: Action): void => {
    if (this.snapshot.status.kind === "blocked") return;
    const library = reduceLibrary(this.snapshot.library, action);
    this.snapshot = { ...this.snapshot, library };
    if (action.type !== "search") this.save();
    for (const listener of this.listeners) listener();
  };
  retrySave = (): void => {
    if (this.snapshot.status.kind === "blocked") return;
    this.save();
    for (const listener of this.listeners) listener();
  };
  private save(): void {
    if (!this.repository) return;
    const { snippets, selectedId } = this.snapshot.library;
    const document: SnippetDocument = { version: 1, snippets, selectedId };
    try {
      this.repository.save(document);
      this.snapshot = { ...this.snapshot, status: { kind: "saved" } };
    } catch (error) {
      this.snapshot = {
        ...this.snapshot,
        status: { kind: "error", message: error instanceof Error ? error.message : String(error) },
      };
    }
  }
}
