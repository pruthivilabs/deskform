import { color, space } from "@deskform/tokens";
import { createCommands, composeApplication } from "@deskform/runtime";
import {
  Button,
  Input,
  Sidebar,
  SidebarSection,
  NavigationItem,
  Stack,
  Text,
  Toolbar,
} from "@deskform/ui";
import { useToolbarTuning } from "@deskform/tooling/tuning";
import { useState } from "react";
import { application } from "./application";

export function Workbench({ tuningFile }: { tuningFile?: string }) {
  const [value, setValue] = useState("");
  const [count, setCount] = useState(0);
  const toolbar = useToolbarTuning(tuningFile);
  const commands = createCommands([
    { id: "increment", shortcut: { key: "n" }, run: () => setCount((n) => n + 1) },
  ]);
  return composeApplication(application, {
    commands,
    toolbar: (
      <Toolbar
        aria-label="Application toolbar"
        testId="toolbar"
        style={{
          minHeight: toolbar.height,
          gap: toolbar.gap,
          paddingLeft: toolbar.padding,
          paddingRight: toolbar.padding,
        }}
      >
        <Text size="label">Native framework workbench</Text>
      </Toolbar>
    ),
    sidebar: (
      <Sidebar label="Library" testId="sidebar">
        <SidebarSection title="Navigation">
          <NavigationItem label="Overview" selected onSelect={() => {}} />
          <NavigationItem label="Settings" onSelect={() => {}} />
        </SidebarSection>
        <SidebarSection title="Actions">
          <Button testId="action" onPress={() => commands.run("increment")}>
            Run command
          </Button>
        </SidebarSection>
      </Sidebar>
    ),
    content: (
      <Stack
        gap={space.lg}
        style={{ padding: space.xl, flexGrow: 1, backgroundColor: color.canvas }}
      >
        <Text size="heading">Consumer-owned content</Text>
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
    ),
  }).element;
}
