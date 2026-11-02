import { alpha, palette as p } from './palette';

export type ThemeName = 'dark' | 'light';

interface StatusTone {
  /** Text / icon colour on the tinted background */
  fg: string;
  /** Tinted background (tags, alerts) */
  bg: string;
  border: string;
  /** Solid fill (dots, progress, badges) */
  solid: string;
}

export interface SemanticTheme {
  canvas: string;
  surface1: string;
  surface2: string;
  surface3: string;
  overlay: string;
  scrim: string;

  borderSubtle: string;
  borderDefault: string;
  borderStrong: string;

  fg: string;
  fgSecondary: string;
  fgMuted: string;
  fgDisabled: string;
  fgInverse: string;

  brand: string;
  brandHover: string;
  brandActive: string;
  brandSubtle: string;
  /** Gold used as text/link colour — tuned per theme for contrast */
  brandFg: string;
  onBrand: string;
  focusRing: string;

  success: StatusTone;
  warning: StatusTone;
  danger: StatusTone;
  info: StatusTone;

  shadowE1: string;
  shadowE2: string;
  shadowE3: string;
  shadowBrand: string;
}

const darkTone = (c: { 400: string; 500: string }): StatusTone => ({
  fg: c[400],
  bg: alpha(c[500], 0.12),
  border: alpha(c[500], 0.32),
  solid: c[500],
});

const lightTone = (c: {
  500: string;
  600: string;
  700: string;
}): StatusTone => ({
  fg: c[700],
  bg: alpha(c[500], 0.1),
  border: alpha(c[500], 0.28),
  solid: c[600],
});

/** Default theme for Admin console, Driver app and Booking hero areas. */
export const darkTheme: SemanticTheme = {
  canvas: p.navy[900],
  surface1: p.navy[800],
  surface2: p.navy[700],
  surface3: p.navy[600],
  overlay: alpha(p.navy[950], 0.72),
  scrim: alpha(p.black, 0.6),

  borderSubtle: alpha(p.slate[400], 0.12),
  borderDefault: alpha(p.slate[400], 0.2),
  borderStrong: alpha(p.slate[400], 0.32),

  fg: p.slate[50],
  fgSecondary: p.slate[300],
  fgMuted: p.slate[400],
  fgDisabled: p.slate[500],
  fgInverse: p.navy[800],

  brand: p.gold[500],
  brandHover: p.gold[400],
  brandActive: p.gold[600],
  brandSubtle: alpha(p.gold[500], 0.12),
  brandFg: p.gold[400],
  onBrand: p.navy[800],
  focusRing: alpha(p.gold[400], 0.55),

  success: darkTone(p.green),
  warning: darkTone(p.amber),
  danger: darkTone(p.red),
  info: darkTone(p.blue),

  shadowE1: `0 1px 2px ${alpha(p.black, 0.4)}, inset 0 1px 0 ${alpha(p.white, 0.04)}`,
  shadowE2: `0 8px 24px -8px ${alpha(p.black, 0.55)}, inset 0 1px 0 ${alpha(p.white, 0.05)}`,
  shadowE3: `0 24px 48px -12px ${alpha(p.black, 0.65)}, inset 0 1px 0 ${alpha(p.white, 0.06)}`,
  shadowBrand: `0 6px 24px -6px ${alpha(p.gold[500], 0.45)}`,
};

/** Light surfaces — Booking content sections (forms, tables, legal pages). */
export const lightTheme: SemanticTheme = {
  canvas: p.slate[50],
  surface1: p.white,
  surface2: p.slate[100],
  surface3: p.slate[200],
  overlay: alpha(p.navy[900], 0.55),
  scrim: alpha(p.navy[950], 0.45),

  borderSubtle: alpha(p.slate[900], 0.08),
  borderDefault: alpha(p.slate[900], 0.14),
  borderStrong: alpha(p.slate[900], 0.24),

  fg: p.slate[900],
  fgSecondary: p.slate[700],
  fgMuted: p.slate[500],
  fgDisabled: p.slate[400],
  fgInverse: p.slate[50],

  brand: p.gold[500],
  brandHover: p.gold[600],
  brandActive: p.gold[700],
  brandSubtle: alpha(p.gold[500], 0.14),
  brandFg: p.gold[800],
  onBrand: p.navy[800],
  focusRing: alpha(p.gold[600], 0.5),

  success: lightTone(p.green),
  warning: lightTone(p.amber),
  danger: lightTone(p.red),
  info: lightTone(p.blue),

  shadowE1: `0 1px 2px ${alpha(p.slate[900], 0.06)}, 0 1px 1px ${alpha(p.slate[900], 0.04)}`,
  shadowE2: `0 8px 24px -8px ${alpha(p.slate[900], 0.14)}`,
  shadowE3: `0 24px 48px -12px ${alpha(p.slate[900], 0.22)}`,
  shadowBrand: `0 6px 24px -6px ${alpha(p.gold[600], 0.4)}`,
};

export const themes: Record<ThemeName, SemanticTheme> = {
  dark: darkTheme,
  light: lightTheme,
};
