import { composeApplication, createCommands } from "@deskform/runtime";
import {
  Button,
  Sidebar,
  SidebarSection,
  NavigationItem,
  Toolbar,
  Text,
  Stack,
  Slider,
  SettingsSection,
} from "@deskform/ui";
import { space } from "@deskform/tokens";
import { useToolbarTuning } from "@deskform/tooling/tuning";
import { useState } from "react";
import { application } from "./application";
export function App() {
  const [page, setPage] = useState("Workspace");
  const [sidebarWidth, setSidebarWidth] = useState(290);
  const [contentPadding, setContentPadding] = useState(24);
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
      <Sidebar label="Main navigation" width={sidebarWidth} onWidthChange={setSidebarWidth}>
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
      <Stack gap={space.lg} style={{ padding: contentPadding, flexGrow: 1 }}>
        <Text testId="page-title" size="heading">
          {page}
        </Text>
        {page === "Settings" ? (
          <SettingsSection title="Layout" description="Adjust the workspace for this session.">
            <Slider
              label="Sidebar width"
              testId="sidebar-width"
              value={sidebarWidth}
              onChange={setSidebarWidth}
              min={180}
              max={400}
              step={10}
              formatValue={(value) => `${value} px`}
            />
            <Slider
              label="Content padding"
              testId="content-padding"
              value={contentPadding}
              onChange={setContentPadding}
              min={8}
              max={48}
              step={4}
              formatValue={(value) => `${value} px`}
            />
          </SettingsSection>
        ) : (
          <Text tone="muted">Your application content belongs here.</Text>
        )}
      </Stack>
    ),
  }).element;
}
