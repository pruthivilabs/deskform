import { describe, expect, it } from "vite-plus/test";
import type { EventModifiers, KeyEvent } from "@gpuix/react";
import { createCommands, matchesShortcut } from "@deskform/runtime/commands";

const noModifiers = { shift: false, ctrl: false, alt: false, cmd: false };
const primaryModifiers = {
  ...noModifiers,
  [process.platform === "darwin" ? "cmd" : "ctrl"]: true,
};

function keyEvent({
  key = "n",
  isHeld = false,
  modifiers = primaryModifiers,
  cancelled = false,
}: {
  key?: string;
  isHeld?: boolean;
  modifiers?: EventModifiers;
  cancelled?: boolean;
} = {}): KeyEvent & { readonly propagationStopped: boolean } {
  let prevented = cancelled;
  let stopped = false;
  return {
    elementId: 1,
    eventType: "keyDown",
    key,
    modifiers,
    isHeld,
    get defaultPrevented() {
      return prevented;
    },
    get propagationStopped() {
      return stopped;
    },
    preventDefault() {
      prevented = true;
    },
    stopPropagation() {
      stopped = true;
    },
  };
}

describe("application commands", () => {
  it("matches exact primary shortcuts without intercepting text editing or repeats", () => {
    expect(
      matchesShortcut(
        { key: "n", modifiers: { ...noModifiers, cmd: true } },
        { key: "n" },
        "darwin",
      ),
    ).toBe(true);
    expect(
      matchesShortcut(
        { key: "n", modifiers: { ...noModifiers, ctrl: true } },
        { key: "n" },
        "linux",
      ),
    ).toBe(true);
    expect(matchesShortcut({ key: "n" }, { key: "n" }, "darwin")).toBe(false);
    expect(
      matchesShortcut(
        {
          key: "n",
          modifiers: { ...noModifiers, cmd: true, shift: true },
        },
        { key: "n" },
        "darwin",
      ),
    ).toBe(false);
    expect(
      matchesShortcut(
        {
          key: "n",
          modifiers: { ...noModifiers, cmd: true, alt: true },
        },
        { key: "n" },
        "darwin",
      ),
    ).toBe(false);
    expect(
      matchesShortcut(
        {
          key: "n",
          modifiers: { ...noModifiers, cmd: true },
          isHeld: true,
        },
        { key: "n" },
        "darwin",
      ),
    ).toBe(false);
  });
  it("routes actions once and keeps disabled actions inert", () => {
    const actions: string[] = [];
    const commands = createCommands([
      { id: "create", run: () => actions.push("create") },
      { id: "delete", enabled: false, run: () => actions.push("delete") },
    ]);
    expect(commands.run("create")).toBe(true);
    expect(commands.run("delete")).toBe(false);
    expect(actions).toEqual(["create"]);
  });
  it("consumes matched shortcuts and leaves editing, disabled, cancelled and repeat events alone", () => {
    const actions: string[] = [];
    const commands = createCommands([
      { id: "create", shortcut: { key: "n" }, run: () => actions.push("create") },
      { id: "delete", shortcut: { key: "d" }, enabled: false, run: () => actions.push("delete") },
    ]);
    for (const event of [
      keyEvent({ key: "a" }),
      keyEvent({ key: "d" }),
      keyEvent({ isHeld: true }),
    ]) {
      commands.onKeyDown(event);
      expect(event.defaultPrevented).toBe(false);
      expect(event.propagationStopped).toBe(false);
    }
    const cancelled = keyEvent({ cancelled: true });
    commands.onKeyDown(cancelled);
    expect(cancelled.propagationStopped).toBe(false);
    expect(actions).toEqual([]);

    const matched = keyEvent();
    commands.onKeyDown(matched);
    expect(actions).toEqual(["create"]);
    expect(matched.defaultPrevented).toBe(true);
    expect(matched.propagationStopped).toBe(true);
  });
  it("rejects ambiguous command and shortcut ownership", () => {
    expect(() =>
      createCommands([
        { id: "same", run() {} },
        { id: "same", run() {} },
      ]),
    ).toThrow();
    expect(() =>
      createCommands([
        { id: "one", shortcut: { key: "n" }, run() {} },
        { id: "two", shortcut: { key: "n" }, run() {} },
      ]),
    ).toThrow();
  });
});
