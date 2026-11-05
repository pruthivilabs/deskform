import { z } from "zod";

export const snippetSchema = z
  .object({
    id: z.uuid(),
    title: z.string(),
    content: z.string(),
    updatedAt: z.iso.datetime(),
  })
  .strict();
export type Snippet = z.infer<typeof snippetSchema>;
export const documentSchema = z
  .object({
    version: z.literal(1),
    snippets: z.array(snippetSchema),
    selectedId: z.uuid().nullable(),
  })
  .strict()
  .superRefine((document, context) => {
    const ids = new Set(document.snippets.map((snippet) => snippet.id));
    if (ids.size !== document.snippets.length)
      context.addIssue({ code: "custom", message: "Duplicate snippet IDs" });
    if (document.selectedId !== null && !ids.has(document.selectedId))
      context.addIssue({ code: "custom", message: "Selected snippet does not exist" });
  });
export type SnippetDocument = z.infer<typeof documentSchema>;
export const emptyDocument: SnippetDocument = { version: 1, snippets: [], selectedId: null };
