import { expect, test } from "bun:test";
import { connectTest } from "@gpuix/react/automation";
import { createTestRoot } from "@gpuix/react/testing";
import { useState } from "react";
import {
  AppFrame,
  Sidebar,
  SidebarSection,
  NavigationItem,
  Toolbar,
  Text,
  Button,
  ConfirmDialog,
} from "../src";

test("sidebar geometry supports keyboard limits and native pointer resizing", async () => {
  const root = createTestRoot({ width: 1000, height: 700, keyboardFocusDim: false });
  const app = await connectTest(root.renderer);
  try {
    root.render(
      <AppFrame
        toolbar={
          <Toolbar aria-label="Main toolbar" testId="toolbar">
            <Text>Tools</Text>
          </Toolbar>
        }
        sidebar={
          <Sidebar label="Navigation" testId="nav" defaultWidth={260} minWidth={180} maxWidth={400}>
            <SidebarSection title="Pages">
              <NavigationItem label="Overview" selected onSelect={() => {}} />
            </SidebarSection>
          </Sidebar>
        }
      >
        <Text>Content</Text>
      </AppFrame>,
    );
    expect((await app.getByTestId("nav").bounds()).width).toBe(260);
    await app.getByTestId("nav-resize").press("right");
    expect((await app.getByTestId("nav").bounds()).width).toBe(270);
    await app.getByTestId("nav-resize").press("home");
    expect((await app.getByTestId("nav").bounds()).width).toBe(180);
    await app.getByTestId("nav-resize").press("end");
    expect((await app.getByTestId("nav").bounds()).width).toBe(400);
    await app.getByTestId("nav-resize").press("right");
    expect((await app.getByTestId("nav").bounds()).width).toBe(400);
    await app.getByTestId("nav-resize").dragBy(-40, 0);
    expect((await app.getByTestId("nav").bounds()).width).toBe(360);
  } finally {
    await app.close();
    root.unmount();
  }
});

test("controlled sidebars publish widths and collapsed panels leave no controls behind", async () => {
  const root = createTestRoot({ width: 760, height: 500, keyboardFocusDim: false });
  const app = await connectTest(root.renderer);
  function Fixture() {
    const [width, setWidth] = useState(240);
    const [hidden, setHidden] = useState(false);
    return (
      <AppFrame
        sidebar={
          <Sidebar
            label="Pages"
            testId="nav"
            width={width}
            onWidthChange={setWidth}
            collapsed={hidden}
          >
            <NavigationItem testId="page" label="Page" onSelect={() => {}} />
          </Sidebar>
        }
      >
        <Text testId="width">{String(width)}</Text>
        <Button testId="collapse" onPress={() => setHidden(!hidden)}>
          Toggle sidebar
        </Button>
      </AppFrame>
    );
  }
  try {
    root.render(<Fixture />);
    await app.getByTestId("nav-resize").press("right");
    expect(await app.getByTestId("width").textContent()).toBe("250");
    await app.getByTestId("collapse").click();
    expect(await app.getByTestId("page").count()).toBe(0);
    expect(await app.getByTestId("nav-resize").count()).toBe(0);
  } finally {
    await app.close();
    root.unmount();
  }
});

test("confirmation contains commands and restores the opening control after Escape", async () => {
  const root = createTestRoot({ width: 760, height: 500, keyboardFocusDim: false });
  const app = await connectTest(root.renderer);
  function Fixture() {
    const [open, setOpen] = useState(false);
    const [count, setCount] = useState(0);
    return (
      <AppFrame
        onKeyDown={(event) => {
          if (event.key === "n" && event.modifiers?.cmd) setCount((n) => n + 1);
        }}
      >
        <Button testId="open" onPress={() => setOpen(true)}>
          Confirm action
        </Button>
        <Text testId="count">{String(count)}</Text>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Proceed?"
          description="A framework confirmation"
          confirmLabel="Proceed"
          onConfirm={() => setOpen(false)}
        />
      </AppFrame>
    );
  }
  try {
    root.render(<Fixture />);
    await app.getByTestId("open").click();
    expect(root.renderer.getFocusedElementId()).toBe(
      (await app.getByTestId("confirm-dialog-cancel").element()).id,
    );
    await app.getByTestId("confirm-dialog-cancel").press("cmd-n");
    expect(await app.getByTestId("count").textContent()).toBe("0");
    await app.getByTestId("confirm-dialog-cancel").press("escape");
    expect(await app.getByTestId("confirm-dialog-cancel").count()).toBe(0);
    expect(root.renderer.getFocusedElementId()).toBe((await app.getByTestId("open").element()).id);
  } finally {
    await app.close();
    root.unmount();
  }
});

test("a pointer resize owns its gesture until release or Escape", async () => {
  const root = createTestRoot({ width: 1000, height: 700, keyboardFocusDim: false });
  const app = await connectTest(root.renderer);
  try {
    root.render(
      <AppFrame
        sidebar={
          <Sidebar label="Pages" testId="nav" defaultWidth={260}>
            <Text>Navigation</Text>
          </Sidebar>
        }
      >
        <Text>Content</Text>
      </AppFrame>,
    );
    const box = await app.getByTestId("nav-resize").bounds();
    const x = box.x + box.width / 2,
      y = box.y + 30;
    root.renderer.nativeSimulateMouseDown(x, y);
    root.renderer.nativeSimulateMouseMove(x + 20, y, 0);
    expect((await app.getByTestId("nav").bounds()).width).toBe(280);
    await app.getByTestId("nav-resize").press("right");
    expect((await app.getByTestId("nav").bounds()).width).toBe(280);
    await app.getByTestId("nav-resize").press("escape");
    expect((await app.getByTestId("nav").bounds()).width).toBe(260);
    root.renderer.nativeSimulateMouseUp(x + 20, y);
  } finally {
    await app.close();
    root.unmount();
  }
});
