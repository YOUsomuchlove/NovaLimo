/** Non-colour scales shared by web (Tailwind/antd) and mobile (RN). Values in px. */

export const fontFamily = {
  /** `--font-inter` is set by `next/font` in each Next app; Expo loads Inter_* by name. */
  sans: "var(--font-inter), 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  mono: "ui-monospace, SFMono-Regular, 'JetBrains Mono', Menlo, Consolas, monospace",
} as const;

/**
 * Type scale. Tailwind's default `text-xs … text-5xl` already matches this scale,
 * so only the extra steps are emitted as utilities: `text-ui` (13px, dense tables/forms)
 * and `text-display` (56px, marketing hero).
 */
export const fontSize = {
  xs: { size: 12, lineHeight: 16 },
  ui: { size: 13, lineHeight: 20 },
  sm: { size: 14, lineHeight: 20 },
  base: { size: 16, lineHeight: 24 },
  lg: { size: 18, lineHeight: 28 },
  xl: { size: 20, lineHeight: 28 },
  '2xl': { size: 24, lineHeight: 32 },
  '3xl': { size: 30, lineHeight: 36 },
  '4xl': { size: 36, lineHeight: 40 },
  '5xl': { size: 48, lineHeight: 52 },
  display: { size: 56, lineHeight: 60 },
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/** 4px grid (identical to Tailwind's spacing, exported for RN). */
export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

/**
 * Semantic radii — named by role so they never clash with Tailwind's `rounded-sm/md/lg`.
 * `rounded-control` buttons/inputs · `rounded-card` cards/tables · `rounded-panel` large panels/modals
 * · `rounded-sheet` bottom sheets & hero cards.
 */
export const radius = {
  tag: 6,
  control: 10,
  card: 14,
  panel: 20,
  sheet: 28,
  pill: 9999,
} as const;

export const motion = {
  duration: { fast: 150, base: 200, slow: 300 },
  /** Calm "luxury" easing: quick start, soft landing. */
  easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
} as const;

export const zIndex = {
  base: 0,
  sticky: 100,
  header: 200,
  drawer: 1000,
  modal: 1100,
  toast: 1200,
  tooltip: 1300,
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1440,
} as const;

/** Layout constants straight from the .pen frames. */
export const layout = {
  adminSidebarWidth: 264,
  adminSidebarCollapsed: 76,
  adminHeaderHeight: 64,
  bookingHeaderHeight: 72,
  contentMaxWidth: 1440,
  driverTabBarHeight: 72,
} as const;
