import { color, lightColor, type Palette } from "@deskform/tokens";
import { createContext, useContext, type ReactNode } from "react";

export type Appearance = "light" | "dark";
const PaletteContext = createContext<Palette>(color);

export function AppearanceProvider({
  appearance,
  children,
}: {
  appearance: Appearance;
  children: ReactNode;
}) {
  return (
    <PaletteContext value={appearance === "light" ? lightColor : color}>{children}</PaletteContext>
  );
}

export function usePalette(): Palette {
  return useContext(PaletteContext);
}
