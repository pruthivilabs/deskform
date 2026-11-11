import { color, control, radius, space } from "@deskform/tokens";
import {
  Button as NativeButton,
  useGpuixRequired,
  useWindowSize,
  type Props,
  type PublicInstance,
  type EventPayload,
} from "@gpuix/react";
import { useEffect, useRef, useState } from "react";
import { Stack } from "./layout";
import { Text } from "./text";
import { style } from "./style";

type Sizing =
  | { width: number; onWidthChange: (width: number) => void; defaultWidth?: never }
  | { width?: never; onWidthChange?: never; defaultWidth?: number };
export type SidebarProps = Props &
  Sizing & {
    label: string;
    minWidth?: number;
    maxWidth?: number;
    collapsed?: boolean;
    side?: "start" | "end";
  };
export function Sidebar({
  label,
  width,
  onWidthChange,
  defaultWidth = control.sidebarWidth,
  minWidth = 180,
  maxWidth = 440,
  collapsed = false,
  side = "start",
  children,
  style: custom,
  testId = "sidebar",
  ...props
}: SidebarProps) {
  const renderer = useGpuixRequired();
  const window = useWindowSize();
  const [localWidth, setLocalWidth] = useState(defaultWidth);
  const separator = useRef<PublicInstance>(null);
  const gesture = useRef<{ x: number; width: number } | null>(null);
  const maximum = Math.max(minWidth, Math.min(maxWidth, window.width * 0.45));
  const clamp = (value: number) => Math.max(minWidth, Math.min(maximum, value));
  const current = clamp(width ?? localWidth);
  const resize = (next: number) => (onWidthChange ?? setLocalWidth)(clamp(next));
  const cancel = () => {
    const start = gesture.current;
    gesture.current = null;
    if (start) resize(start.width);
  };
  const update = (event: EventPayload) => {
    const start = gesture.current;
    if (start && event.x !== undefined)
      resize(start.width + (event.x - start.x) * (side === "start" ? 1 : -1));
  };
  useEffect(() => {
    if (collapsed) gesture.current = null;
  }, [collapsed]);
  if (collapsed) return null;
  return (
    <Stack
      {...props}
      testId={testId}
      role="navigation"
      aria-label={label}
      gap={0}
      style={style(
        {
          position: "relative",
          width: current,
          flexShrink: 0,
          paddingRight: side === "start" ? 6 : 0,
          paddingLeft: side === "end" ? 6 : 0,
          backgroundColor: color.sidebar,
          borderColor: color.border,
          ...(side === "start" ? { borderRightWidth: 1 } : { borderLeftWidth: 1 }),
        },
        custom,
      )}
    >
      {children}
      <div
        ref={separator}
        testId={`${testId}-resize`}
        role="separator"
        aria-label={`Resize ${label}`}
        aria-orientation="vertical"
        aria-valuemin={minWidth}
        aria-valuemax={maximum}
        aria-valuenow={current}
        aria-valuetext={`${Math.round(current)} pixels`}
        tabIndex={0}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          ...(side === "start" ? { right: 0 } : { left: 0 }),
          width: 6,
          cursor: "col-resize",
          backgroundColor: "transparent",
          hover: { backgroundColor: color.surfaceHover },
          focusVisible: { backgroundColor: color.focus },
        }}
        onMouseDown={(event) => {
          if (event.button !== 0 || event.x === undefined) return;
          gesture.current = { x: event.x, width: current };
          if (separator.current) renderer.focusElement?.(separator.current.id);
        }}
        onMouseMove={(event) => {
          if (!gesture.current) return;
          if (event.pressedButton === 0) update(event);
          else cancel();
        }}
        onMouseUp={(event) => {
          if (event.button === 0) {
            update(event);
            gesture.current = null;
          }
        }}
        onBlur={cancel}
        onKeyDown={(event) => {
          if (event.key === "escape") {
            cancel();
            event.preventDefault();
            return;
          }
          if (
            gesture.current ||
            event.modifiers?.cmd ||
            event.modifiers?.ctrl ||
            event.modifiers?.alt ||
            event.modifiers?.shift
          )
            return;
          const next =
            event.key === "left"
              ? current - 10
              : event.key === "right"
                ? current + 10
                : event.key === "home"
                  ? minWidth
                  : event.key === "end"
                    ? maximum
                    : undefined;
          if (next !== undefined) {
            event.preventDefault();
            resize(next);
          }
        }}
      />
    </Stack>
  );
}
export interface SidebarSectionProps extends Props {
  title?: string;
}
export function SidebarSection({ title, children, style: custom, ...props }: SidebarSectionProps) {
  return (
    <Stack {...props} gap={space.sm} style={style({ padding: space.md, flexShrink: 0 }, custom)}>
      {title && (
        <Text size="caption" tone="muted">
          {title}
        </Text>
      )}
      {children}
    </Stack>
  );
}
export interface NavigationItemProps extends Omit<Props, "children" | "onClick"> {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}
export function NavigationItem({
  label,
  selected = false,
  disabled = false,
  onSelect,
  style: custom,
  ...props
}: NavigationItemProps) {
  return (
    <NativeButton
      {...props}
      aria-label={label}
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={onSelect}
      style={style(
        {
          minHeight: control.height,
          padding: space.sm,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: "transparent",
          backgroundColor: selected ? color.selected : "transparent",
          ...(!disabled && { hover: { backgroundColor: color.surfaceHover } }),
          focusVisible: { borderColor: color.focus },
        },
        custom,
        disabled && { opacity: 0.4 },
      )}
    >
      <Text size="label">{label}</Text>
    </NativeButton>
  );
}
