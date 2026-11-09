import { composeApplication, createCommands } from "@deskform/runtime";
import {
  Button,
  Sidebar,
  SidebarSection,
  NavigationItem,
  Toolbar,
  Text,
  Stack,
} from "@deskform/ui";
import { space } from "@deskform/tokens";
import { useToolbarTuning } from "@deskform/tooling/tuning";
import { useState } from "react";
import { application } from "./application";
export function App() {
  const [page, setPage] = useState("Workspace");
  const tuning = useToolbarTuning(process.env.DESKFORM_TUNING_FILE);
  const commands = createCommands([
    { id: "workspace", shortcut: { key: "1" }, run: () => setPage("Workspace") },
    { id: "settings", shortcut: { key: "2" }, run: () => setPage("Settings") },
  ]);
  return composeApplication(application, {
    commands,
    toolbar: (
      <Toolbar
        aria-label="Application toolbar"
        testId="toolbar"
        style={{
          minHeight: tuning.height,
          gap: tuning.gap,
          paddingLeft: tuning.padding,
          paddingRight: tuning.padding,
        }}
      >
        <Text size="label">{application.name}</Text>
        <Button
          variant="primary"
          style={{ backgroundColor: tuning.accent }}
          onPress={() => commands.run("workspace")}
        >
          Workspace
        </Button>
      </Toolbar>
    ),
    sidebar: (
      <Sidebar label="Main navigation">
        <SidebarSection title="Application">
          <NavigationItem
            testId="workspace"
            label="Workspace"
            selected={page === "Workspace"}
            onSelect={() => commands.run("workspace")}
          />
          <NavigationItem
            testId="settings"
            label="Settings"
            selected={page === "Settings"}
            onSelect={() => commands.run("settings")}
          />
        </SidebarSection>
      </Sidebar>
    ),
    content: (
      <Stack gap={space.lg} style={{ padding: space.xl, flexGrow: 1 }}>
        <Text testId="page-title" size="heading">
          {page}
        </Text>
        <Text tone="muted">Your application content belongs here.</Text>
      </Stack>
    ),
  }).element;
}
