import { color, type } from "@deskform/tokens";
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
  return (
    <text
      {...props}
      style={style(type[size], { color: tone === "default" ? color.text : color[tone] }, custom)}
    >
      {children}
    </text>
  );
}
