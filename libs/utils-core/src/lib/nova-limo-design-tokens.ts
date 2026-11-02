/**
 * @deprecated Legacy token names kept only so pre-rebuild screens keep compiling.
 * New code imports from `@limousine-workspace/design-tokens` (semantic tokens) instead.
 * Values are derived from the design-tokens palette — there are no hex literals here any more.
 * Delete this file once the last legacy screen is rebuilt (end of phase 5).
 */
import {
  darkTheme,
  fontFamily,
  palette,
  radius,
} from '@limousine-workspace/design-tokens';

export const NOVA_BRAND = {
  navy: palette.navy[800],
  adminSiderBg: palette.navy[900],
  adminSiderStroke: palette.slate[800],
  navyDeep: palette.navy[950],
  gold: palette.gold[500],
  goldDim: palette.gold[600],
  goldHover: palette.gold[400],
  white: palette.white,
  textOnDark: palette.slate[50],
  muted: palette.slate[400],
  stroke: palette.slate[700],
  slateLayoutBg: palette.slate[100],
  slateText: palette.slate[900],
  slateMuted: palette.slate[500],
  info: palette.blue[600],
  success: palette.green[500],
  warning: palette.amber[500],
  error: palette.red[500],
} as const;

export const NOVA_DRIVER = {
  bg: palette.navy[950],
  card: palette.navy[800],
  cardElevated: palette.navy[700],
  tabBar: palette.navy[800],
  overlay: darkTheme.overlay,
} as const;

export const NOVA_RADIUS = {
  admin: 8,
  bookingLg: radius.card,
  bookingCard: radius.panel,
  driverCard: 16,
  driverTabBar: radius.panel,
  driverInput: 12,
  pill: 999,
} as const;

export const NOVA_FONT_STACK = fontFamily.sans;
