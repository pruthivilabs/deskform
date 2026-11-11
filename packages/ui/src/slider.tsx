import { radius, space } from "@deskform/tokens";
import { usePalette } from "./appearance";
import { useGpuixRequired, type EventPayload, type PublicInstance } from "@gpuix/react";
import { useRef } from "react";
import { Stack } from "./layout";
import { Text } from "./text";

export interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  formatValue?: (value: number) => string;
  testId?: string;
}

/** A controlled, single-value native slider. Values snap to step relative to min. */
export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  formatValue = String,
  testId = "slider",
}: SliderProps) {
  const color = usePalette();
  const renderer = useGpuixRequired();
  const track = useRef<PublicInstance>(null);
  const dragging = useRef(false);
  if (
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    max <= min ||
    !Number.isFinite(step) ||
    step <= 0 ||
    !Number.isFinite(value)
  ) {
    throw new Error("Slider requires finite values, max greater than min, and a positive step.");
  }
  const current = Math.max(min, Math.min(max, value));
  const change = (next: number) => {
    if (disabled) return;
    const snapped = min + Math.round((next - min) / step) * step;
    const bounded = next <= min ? min : next >= max ? max : Math.max(min, Math.min(max, snapped));
    onChange(Number(bounded.toPrecision(12)));
  };
  const move = (event: EventPayload) => {
    const bounds = track.current && renderer.getElementBounds?.(track.current.id);
    if (bounds && bounds.width > 0 && event.x !== undefined)
      change(min + ((event.x - bounds.x) / bounds.width) * (max - min));
  };
  return (
    <Stack gap={space.sm}>
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
        <Text size="label">{label}</Text>
        <Text tone="muted" testId={`${testId}-value`}>
          {formatValue(current)}
        </Text>
      </div>
      <div
        ref={track}
        testId={testId}
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={current}
        aria-valuetext={formatValue(current)}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        style={{
          height: 28,
          position: "relative",
          justifyContent: "center",
          cursor: disabled ? "default" : "pointer",
          opacity: disabled ? 0.4 : 1,
          borderWidth: 1,
          borderColor: "transparent",
          focusVisible: { borderColor: color.focus },
        }}
        onMouseDown={(event) => {
          if (disabled || event.button !== 0) return;
          dragging.current = true;
          if (track.current) renderer.focusElement?.(track.current.id);
          move(event);
        }}
        onMouseMove={(event) => {
          if (dragging.current && event.pressedButton === 0) move(event);
          else if (dragging.current) dragging.current = false;
        }}
        onMouseUp={(event) => {
          if (dragging.current && event.button === 0) move(event);
          dragging.current = false;
        }}
        onBlur={() => {
          dragging.current = false;
        }}
        onKeyDown={(event) => {
          if (
            disabled ||
            event.modifiers?.cmd ||
            event.modifiers?.ctrl ||
            event.modifiers?.alt ||
            event.modifiers?.shift
          )
            return;
          const next =
            event.key === "right" || event.key === "up"
              ? current + step
              : event.key === "left" || event.key === "down"
                ? current - step
                : event.key === "home"
                  ? min
                  : event.key === "end"
                    ? max
                    : undefined;
          if (next !== undefined) {
            event.preventDefault();
            change(next);
          }
        }}
      >
        <div
          style={{
            height: 4,
            borderRadius: radius.sm,
            backgroundColor: color.border,
            width: "100%",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 12,
            height: 4,
            width: `${((current - min) / (max - min)) * 100}%`,
            borderRadius: radius.sm,
            backgroundColor: color.accent,
            pointerEvents: "none",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              marginRight: -6,
              marginTop: -4,
              borderRadius: 6,
              backgroundColor: color.text,
            }}
          />
        </div>
      </div>
    </Stack>
  );
}
