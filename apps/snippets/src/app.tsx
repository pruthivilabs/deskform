import { clipboard, createCommands } from "@deskform/runtime";
import { color, radius, space, type } from "@deskform/tokens";
import {
  Button,
  ConfirmDialog,
  Input,
  Row,
  Shell,
  Stack,
  Text,
  Textarea,
  Toolbar,
} from "@deskform/ui";
import { Button as NativeButton, useGpuixRequired, type PublicInstance } from "@gpuix/react";
import { useEffect, useState, useSyncExternalStore, useRef } from "react";
import { newSnippet, visibleSnippets } from "./model";
import { SnippetStore } from "./store";
import { useToolbarTuning } from "./toolbar-tuning";

export function App({
  store,
  copyText = clipboard.write,
}: {
  store?: SnippetStore;
  copyText?: (text: string) => Promise<void>;
}) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<
    { kind: "idle" | "copying" | "copied" } | { kind: "error"; message: string }
  >({ kind: "idle" });
  const toolbar = useToolbarTuning();
  const toolbarStyle = {
    minHeight: toolbar.height,
    gap: toolbar.gap,
    paddingLeft: toolbar.padding,
    paddingRight: toolbar.padding,
  };
  const [activeStore] = useState(() => store ?? new SnippetStore());
  const { library, status } = useSyncExternalStore(activeStore.subscribe, activeStore.getSnapshot);
  const dispatch = activeStore.dispatch;
  const blocked = status.kind === "blocked";
  const renderer = useGpuixRequired();
  const searchRef = useRef<PublicInstance>(null);
  const titleRef = useRef<PublicInstance>(null);
  const focusNew = useRef(false);
  const rows = useRef(new Map<string, PublicInstance>());
  const copying = useRef(false);
  const visible = visibleSnippets(library);
  const selected = library.snippets.find((snippet) => snippet.id === library.selectedId);
  const create = () => {
    focusNew.current = true;
    dispatch({ type: "create", snippet: newSnippet() });
  };
  const focusSearch = () => {
    if (searchRef.current) renderer.focusElement?.(searchRef.current.id);
  };
  const copy = async () => {
    if (!selected || copying.current) return;
    const { id, content } = selected;
    copying.current = true;
    setCopyStatus({ kind: "copying" });
    let result: { kind: "copied" } | { kind: "error"; message: string } = { kind: "copied" };
    try {
      await copyText(content);
    } catch (error) {
      result = { kind: "error", message: error instanceof Error ? error.message : String(error) };
    }
    copying.current = false;
    const current = activeStore.getSnapshot().library;
    const unchanged =
      current.selectedId === id &&
      current.snippets.find((snippet) => snippet.id === id)?.content === content;
    setCopyStatus(unchanged ? result : { kind: "idle" });
  };
  useEffect(() => {
    if (!copying.current) setCopyStatus({ kind: "idle" });
  }, [selected?.id, selected?.content]);
  const commands = createCommands([
    { id: "create", shortcut: { key: "n" }, enabled: !blocked && !deleteTarget, run: create },
    { id: "search", shortcut: { key: "f" }, enabled: !deleteTarget, run: focusSearch },
    {
      id: "save",
      shortcut: { key: "s" },
      enabled: !blocked && !deleteTarget,
      run: activeStore.retrySave,
    },
    {
      id: "copy",
      shortcut: { key: "c", shift: true },
      enabled: !!selected && !deleteTarget,
      run: () => {
        void copy();
      },
    },
    {
      id: "delete",
      shortcut: { key: "backspace", shift: true },
      enabled: !!selected && !deleteTarget,
      run: () => {
        if (selected) setDeleteTarget(selected.id);
      },
    },
  ]);
  useEffect(() => {
    if (!focusNew.current || !titleRef.current) return;
    renderer.focusElement?.(titleRef.current.id);
    focusNew.current = false;
  }, [library.selectedId, renderer]);

  const sidebar = (
    <>
      <Toolbar style={toolbarStyle}>
        <Stack gap={0} style={{ flexGrow: 1 }}>
          <Text size="label">Snippets</Text>
          <Text size="caption" tone="faint">
            A little library of useful things
          </Text>
        </Stack>
        <Text testId="library-count" size="caption" tone="muted">
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
        <Button
          style={{ backgroundColor: toolbar.accent }}
          testId="new-snippet"
          disabled={blocked}
          variant="primary"
          onPress={() => commands.run("create")}
        >
          New snippet
        </Button>
      </Stack>
      <Stack
        role="navigation"
        aria-label="Snippets"
        gap={space.xs}
        style={{ flexGrow: 1, overflow: "scroll", padding: space.sm }}
      >
        {visible.map((snippet, index) => (
          <NativeButton
            key={snippet.id}
            testId={`snippet-${snippet.id}`}
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
      <Toolbar testId="editor-toolbar" style={toolbarStyle}>
        <Text size="caption" tone="muted">
          {selected ? "PLAIN TEXT" : "YOUR PERSONAL LIBRARY"}
        </Text>
        <div style={{ flexGrow: 1 }} />
        <Text size="caption" tone="faint">
          {status.kind === "saved"
            ? "Saved locally"
            : status.kind === "temporary"
              ? "Temporary session"
              : "Not saved"}
        </Text>
        {selected && (
          <>
            <Button
              testId="copy-snippet"
              onPress={() => commands.run("copy")}
              disabled={copyStatus.kind === "copying"}
            >
              {copyStatus.kind === "copied"
                ? "Copied"
                : copyStatus.kind === "copying"
                  ? "Copying…"
                  : "Copy content"}
            </Button>
            <Button testId="delete-snippet" variant="ghost" onPress={() => commands.run("delete")}>
              Delete
            </Button>
          </>
        )}
      </Toolbar>
      {copyStatus.kind === "error" && (
        <Text testId="copy-error" tone="danger" style={{ padding: space.lg }}>
          {copyStatus.message}
        </Text>
      )}
      {(status.kind === "error" || status.kind === "blocked") && (
        <Row style={{ padding: space.lg, backgroundColor: color.surface }}>
          <Text testId="save-error" tone="danger" style={{ flexGrow: 1 }}>
            {status.message}
          </Text>
          {status.kind === "error" && (
            <Button testId="retry-save" onPress={activeStore.retrySave}>
              Retry save
            </Button>
          )}
        </Row>
      )}
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
          <Button disabled={blocked} onPress={create}>
            Create your first snippet
          </Button>
        </Stack>
      )}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this snippet?"
        description="This removes the snippet from your local library. This action cannot be undone."
        confirmLabel="Delete snippet"
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (deleteTarget) dispatch({ type: "delete", id: deleteTarget });
          setDeleteTarget(null);
          focusSearch();
        }}
      />
    </Shell>
  );
}
