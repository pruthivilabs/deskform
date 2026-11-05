import type { EventPayload, KeyEvent } from "@gpuix/react";

export interface Shortcut {
  key: string;
  shift?: boolean;
}
export interface Command<Id extends string> {
  id: Id;
  shortcut?: Shortcut;
  enabled?: boolean;
  run: () => void;
}

export function matchesShortcut(
  event: Pick<EventPayload, "key" | "modifiers" | "isHeld">,
  shortcut: Shortcut,
  platform = process.platform,
): boolean {
  const modifiers = event.modifiers;
  return (
    !event.isHeld &&
    event.key?.toLowerCase() === shortcut.key.toLowerCase() &&
    !!modifiers?.shift === !!shortcut.shift &&
    !modifiers?.alt &&
    (platform === "darwin"
      ? !!modifiers?.cmd && !modifiers?.ctrl
      : !!modifiers?.ctrl && !modifiers?.cmd)
  );
}

export function createCommands<Id extends string>(commands: readonly Command<Id>[]) {
  const ids = new Set<string>();
  const shortcuts = new Set<string>();
  for (const command of commands) {
    if (ids.has(command.id)) throw new Error(`Duplicate command: ${command.id}`);
    ids.add(command.id);
    if (!command.shortcut) continue;
    const key = `${!!command.shortcut.shift}:${command.shortcut.key.toLowerCase()}`;
    if (shortcuts.has(key)) throw new Error(`Duplicate shortcut: ${key}`);
    shortcuts.add(key);
  }
  return {
    run: (id: Id): boolean => {
      const command = commands.find((entry) => entry.id === id);
      if (!command || command.enabled === false) return false;
      command.run();
      return true;
    },
    onKeyDown: (event: KeyEvent) => {
      if (event.defaultPrevented) return;
      const command = commands.find(
        (entry) =>
          entry.shortcut && entry.enabled !== false && matchesShortcut(event, entry.shortcut),
      );
      if (!command) return;
      event.preventDefault();
      event.stopPropagation();
      command.run();
    },
  };
}
