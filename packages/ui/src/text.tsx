import { type } from "@deskform/tokens";
import { usePalette } from "./appearance";
import type { Props } from "@gpuix/react";
import { style } from "./style";

export interface TextProps extends Omit<Props, "children"> {
  children: string | number;
  size?: keyof typeof type;
  tone?: "default" | "muted" | "faint" | "danger" | "success";
}

export function Text({
  children,
  size = "body",
  tone = "default",
  style: custom,
  ...props
}: TextProps) {
  const color = usePalette();
  return (
    <text
      {...props}
      style={style(type[size], { color: tone === "default" ? color.text : color[tone] }, custom)}
    >
      {children}
    </text>
  );
}
