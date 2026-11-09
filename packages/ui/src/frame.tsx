import { color, radius, space } from "@deskform/tokens";
import type { Props } from "@gpuix/react";
import type { ReactNode } from "react";
import { Row, Stack } from "./layout";
import { style } from "./style";

export interface AppFrameProps extends Props {
  toolbar?: ReactNode;
  sidebar?: ReactNode;
  inspector?: ReactNode;
  status?: ReactNode;
}
export function Workspace({ style: custom, ...props }: Props) {
  return (
    <Stack
      {...props}
      gap={0}
      style={style({ flexGrow: 1, backgroundColor: color.canvas }, custom)}
    />
  );
}
export function AppFrame({
  toolbar,
  sidebar,
  inspector,
  status,
  children,
  style: custom,
  ...props
}: AppFrameProps) {
  return (
    <Stack
      {...props}
      gap={0}
      style={style({ width: "100%", height: "100%", backgroundColor: color.sidebar }, custom)}
    >
      {toolbar}
      <Row
        gap={0}
        style={{
          flexGrow: 1,
          minHeight: 0,
          alignItems: "stretch",
          margin: space.sm,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: color.border,
          overflow: "hidden",
        }}
      >
        {sidebar}
        <Workspace>{children}</Workspace>
        {inspector}
      </Row>
      {status}
    </Stack>
  );
}
