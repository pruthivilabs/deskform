import { color, control, space } from "@deskform/tokens";
import { z } from "zod";

export const toolbarSchema = z
  .object({
    height: z.number().int().min(48).max(88),
    gap: z.number().int().min(4).max(20),
    padding: z.number().int().min(12).max(32),
    accent: z.string().regex(/^#[0-9a-f]{6}$/iu),
  })
  .strict();
export type ToolbarValues = z.infer<typeof toolbarSchema>;
export const defaultToolbar: ToolbarValues = {
  height: control.toolbarHeight,
  gap: space.sm,
  padding: space.xl,
  accent: color.accent,
};
