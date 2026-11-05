import { expect, it } from "vite-plus/test";
import {
  emptyLibrary,
  reduceLibrary,
  visibleSnippets,
  type Library,
  type Snippet,
} from "../src/model";

const first: Snippet = {
  id: "one",
  title: "Deploy",
  content: "bun run build",
  updatedAt: "2026-11-05T00:00:00.000Z",
};
it("creates, selects and edits snippets without changing a different snippet", () => {
  let state = reduceLibrary(emptyLibrary, { type: "create", snippet: first });
  state = reduceLibrary(state, {
    type: "create",
    snippet: { ...first, id: "two", title: "Other" },
  });
  state = reduceLibrary(state, { type: "select", id: "one" });
  state = reduceLibrary(state, {
    type: "edit",
    id: "one",
    patch: { title: "Publish", content: "bun run check" },
    now: "2026-11-05T01:00:00.000Z",
  });
  expect(state.selectedId).toBe("one");
  expect(state.snippets.map(({ title, content }) => ({ title, content }))).toEqual([
    { title: "Other", content: "bun run build" },
    { title: "Publish", content: "bun run check" },
  ]);
  expect(reduceLibrary(state, { type: "select", id: "missing" }).selectedId).toBe("one");
});
it("searches title and body using all case-insensitive terms and preserves the document", () => {
  const state = {
    snippets: [first, { ...first, id: "two", title: "Café notes", content: "☕" }],
    selectedId: "one",
    query: "BUILD deploy",
  };
  expect(visibleSnippets(state).map((snippet) => snippet.id)).toEqual(["one"]);
  expect(visibleSnippets({ ...state, query: "  CAFÉ  ☕ " }).map((snippet) => snippet.id)).toEqual([
    "two",
  ]);
  expect(visibleSnippets({ ...state, query: "[.*" })).toEqual([]);
  expect(state.snippets).toHaveLength(2);
});

it("deletes the selected item, chooses its neighbor and handles an empty library", () => {
  const second = { ...first, id: "two", title: "Second" };
  let state: Library = { snippets: [first, second], selectedId: first.id, query: "" };
  state = reduceLibrary(state, { type: "delete", id: first.id });
  expect(state.snippets).toEqual([second]);
  expect(state.selectedId).toBe("two");
  state = reduceLibrary(state, { type: "delete", id: second.id });
  expect(state.snippets).toEqual([]);
  expect(state.selectedId).toBeNull();
});
