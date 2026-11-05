import { color, control, radius, space, type } from "@deskform/tokens";
import type {
  InputProps as NativeInputProps,
  TextareaProps as NativeTextareaProps,
  StyleDesc,
} from "@gpuix/react";
import { style } from "./style";

type Controlled = {
  value: string;
  onValueChange: (value: string) => void;
  "aria-label": string;
  disabled?: boolean;
};
export type InputProps = Omit<NativeInputProps, "value" | "onChange" | "children"> & Controlled;
export type TextareaProps = Omit<NativeTextareaProps, "value" | "onChange" | "children"> &
  Controlled;

const field: StyleDesc = {
  ...type.body,
  minWidth: 0,
  padding: space.sm,
  borderWidth: 1,
  borderRadius: radius.md,
  borderColor: color.border,
  backgroundColor: color.field,
  color: color.text,
  cursor: "text",
  focusVisible: { borderColor: color.focus },
};

export function Input({
  value,
  onValueChange,
  disabled,
  style: custom,
  readOnly,
  tabIndex = 0,
  theme,
  ...props
}: InputProps) {
  return (
    <input
      {...props}
      value={value}
      readOnly={readOnly || disabled}
      tabIndex={disabled ? -1 : tabIndex}
      theme={{ caret: color.focus, ...theme }}
      style={style(field, { height: control.height }, custom, disabled && { opacity: 0.4 })}
      onChange={(event) => {
        if (!disabled && event.value !== undefined) onValueChange(event.value);
      }}
    />
  );
}

export function Textarea({
  value,
  onValueChange,
  disabled,
  style: custom,
  readOnly,
  tabIndex = 0,
  theme,
  minRows = 6,
  maxRows = 40,
  ...props
}: TextareaProps) {
  return (
    <textarea
      {...props}
      value={value}
      readOnly={readOnly || disabled}
      tabIndex={disabled ? -1 : tabIndex}
      minRows={minRows}
      maxRows={maxRows}
      theme={{ caret: color.focus, ...theme }}
      style={style(field, type.code, custom, disabled && { opacity: 0.4 })}
      onChange={(event) => {
        if (!disabled && event.value !== undefined) onValueChange(event.value);
      }}
    />
  );
}
