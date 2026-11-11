import { space } from "@deskform/tokens";
import type { ReactNode } from "react";
import { Stack } from "./layout";
import { Text } from "./text";

export interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <Stack gap={space.lg} style={{ maxWidth: 480 }}>
      <Stack gap={space.xs}>
        <Text size="heading">{title}</Text>
        {description && <Text tone="muted">{description}</Text>}
      </Stack>
      {children}
    </Stack>
  );
}
