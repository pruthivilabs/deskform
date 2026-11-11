import { control, space } from "@deskform/tokens";
import { usePalette } from "./appearance";
import type { Props } from "@gpuix/react";
import { Row } from "./layout";
import { style } from "./style";
export interface ToolbarProps extends Props {
  "aria-label": string;
}
export function Toolbar({ children, style: custom, ...props }: ToolbarProps) {
  const color = usePalette();
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
