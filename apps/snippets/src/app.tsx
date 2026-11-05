import { color, space } from "@deskform/tokens";
import { Button, Input, Stack, Text, Textarea } from "@deskform/ui";
import { useState } from "react";

export function App() {
  const [count, setCount] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  return (
    <Stack
      gap={space.lg}
      style={{ padding: space.xxl, backgroundColor: color.canvas, width: "100%", height: "100%" }}
    >
      <Text size="title">Deskform Snippets</Text>
      <Text tone="muted">Your plain-text snippets, close at hand.</Text>
      <Button
        testId="new-snippet"
        variant="primary"
        onPress={() => setCount((value) => value + 1)}
        style={{ alignSelf: "flex-start" }}
      >
        Create a snippet
      </Button>
      <Input
        aria-label="Snippet title"
        placeholder="Untitled snippet"
        value={title}
        onValueChange={setTitle}
      />
      <Textarea
        aria-label="Snippet content"
        placeholder="Keep something useful…"
        value={content}
        onValueChange={setContent}
      />
      <Text testId="count">{`Created: ${count}`}</Text>
    </Stack>
  );
}
