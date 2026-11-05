import { createCommands } from "@deskform/runtime";
import { color, radius, space, type } from "@deskform/tokens";
import { Button, Input, Row, Shell, Stack, Text, Textarea, Toolbar } from "@deskform/ui";
import { Button as NativeButton, useGpuixRequired, type PublicInstance } from "@gpuix/react";
import { useEffect, useReducer, useRef } from "react";
import { emptyLibrary, newSnippet, reduceLibrary, visibleSnippets, type Library } from "./model";

export function App({ initialLibrary = emptyLibrary }: { initialLibrary?: Library }) {
  const [library, dispatch] = useReducer(reduceLibrary, initialLibrary);
  const renderer = useGpuixRequired();
  const searchRef = useRef<PublicInstance>(null);
  const titleRef = useRef<PublicInstance>(null);
  const focusNew = useRef(false);
  const rows = useRef(new Map<string, PublicInstance>());
  const visible = visibleSnippets(library);
  const selected = library.snippets.find((snippet) => snippet.id === library.selectedId);
  const create = () => {
    focusNew.current = true;
    dispatch({ type: "create", snippet: newSnippet() });
  };
  const focusSearch = () => {
    if (searchRef.current) renderer.focusElement?.(searchRef.current.id);
  };
  const commands = createCommands([
    { id: "create", shortcut: { key: "n" }, run: create },
    { id: "search", shortcut: { key: "f" }, run: focusSearch },
  ]);
  useEffect(() => {
    if (!focusNew.current || !titleRef.current) return;
    renderer.focusElement?.(titleRef.current.id);
    focusNew.current = false;
  }, [library.selectedId, renderer]);

  const sidebar = (
    <>
      <Toolbar style={{ paddingLeft: space.lg, paddingRight: space.lg }}>
        <Stack gap={0} style={{ flexGrow: 1 }}>
          <Text size="label">Snippets</Text>
          <Text size="caption" tone="faint">
            A little library of useful things
          </Text>
        </Stack>
        <Text size="caption" tone="muted">
          {String(library.snippets.length)}
        </Text>
      </Toolbar>
      <Stack gap={space.md} style={{ padding: space.lg, flexShrink: 0 }}>
        <Input
          ref={searchRef}
          autoFocus
          testId="search"
          aria-label="Search snippets"
          placeholder="Search snippets…"
          value={library.query}
          onValueChange={(query) => dispatch({ type: "search", query })}
        />
        <Button testId="new-snippet" variant="primary" onPress={() => commands.run("create")}>
          New snippet
        </Button>
      </Stack>
      <Stack
        role="listbox"
        aria-label="Snippets"
        gap={space.xs}
        style={{ flexGrow: 1, overflow: "scroll", padding: space.sm }}
      >
        {visible.map((snippet, index) => (
          <NativeButton
            key={snippet.id}
            testId={`snippet-${snippet.id}`}
            role="option"
            aria-label={snippet.title || "Untitled snippet"}
            aria-selected={snippet.id === library.selectedId}
            ref={(instance) => {
              if (instance) rows.current.set(snippet.id, instance);
              else rows.current.delete(snippet.id);
            }}
            onClick={() => dispatch({ type: "select", id: snippet.id })}
            onKeyDown={(event) => {
              if (event.key !== "up" && event.key !== "down") return;
              const next = visible[index + (event.key === "down" ? 1 : -1)];
              if (!next) return;
              event.preventDefault();
              dispatch({ type: "select", id: next.id });
              const row = rows.current.get(next.id);
              if (row) {
                renderer.focusElement?.(row.id);
                row.scrollIntoView?.();
              }
            }}
            style={{
              padding: space.md,
              gap: space.xs,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: "transparent",
              backgroundColor: snippet.id === library.selectedId ? color.selected : "transparent",
              hover: { backgroundColor: color.surfaceHover },
              focusVisible: { borderColor: color.focus },
              cursor: "pointer",
            }}
          >
            <Text size="label" style={{ whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
              {snippet.title || "Untitled snippet"}
            </Text>
            <Text
              size="caption"
              tone="muted"
              style={{ whiteSpace: "nowrap", textOverflow: "ellipsis" }}
            >
              {snippet.content.replace(/\s+/gu, " ").slice(0, 90) || "No content yet"}
            </Text>
          </NativeButton>
        ))}
        {visible.length === 0 && (
          <Stack gap={space.sm} style={{ padding: space.lg }}>
            <Text tone="muted">
              {library.query ? "No matching snippets" : "Your library starts here"}
            </Text>
            <Text size="caption" tone="faint">
              {library.query
                ? "Try a title or a word from the content."
                : "Create a snippet to save something useful."}
            </Text>
          </Stack>
        )}
      </Stack>
      <Row style={{ padding: space.lg, flexShrink: 0 }}>
        <Text size="caption" tone="faint">
          ⌘N New · ⌘F Search
        </Text>
      </Row>
    </>
  );

  return (
    <Shell sidebar={sidebar} onKeyDown={commands.onKeyDown}>
      <Toolbar>
        <Text size="caption" tone="muted">
          {selected ? "PLAIN TEXT" : "YOUR PERSONAL LIBRARY"}
        </Text>
        <div style={{ flexGrow: 1 }} />
        <Text size="caption" tone="faint">
          Local. Simple. Yours.
        </Text>
      </Toolbar>
      {selected ? (
        <Stack key={selected.id} gap={space.xl} style={{ padding: space.xl, flexGrow: 1 }}>
          <Stack gap={space.sm}>
            <Text size="caption" tone="muted">
              TITLE
            </Text>
            <Input
              ref={titleRef}
              testId="title"
              aria-label="Snippet title"
              placeholder="Untitled snippet"
              value={selected.title}
              onValueChange={(title) =>
                dispatch({
                  type: "edit",
                  id: selected.id,
                  patch: { title },
                  now: new Date().toISOString(),
                })
              }
              style={{ ...type.heading, height: 46 }}
            />
          </Stack>
          <Stack gap={space.sm} style={{ flexGrow: 1 }}>
            <Text size="caption" tone="muted">
              CONTENT
            </Text>
            <Textarea
              testId="content"
              aria-label="Snippet content"
              placeholder="A command, an idea, something worth keeping…"
              value={selected.content}
              onValueChange={(content) =>
                dispatch({
                  type: "edit",
                  id: selected.id,
                  patch: { content },
                  now: new Date().toISOString(),
                })
              }
              style={{ flexGrow: 1 }}
              minRows={8}
              maxRows={1000}
            />
          </Stack>
          <Row>
            <Text
              testId="character-count"
              size="caption"
              tone="faint"
            >{`${selected.content.length} characters`}</Text>
            <div style={{ flexGrow: 1 }} />
            <Text size="caption" tone="faint">
              Plain text
            </Text>
          </Row>
        </Stack>
      ) : (
        <Stack
          gap={space.lg}
          style={{
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: space.xxl,
          }}
        >
          <Text size="title">Keep the useful bits.</Text>
          <Text tone="muted">A quiet home for commands, notes, and ideas.</Text>
          <Button onPress={create}>Create your first snippet</Button>
        </Stack>
      )}
    </Shell>
  );
}
