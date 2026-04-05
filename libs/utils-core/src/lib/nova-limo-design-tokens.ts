/**
 * NovaLimo — design tokens (single source of truth for hex/radius/font).
 * Brand palette aligns with Pencil: web-admin.pen, web-bôking.pen, app-mobile.pen
 * (marketing surfaces use navy #0B1020 + gold #D4AF37 + Inter).
 *
 * Pencil variable themes (web-bôking.pen) expose additional shadcn-like tokens
 * (`--primary` etc.); Nova brand overrides primary CTA to gold in Ant Design themes.
 */
export const NOVA_BRAND = {
  navy: '#0B1020',
  /** web-admin.pen — Sidebar fill */
  adminSiderBg: '#050814',
  /** web-admin.pen — Sidebar stroke */
  adminSiderStroke: '#1F2937',
  navyDeep: '#020617',
  gold: '#D4AF37',
  goldDim: '#b8922a',
  goldHover: '#c9a227',
  white: '#FFFFFF',
  textOnDark: '#F9FAFB',
  muted: '#94A3B8',
  stroke: '#334155',
  slateLayoutBg: '#f1f5f9',
  slateText: '#0f172a',
  slateMuted: '#64748b',
  info: '#2563EB',
  success: '#22C55E',
  warning: '#EAB308',
  error: '#EF4444',
} as const;

/** Driver app dark surfaces — app-mobile.pen */
export const NOVA_DRIVER = {
  bg: NOVA_BRAND.navyDeep,
  card: NOVA_BRAND.navy,
  cardElevated: '#111827',
  tabBar: NOVA_BRAND.navy,
  overlay: 'rgba(2, 6, 23, 0.92)',
} as const;

export const NOVA_RADIUS = {
  /** AntD admin default */
  admin: 8,
  /** Booking buttons / cards */
  bookingLg: 14,
  bookingCard: 20,
  /** Driver app — app-mobile.pen */
  driverCard: 16,
  driverTabBar: 20,
  driverInput: 12,
  pill: 999,
} as const;

export const NOVA_FONT_STACK =
  "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

/** CSS custom properties for Next.js global.css imports */
export function novaLimoCssVariablesBlock(): string {
  return `:root {
  --nl-navy: ${NOVA_BRAND.navy};
  --nl-navy-deep: ${NOVA_BRAND.navyDeep};
  --nl-gold: ${NOVA_BRAND.gold};
  --nl-gold-dim: ${NOVA_BRAND.goldDim};
  --nl-text-on-dark: ${NOVA_BRAND.textOnDark};
  --nl-muted: ${NOVA_BRAND.muted};
  --nl-stroke: ${NOVA_BRAND.stroke};
  --nl-layout-bg: ${NOVA_BRAND.slateLayoutBg};
  --nl-font: ${NOVA_FONT_STACK};
  --nl-radius-admin: ${NOVA_RADIUS.admin}px;
  --nl-radius-booking: ${NOVA_RADIUS.bookingLg}px;
}`;
}
