import { expect, test } from "bun:test";
import { connectTest } from "@gpuix/react/automation";
import { createTestRoot } from "@gpuix/react/testing";
import { useState } from "react";
import { Button, Input, Row, Stack, Text, Textarea } from "../src";

test("controls activate with pointer, Enter and Space; disabled actions stay inert", async () => {
  const root = createTestRoot({ width: 600, height: 400, keyboardFocusDim: false });
  const app = await connectTest(root.renderer);
  function Controls() {
    const [count, setCount] = useState(0);
    return (
      <Stack>
        <Row>
          <Button testId="action" onPress={() => setCount((n) => n + 1)}>
            Create
          </Button>
          <Button testId="disabled" disabled onPress={() => setCount(-100)}>
            Delete
          </Button>
        </Row>
        <Text testId="result">{String(count)}</Text>
      </Stack>
    );
  }
  try {
    root.render(<Controls />);
    await app.getByTestId("action").click();
    expect(await app.getByTestId("result").textContent()).toBe("1");
    await app.getByTestId("action").press("enter");
    expect(await app.getByTestId("result").textContent()).toBe("2");
    const action = await app.getByTestId("action").element();
    root.renderer.nativeSimulateKeyDown(action.id, "enter", true);
    expect(await app.getByTestId("result").textContent()).toBe("2");
    root.renderer.nativeSimulateKeyDown(action.id, "space");
    expect(await app.getByTestId("result").textContent()).toBe("2");
    root.renderer.nativeSimulateKeyUp(action.id, "space");
    expect(await app.getByTestId("result").textContent()).toBe("3");
    await app.getByTestId("disabled").click();
    expect(await app.getByTestId("result").textContent()).toBe("3");
    await app.getByTestId("disabled").press("enter");
    expect(await app.getByTestId("result").textContent()).toBe("3");
    const labels = Object.values(root.renderer.getA11yTree().nodes ?? {}).map((node) =>
      node.aria?.role === "Button" ? node.aria.label : undefined,
    );
    expect(labels).toContain("Create");
    expect(labels).toContain("Delete");
  } finally {
    await app.close();
    root.unmount();
  }
});

test("native fields edit Unicode and multiline text, and Tab skips disabled controls", async () => {
  const root = createTestRoot({ width: 600, height: 500, keyboardFocusDim: false });
  const app = await connectTest(root.renderer);
  function Fields() {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    return (
      <Stack>
        <Input testId="title" aria-label="Title" value={title} onValueChange={setTitle} />
        <Button disabled onPress={() => {}}>
          Unavailable
        </Button>
        <Textarea testId="body" aria-label="Content" value={body} onValueChange={setBody} />
        <Text testId="result">{`${title}|${body}`}</Text>
      </Stack>
    );
  }
  try {
    root.render(<Fields />);
    const title = await app.getByTestId("title").element();
    const body = await app.getByTestId("body").element();
    await app.getByTestId("title").fill("Café ☕");
    root.renderer.simulateKeystrokes("tab");
    expect(root.renderer.getFocusedElementId()).toBe(body.id);
    await app.getByTestId("body").fill("line one\nline two");
    expect(await app.getByTestId("result").textContent()).toBe("Café ☕|line one\nline two");
    root.renderer.simulateKeystrokes("shift-tab");
    expect(root.renderer.getFocusedElementId()).toBe(title.id);
  } finally {
    await app.close();
    root.unmount();
  }
});
