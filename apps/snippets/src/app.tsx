import { Button } from "@gpuix/react";
import { useState } from "react";

export function App() {
  const [count, setCount] = useState(0);
  return (
    <div
      style={{
        flexDirection: "column",
        padding: 32,
        gap: 20,
        backgroundColor: "#181b22",
        width: "100%",
        height: "100%",
      }}
    >
      <text style={{ color: "#f4f5f7", fontSize: 24 }}>Deskform Snippets</text>
      <text style={{ color: "#a7adbb", fontSize: 14 }}>
        Your plain-text snippets, close at hand.
      </text>
      <Button
        testId="new-snippet"
        aria-label="Create a snippet"
        onClick={() => setCount((value) => value + 1)}
        style={{ padding: 12, backgroundColor: "#b8c7ff", borderRadius: 8 }}
      >
        <text style={{ color: "#172448", fontSize: 14 }}>Create a snippet</text>
      </Button>
      <text testId="count" style={{ color: "#f4f5f7", fontSize: 14 }}>
        Created: {count}
      </text>
    </div>
  );
}
