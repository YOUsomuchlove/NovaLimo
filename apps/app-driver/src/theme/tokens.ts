/**
 * @deprecated Import colors from @limousine-workspace/utils-core (NOVA_DRIVER, NOVA_BRAND)
 * — file giữ alias Expo font names cho tương thích ngược.
 *
 * Bản đồ Pen frame → màn hình (app-mobile.pen):
 * mbDrvLogin → LoginScreen · mbDrvPermOverlay → PermissionsScreen · mbDrvHomeTrips → HomeScreen
 * mbDrvTripDetail → TripDetailScreen · mbDrvNavPickup → ActiveNavigationScreen · mbDrvPaxList → PassengersScreen
 * mbDrvCargoMng → CargoPickScreen · mbDrvCargoItem → CargoScreen · mbDrvCargoScan → CargoScanScreen
 * mbDrvCargoCod → CargoCodScreen · mbDrvCargoTransfer → CargoTransferScreen · mbDrvChat → ChatScreen
 * mbDrvIncident → SosScreen · mbDrvShiftEnd → EndShiftScreen · mbDrvNotif → NotificationsScreen
 * mbDrvEarn → IncomeScreen · mbDrvProfile → ProfileScreen
 *
 * QA thủ công (p8): export PNG từ Pencil (export_nodes / get_screenshot) và so khớp Simulator
 * cùng khung 390×844 — chỉnh spacing/font nếu lệch.
 */
import { NOVA_BRAND, NOVA_DRIVER, NOVA_RADIUS } from '@limousine-workspace/utils-core';

/** @see app-mobile.pen — dark surfaces + CTA */
export const C = {
  bg: NOVA_DRIVER.bg,
  card: NOVA_DRIVER.card,
  cardElevated: '#111827',
  stroke: NOVA_BRAND.stroke,
  text: NOVA_BRAND.textOnDark,
  muted: NOVA_BRAND.muted,
  gold: NOVA_BRAND.gold,
  goldDim: NOVA_BRAND.goldDim,
  error: NOVA_BRAND.error,
  success: NOVA_BRAND.success,
  tabBar: NOVA_DRIVER.tabBar,
  tabActive: '#111827',
  overlay: NOVA_DRIVER.overlay,
  /** mbNavSheet, sheet đón khách */
  sheetBg: '#05080D',
  /** mbNavMapTint */
  mapTint: 'rgba(11, 18, 32, 0.35)',
  mapTopBar: 'rgba(15, 23, 42, 0.8)',
  ctaBlue: NOVA_BRAND.info,
  swipeTrack: '#022C22',
  swipeStroke: NOVA_BRAND.success,
  noContactBg: '#2A1E1E',
  noContactStroke: '#7F1D1D',
  sosRed: '#DC2626',
  sosStroke: '#FCA5A5',
  shiftOrange: '#EA580C',
  shiftOrangeStroke: '#FB923C',
  fabBlue: '#2563EB',
  fabBlueStroke: '#93C5FD',
  permDialogBg: '#F8FAFC',
  permScrim: 'rgba(0,0,0,0.5)',
  bottomNavWrap: '#0B1020',
} as const;

export const RADIUS = {
  card: NOVA_RADIUS.driverCard,
  tabBar: NOVA_RADIUS.driverTabBar,
  input: NOVA_RADIUS.driverInput,
  pill: NOVA_RADIUS.pill,
} as const;

/** Expo Google Fonts — tên sau khi loadFonts */
export const FONT = {
  regular: 'Inter_400Regular',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;
