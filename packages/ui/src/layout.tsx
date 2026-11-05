import { space } from "@deskform/tokens";
import type { Props } from "@gpuix/react";
import { style } from "./style";

export interface LayoutProps extends Props {
  gap?: number;
}

export function Stack({ gap = space.sm, style: custom, ...props }: LayoutProps) {
  return (
    <div
      {...props}
      style={style(
        { display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, gap },
        custom,
      )}
    />
  );
}

export function Row({ gap = space.sm, style: custom, ...props }: LayoutProps) {
  return (
    <div
      {...props}
      style={style(
        { display: "flex", flexDirection: "row", alignItems: "center", minWidth: 0, gap },
        custom,
      )}
    />
  );
}
