import { describe, expect, it } from "vite-plus/test";
import { createCommands, matchesShortcut } from "../src/commands";

const noModifiers = { shift: false, ctrl: false, alt: false, cmd: false };

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
