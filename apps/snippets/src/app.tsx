import { color, radius, space, type } from "@deskform/tokens";
import { Button } from "@gpuix/react";
import { useState } from "react";

export function App() {
  const [count, setCount] = useState(0);
  return (
    <div
      style={{
        flexDirection: "column",
        padding: space.xxl,
        gap: space.lg,
        backgroundColor: color.canvas,
        width: "100%",
        height: "100%",
      }}
    >
      <text style={{ color: color.text, ...type.title }}>Deskform Snippets</text>
      <text style={{ color: color.muted, ...type.body }}>
        Your plain-text snippets, close at hand.
      </text>
      <Button
        testId="new-snippet"
        aria-label="Create a snippet"
        onClick={() => setCount((value) => value + 1)}
        style={{ padding: space.md, backgroundColor: color.accent, borderRadius: radius.md }}
      >
        <text style={{ color: color.onAccent, ...type.label }}>Create a snippet</text>
      </Button>
      <text testId="count" style={{ color: color.text, ...type.body }}>
        {`Created: ${count}`}
      </text>
    </div>
  );
}
