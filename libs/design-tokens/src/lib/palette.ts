/**
 * Raw colour palette — the ONLY place in the monorepo where brand hex values live.
 * Apps never use these directly; they use the semantic tokens in `semantic.ts`
 * (exposed as Tailwind utilities, antd theme tokens and the RN theme).
 *
 * Anchors taken from the Pencil files:
 * - navy-800 `#0B1020`  web-admin.pen header / web-bôking.pen header
 * - navy-900 `#05070F`  close to web-admin.pen sidebar `#050814` and app-mobile.pen `#020617`
 * - gold-500 `#D4AF37`  primary CTA in all three .pen files
 */
export const palette = {
  navy: {
    950: '#020409',
    900: '#05070F',
    800: '#0B1020',
    700: '#111827',
    600: '#1A2236',
    500: '#252F48',
    400: '#36435F',
    300: '#4B5A7A',
  },
  gold: {
    50: '#FBF7E9',
    100: '#F5EBC6',
    200: '#EDDA94',
    300: '#E4C766',
    400: '#DCBA4A',
    500: '#D4AF37',
    600: '#B8952A',
    700: '#947622',
    800: '#6F591B',
    900: '#4A3B12',
  },
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  green: { 400: '#4ADE80', 500: '#22C55E', 600: '#16A34A', 700: '#15803D' },
  amber: { 400: '#FBBF24', 500: '#F59E0B', 600: '#D97706', 700: '#B45309' },
  red: { 400: '#F87171', 500: '#EF4444', 600: '#DC2626', 700: '#B91C1C' },
  blue: { 400: '#60A5FA', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8' },
  white: '#FFFFFF',
  black: '#000000',
} as const;

/**
 * Categorical series colours (charts, one colour per vehicle on dispatch/monitor maps).
 * Ordered for maximum separation on the navy canvas; gold first = brand series.
 */
export const categorical = [
  '#D4AF37', // gold
  '#60A5FA', // blue
  '#34D399', // emerald
  '#F472B6', // pink
  '#A78BFA', // violet
  '#FB923C', // orange
  '#22D3EE', // cyan
  '#A3E635', // lime
] as const;

/** `#RRGGBB` + alpha (0–1) → `rgba(r, g, b, a)` */
export function alpha(hex: string, a: number): string {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
