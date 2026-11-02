import { rnTheme } from '@limousine-workspace/design-tokens';
import { StyleSheet, type TextStyle } from 'react-native';

export const theme = rnTheme;
export const c = rnTheme.color;
export const sp = rnTheme.spacing;
export const r = rnTheme.radius;

const f = rnTheme.fontFamily;
const size = rnTheme.fontSize;

/** Typography presets (Inter, loaded in app-driver via @expo-google-fonts/inter). */
export const type = StyleSheet.create({
  display: {
    fontFamily: f.bold,
    fontSize: size['3xl'].size,
    lineHeight: size['3xl'].lineHeight,
    color: c.fg,
  },
  title: {
    fontFamily: f.semibold,
    fontSize: size['2xl'].size,
    lineHeight: size['2xl'].lineHeight,
    color: c.fg,
  },
  heading: {
    fontFamily: f.semibold,
    fontSize: size.lg.size,
    lineHeight: size.lg.lineHeight,
    color: c.fg,
  },
  body: {
    fontFamily: f.regular,
    fontSize: size.base.size,
    lineHeight: size.base.lineHeight,
    color: c.fg,
  },
  bodyMedium: {
    fontFamily: f.medium,
    fontSize: size.base.size,
    lineHeight: size.base.lineHeight,
    color: c.fg,
  },
  label: {
    fontFamily: f.medium,
    fontSize: size.sm.size,
    lineHeight: size.sm.lineHeight,
    color: c.fgSecondary,
  },
  caption: {
    fontFamily: f.regular,
    fontSize: size.xs.size,
    lineHeight: size.xs.lineHeight,
    color: c.fgMuted,
  },
  overline: {
    fontFamily: f.semibold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: c.fgMuted,
  },
}) satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;
