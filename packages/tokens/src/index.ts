export const color = {
  canvas: "#171717",
  sidebar: "#1d1d1d",
  surface: "#252525",
  surfaceHover: "#343434",
  surfacePressed: "#414141",
  field: "#1d1d1d",
  border: "#404040",
  text: "#f3f3f3",
  muted: "#aaaaaa",
  faint: "#919191",
  accent: "#a9c5ff",
  accentHover: "#c4d7ff",
  onAccent: "#13254a",
  selected: "#373737",
  focus: "#a9c5ff",
  danger: "#ffb4b4",
  success: "#b0d8be",
} as const;

export const space = { none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 5, md: 8, lg: 12 } as const;
export const type = {
  caption: { fontSize: 12, lineHeight: 16 },
  body: { fontSize: 13, lineHeight: 20 },
  label: { fontSize: 13, lineHeight: 20, fontWeight: 500 },
  heading: { fontSize: 16, lineHeight: 22, fontWeight: 600 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: 700 },
  code: { fontSize: 13, lineHeight: 22, fontFamily: "Menlo" },
} as const;
export const control = { height: 36, toolbarHeight: 64, sidebarWidth: 290 } as const;
