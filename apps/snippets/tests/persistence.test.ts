import { afterEach, expect, it } from "vite-plus/test";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SnippetRepository } from "../src/repository";
import { SnippetStore } from "../src/store";
import { newSnippet } from "../src/model";
import { documentSchema } from "../src/document";

const directories: string[] = [];
function directory() {
  const path = mkdtempSync(join(tmpdir(), "deskform-test-"));
  directories.push(path);
  return path;
}
afterEach(() => {
  for (const path of directories.splice(0)) rmSync(path, { recursive: true, force: true });
});

it("restores exact text and selection from a new store without relying on shutdown hooks", () => {
  const path = directory();
  const store = new SnippetStore(new SnippetRepository(path));
  const snippet = newSnippet();
  store.dispatch({ type: "create", snippet });
  store.dispatch({
    type: "edit",
    id: snippet.id,
    patch: { title: "Café", content: "line one\n☕\tline two" },
    now: "2026-11-05T01:00:00.000Z",
  });
  store.dispatch({ type: "search", query: "café" });
  const restored = new SnippetStore(new SnippetRepository(path)).getSnapshot();
  expect(restored.library).toMatchObject({
    selectedId: snippet.id,
    query: "",
    snippets: [{ title: "Café", content: "line one\n☕\tline two" }],
  });
  expect(restored.status.kind).toBe("saved");
  expect(
    documentSchema.parse(JSON.parse(readFileSync(join(path, "snippets.json"), "utf8"))).version,
  ).toBe(1);
  expect(readdirSync(path)).toEqual(["snippets.json"]);
});

it.each([
  "{broken",
  JSON.stringify({ version: 99, snippets: [], selectedId: null }),
  JSON.stringify({ version: 1, snippets: [{ id: "bad" }], selectedId: null }),
])("preserves unreadable or incompatible data and blocks writing: %s", (text) => {
  const path = directory();
  writeFileSync(join(path, "snippets.json"), text);
  const store = new SnippetStore(new SnippetRepository(path));
  store.dispatch({ type: "create", snippet: newSnippet() });
  store.retrySave();
  expect(store.getSnapshot().status.kind).toBe("blocked");
  expect(readFileSync(join(path, "snippets.json"), "utf8")).toBe(text);
});

it("reports a concurrent writer, preserves its data and retains unsaved edits", () => {
  const path = directory();
  const first = new SnippetStore(new SnippetRepository(path));
  const second = new SnippetStore(new SnippetRepository(path));
  const mine = newSnippet();
  first.dispatch({ type: "create", snippet: mine });
  const disk = readFileSync(join(path, "snippets.json"), "utf8");
  second.dispatch({ type: "create", snippet: { ...newSnippet(), title: "Unsaved work" } });
  expect(second.getSnapshot().status.kind).toBe("error");
  expect(second.getSnapshot().library.snippets[0]?.title).toBe("Unsaved work");
  expect(readFileSync(join(path, "snippets.json"), "utf8")).toBe(disk);
});

it("retries a transient save failure and persists the latest edit", () => {
  const path = directory();
  const store = new SnippetStore(new SnippetRepository(path));
  writeFileSync(join(path, "snippets.json.lock"), "busy");
  const snippet = { ...newSnippet(), title: "Keep me" };
  store.dispatch({ type: "create", snippet });
  expect(store.getSnapshot().status.kind).toBe("error");
  rmSync(join(path, "snippets.json.lock"));
  store.retrySave();
  expect(new SnippetStore(new SnippetRepository(path)).getSnapshot().library.snippets).toEqual([
    snippet,
  ]);
  expect(store.getSnapshot().status.kind).toBe("saved");
});

it("rejects duplicate IDs and invalid selection at the document boundary", () => {
  const snippet = newSnippet();
  expect(
    documentSchema.safeParse({ version: 1, snippets: [snippet, snippet], selectedId: snippet.id })
      .success,
  ).toBe(false);
  expect(
    documentSchema.safeParse({ version: 1, snippets: [], selectedId: snippet.id }).success,
  ).toBe(false);
});
