import { color, control, space } from "@deskform/tokens";
import type { Props } from "@gpuix/react";
import type { ReactNode } from "react";
import { Row, Stack } from "./layout";
import { style } from "./style";

export interface ShellProps extends Props {
  sidebar: ReactNode;
}
export function Shell({ sidebar, children, style: custom, ...props }: ShellProps) {
  return (
    <Row
      {...props}
      gap={0}
      style={style(
        { width: "100%", height: "100%", alignItems: "stretch", backgroundColor: color.canvas },
        custom,
      )}
    >
      <Stack
        gap={0}
        style={{
          width: control.sidebarWidth,
          flexShrink: 0,
          backgroundColor: color.sidebar,
          borderRightWidth: 1,
          borderColor: color.border,
        }}
      >
        {sidebar}
      </Stack>
      <Stack gap={0} style={{ flexGrow: 1 }}>
        {children}
      </Stack>
    </Row>
  );
}

export function Toolbar({ children, style: custom, ...props }: Props) {
  return (
    <Row
      {...props}
      role="toolbar"
      gap={space.sm}
      style={style(
        {
          minHeight: control.toolbarHeight,
          flexShrink: 0,
          paddingLeft: space.xl,
          paddingRight: space.xl,
          borderBottomWidth: 1,
          borderColor: color.border,
        },
        custom,
      )}
    >
      {children}
    </Row>
  );
}
