/**
 * Bản đồ Pen frame → màn hình (app-mobile.pen & app-mobile-chat-shift.pen):
 * mbDrvLogin → LoginScreen · mbDrvPermOverlay → PermissionsScreen · mbDrvHomeTrips → HomeScreen
 * mbDrvTripDetail → TripDetailScreen · mbDrvNavPickup → ActiveNavigationScreen · mbDrvPaxList → PassengersScreen
 * mbDrvCargoMng → CargoPickScreen · mbDrvCargoItem → CargoScreen · mbDrvCargoScan → CargoScanScreen
 * mbDrvCargoCod → CargoCodScreen · mbDrvCargoTransfer → CargoTransferScreen · mbDrvChat → ChatScreen
 * mbDrvIncident → SosScreen · mbDrvShiftEnd → EndShiftScreen · mbDrvNotif → NotificationsScreen
 * mbDrvEarn → IncomeScreen · mbDrvProfile → ProfileScreen
 */
import { alpha, palette, rnTheme } from '@limousine-workspace/design-tokens';
import {
  NOVA_BRAND,
  NOVA_DRIVER,
  NOVA_RADIUS,
} from '@limousine-workspace/utils-core';

const c = rnTheme.color;

/** @see app-mobile.pen — dark surfaces + CTA */
export const C = {
  bg: NOVA_DRIVER.bg,
  card: NOVA_DRIVER.card,
  cardElevated: c.surface2,
  stroke: NOVA_BRAND.stroke,
  text: NOVA_BRAND.textOnDark,
  muted: NOVA_BRAND.muted,
  gold: NOVA_BRAND.gold,
  goldDim: NOVA_BRAND.goldDim,
  error: NOVA_BRAND.error,
  success: NOVA_BRAND.success,
  tabBar: NOVA_DRIVER.tabBar,
  tabActive: c.surface2,
  overlay: NOVA_DRIVER.overlay,
  /** mbNavSheet, sheet đón khách */
  sheetBg: c.canvas,
  /** mbNavMapTint */
  mapTint: alpha(palette.navy[800], 0.35),
  mapTopBar: alpha(palette.slate[900], 0.85),
  ctaBlue: NOVA_BRAND.info,
  swipeTrack: c.success.bg,
  swipeStroke: NOVA_BRAND.success,
  noContactBg: c.danger.bg,
  noContactStroke: c.danger.border,
  noContactText: c.danger.fg,
  sosRed: palette.red[600],
  sosStroke: palette.red[400],
  shiftOrange: palette.amber[600],
  shiftOrangeStroke: palette.amber[400],
  fabBlue: palette.blue[600],
  fabBlueStroke: palette.blue[400],
  permDialogBg: palette.slate[50],
  permDialogTitle: palette.slate[900],
  permDialogText: palette.slate[600],
  permDialogMuted: palette.slate[500],
  permScrim: c.scrim,
  bottomNavWrap: palette.navy[800],
  white: palette.white,
  black: palette.black,
  slate200: palette.slate[200],
  slate800: palette.slate[800],
  slate900: palette.slate[900],
} as const;

export const RADIUS = {
  card: NOVA_RADIUS.driverCard,
  tabBar: NOVA_RADIUS.driverTabBar,
  input: NOVA_RADIUS.driverInput,
  pill: NOVA_RADIUS.pill,
} as const;

/** Expo Google Fonts — tên sau khi loadFonts */
export const FONT = {
  regular: rnTheme.fontFamily.regular,
  medium: rnTheme.fontFamily.medium,
  semibold: rnTheme.fontFamily.semibold,
  bold: rnTheme.fontFamily.bold,
} as const;
