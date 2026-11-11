import { color, control, radius, space } from "@deskform/tokens";
import { buttonProps, useGpuixRequired, type PublicInstance } from "@gpuix/react";
import { useRef } from "react";
import { Text } from "./text";

export interface TabOption {
  id: string;
  label: string;
}
export interface TabsProps {
  label: string;
  tabs: readonly TabOption[];
  value: string;
  onChange: (id: string) => void;
  testId?: string;
}

/** Controlled navigation for optional views. The consumer owns the selected content. */
export function Tabs({ label, tabs, value, onChange, testId = "tabs" }: TabsProps) {
  const renderer = useGpuixRequired();
  const refs = useRef(new Map<string, PublicInstance>());
  return (
    <div
      role="tablist"
      aria-label={label}
      testId={testId}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: space.xs,
        padding: 4,
        borderRadius: radius.md,
        backgroundColor: color.surface,
      }}
    >
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          ref={(instance) => {
            if (instance) refs.current.set(tab.id, instance);
            else refs.current.delete(tab.id);
          }}
          {...buttonProps({
            tabIndex: tab.id === value ? 0 : -1,
            onClick: () => onChange(tab.id),
            onKeyDown: (event) => {
              if (
                event.modifiers?.cmd ||
                event.modifiers?.ctrl ||
                event.modifiers?.alt ||
                event.modifiers?.shift
              )
                return;
              const next =
                event.key === "right"
                  ? (index + 1) % tabs.length
                  : event.key === "left"
                    ? (index + tabs.length - 1) % tabs.length
                    : event.key === "home"
                      ? 0
                      : event.key === "end"
                        ? tabs.length - 1
                        : undefined;
              if (next === undefined) return;
              const target = tabs[next];
              if (!target) return;
              event.preventDefault();
              onChange(target.id);
              const instance = refs.current.get(target.id);
              if (instance) renderer.focusElement?.(instance.id);
            },
          })}
          role="tab"
          aria-label={tab.label}
          aria-selected={tab.id === value}
          testId={`${testId}-${tab.id}`}
          style={{
            height: control.height - 8,
            paddingLeft: space.md,
            paddingRight: space.md,
            borderRadius: radius.sm,
            borderWidth: 1,
            borderColor: "transparent",
            backgroundColor: tab.id === value ? color.surfacePressed : "transparent",
            hover: { backgroundColor: color.surfaceHover },
            focusVisible: { borderColor: color.focus },
            cursor: "pointer",
          }}
        >
          <Text size="label">{tab.label}</Text>
        </div>
      ))}
    </div>
  );
}
