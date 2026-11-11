import { control, radius, space } from "@deskform/tokens";
import { usePalette } from "./appearance";
import {
  Button as NativeButton,
  type ButtonProps as NativeButtonProps,
  type StyleDesc,
} from "@gpuix/react";
import { style } from "./style";
import { Text } from "./text";

export interface ButtonProps extends Omit<NativeButtonProps, "children" | "onClick" | "style"> {
  children: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  style?: StyleDesc;
}

export function Button({
  children,
  onPress,
  variant = "secondary",
  disabled = false,
  style: custom,
  ...props
}: ButtonProps) {
  const color = usePalette();
  const primary = variant === "primary";
  return (
    <NativeButton
      {...props}
      aria-label={props["aria-label"] ?? children}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={onPress}
      style={style(
        {
          display: "flex",
          flexDirection: "row",
          height: control.height,
          paddingLeft: space.md,
          paddingRight: space.md,
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: "transparent",
          backgroundColor: primary
            ? color.accent
            : variant === "ghost"
              ? "transparent"
              : color.surface,
          cursor: disabled ? "default" : "pointer",
          userSelect: "none",
          ...(!disabled && {
            hover: { backgroundColor: primary ? color.accentHover : color.surfaceHover },
            active: { backgroundColor: color.surfacePressed },
          }),
          focusVisible: { borderColor: color.focus },
        },
        custom,
        disabled && { opacity: 0.4 },
      )}
    >
      <Text
        size="label"
        style={{
          color: primary ? color.onAccent : variant === "danger" ? color.danger : color.text,
        }}
      >
        {children}
      </Text>
    </NativeButton>
  );
}
