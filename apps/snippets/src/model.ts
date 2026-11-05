import type { Snippet } from "./document";
export type { Snippet } from "./document";
export interface Library {
  snippets: Snippet[];
  selectedId: string | null;
  query: string;
}
export const emptyLibrary: Library = { snippets: [], selectedId: null, query: "" };
export type Action =
  | { type: "create"; snippet: Snippet }
  | { type: "select"; id: string }
  | { type: "delete"; id: string }
  | { type: "edit"; id: string; patch: Pick<Partial<Snippet>, "title" | "content">; now: string }
  | { type: "search"; query: string };

export function newSnippet(): Snippet {
  return { id: crypto.randomUUID(), title: "", content: "", updatedAt: new Date().toISOString() };
}

export function visibleSnippets(library: Library): Snippet[] {
  const terms = library.query.toLowerCase().trim().split(/\s+/u).filter(Boolean);
  return library.snippets.filter((snippet) =>
    terms.every((term) => `${snippet.title}\n${snippet.content}`.toLowerCase().includes(term)),
  );
}

export function reduceLibrary(library: Library, action: Action): Library {
  switch (action.type) {
    case "create":
      return {
        ...library,
        snippets: [action.snippet, ...library.snippets],
        selectedId: action.snippet.id,
        query: "",
      };
    case "select":
      return library.snippets.some((snippet) => snippet.id === action.id)
        ? { ...library, selectedId: action.id }
        : library;
    case "delete": {
      const index = library.snippets.findIndex((snippet) => snippet.id === action.id);
      if (index < 0) return library;
      const snippets = library.snippets.filter((snippet) => snippet.id !== action.id);
      const selectedId =
        library.selectedId === action.id
          ? (snippets[Math.min(index, snippets.length - 1)]?.id ?? null)
          : library.selectedId;
      return { ...library, snippets, selectedId };
    }
    case "edit":
      return {
        ...library,
        snippets: library.snippets.map((snippet) =>
          snippet.id === action.id
            ? { ...snippet, ...action.patch, updatedAt: action.now }
            : snippet,
        ),
      };
    case "search":
      return { ...library, query: action.query };
  }
}
