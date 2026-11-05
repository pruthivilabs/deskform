export const color = {
  canvas: "#15181f",
  sidebar: "#1b1f28",
  surface: "#222733",
  surfaceHover: "#2d3442",
  surfacePressed: "#353e50",
  field: "#191e27",
  border: "#343c4a",
  text: "#edf0f7",
  muted: "#a6afc0",
  faint: "#7d899e",
  accent: "#b9c8ff",
  accentHover: "#d0dbff",
  onAccent: "#1b2b55",
  selected: "#293753",
  focus: "#a5bcff",
  danger: "#ffb4b4",
  success: "#b0d8be",
} as const;

export const space = { none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 5, md: 8, lg: 12 } as const;
export const type = {
  caption: { fontSize: 11, lineHeight: 16 },
  body: { fontSize: 13, lineHeight: 20 },
  label: { fontSize: 13, lineHeight: 20, fontWeight: 500 },
  heading: { fontSize: 20, lineHeight: 28, fontWeight: 600 },
  title: { fontSize: 26, lineHeight: 34, fontWeight: 600 },
  code: { fontSize: 13, lineHeight: 22, fontFamily: "Menlo" },
} as const;
export const control = { height: 34, toolbarHeight: 64, sidebarWidth: 290 } as const;
