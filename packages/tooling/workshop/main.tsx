import { DialRoot, useDialKit } from "dialkit";
import "dialkit/styles.css";
import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { defaultToolbar, toolbarSchema } from "../src/toolbar-values";
import "./style.css";

function Workshop() {
  const values = useDialKit("Native toolbar", {
    height: [defaultToolbar.height, 48, 88, 1],
    gap: [defaultToolbar.gap, 4, 20, 1],
    padding: [defaultToolbar.padding, 12, 32, 1],
    accent: defaultToolbar.accent,
  });
  const [status, setStatus] = useState("Connecting…");
  useEffect(() => {
    const parsed = toolbarSchema.safeParse(values);
    if (!parsed.success) {
      setStatus("Finish entering valid toolbar values");
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void fetch("/__deskform/toolbar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
        signal: controller.signal,
      })
        .then((response) => {
          if (!controller.signal.aborted)
            setStatus(
              response.ok ? "Applied to native development toolbar" : "Could not apply values",
            );
        })
        .catch(() => {
          if (!controller.signal.aborted) setStatus("Connection lost — restart dev:tools");
        });
    }, 120);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [values]);
  return (
    <main>
      <span className="eyebrow">DESKFORM / WORKSHOP</span>
      <h1>Dial in the details.</h1>
      <p>Use DialKit to tune the toolbar in the running native application.</p>
      <div
        className="preview"
        style={{ minHeight: values.height, gap: values.gap, paddingInline: values.padding }}
      >
        <strong>Application toolbar</strong>
        <span>Native toolbar preview</span>
        <button style={{ background: values.accent }}>Action</button>
      </div>
      <p role="status">{status}</p>
      <pre>{JSON.stringify(values, null, 2)}</pre>
      <p className="hint">
        Run <code>bun run dev</code> alongside this panel. Values update the native window through a
        local development file. Copy the chosen values into the tokens before shipping.
      </p>
      <DialRoot defaultOpen />
    </main>
  );
}
const root = document.getElementById("root");
if (!root) throw new Error("Missing workshop root");
createRoot(root).render(<Workshop />);
