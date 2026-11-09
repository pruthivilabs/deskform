import { color, space } from "@deskform/tokens";
import { createCommands } from "@deskform/runtime";
import { Button, Input, Shell, Stack, Text, Toolbar } from "@deskform/ui";
import { useToolbarTuning } from "@deskform/tooling/tuning";
import { useState } from "react";

export function Workbench({ tuningFile }: { tuningFile?: string }) {
  const [value, setValue] = useState("");
  const [count, setCount] = useState(0);
  const toolbar = useToolbarTuning(tuningFile);
  const commands = createCommands([
    { id: "increment", shortcut: { key: "n" }, run: () => setCount((n) => n + 1) },
  ]);
  return (
    <Shell
      onKeyDown={commands.onKeyDown}
      sidebar={
        <Stack style={{ padding: space.lg }}>
          <Text size="heading">Framework fixture</Text>
          <Button testId="action" onPress={() => commands.run("increment")}>
            Run command
          </Button>
        </Stack>
      }
    >
      <Toolbar
        testId="toolbar"
        style={{
          minHeight: toolbar.height,
          gap: toolbar.gap,
          paddingLeft: toolbar.padding,
          paddingRight: toolbar.padding,
        }}
      >
        <Text size="label">Native verification surface</Text>
      </Toolbar>
      <Stack
        gap={space.lg}
        style={{ padding: space.xl, flexGrow: 1, backgroundColor: color.canvas }}
      >
        <Input
          autoFocus
          testId="input"
          aria-label="Fixture input"
          value={value}
          onValueChange={setValue}
        />
        <Text testId="echo">{value || "Empty input"}</Text>
        <Text testId="count">{String(count)}</Text>
      </Stack>
    </Shell>
  );
}
