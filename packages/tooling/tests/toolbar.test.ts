import { expect, it } from "vite-plus/test";
import { defaultToolbar, toolbarSchema } from "../src/toolbar-values";
it("accepts usable toolbar values and rejects invalid or unknown settings", () => {
  expect(toolbarSchema.parse({ ...defaultToolbar, height: 80 })).toEqual({
    ...defaultToolbar,
    height: 80,
  });
  for (const value of [
    { ...defaultToolbar, height: -1 },
    { ...defaultToolbar, height: 1000 },
    { ...defaultToolbar, accent: "invalid" },
    { ...defaultToolbar, unsupported: true },
  ]) {
    expect(toolbarSchema.safeParse(value).success).toBe(false);
  }
});
