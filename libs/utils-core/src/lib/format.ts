/**
 * Vietnamese display formatters shared by web and mobile.
 * All date/time output is pinned to Asia/Ho_Chi_Minh so server, browser and phone agree.
 */
export const VN_TIME_ZONE = 'Asia/Ho_Chi_Minh';

const vndFormatter = new Intl.NumberFormat('vi-VN');

/** 350000 → "350.000 ₫" ; compact: 12_500_000 → "12,5 tr ₫" */
export function formatVnd(
  amount: number,
  opts: { compact?: boolean } = {},
): string {
  if (!Number.isFinite(amount)) return '—';
  if (opts.compact && Math.abs(amount) >= 1_000_000) {
    const units: [number, string][] = [
      [1_000_000_000, 'tỷ'],
      [1_000_000, 'tr'],
    ];
    for (const [size, label] of units) {
      if (Math.abs(amount) >= size) {
        const v = Math.round((amount / size) * 10) / 10;
        return `${v.toLocaleString('vi-VN')} ${label} ₫`;
      }
    }
  }
  return `${vndFormatter.format(Math.round(amount))} ₫`;
}

/** Keeps digits only; converts +84 / 84 prefix to 0. */
export function normalizeVnPhone(raw: string): string {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('84') && d.length >= 11) d = `0${d.slice(2)}`;
  return d;
}

/** Vietnamese mobile: 10 digits starting with 03/05/07/08/09. */
export function isValidVnPhone(raw: string): boolean {
  return /^0(3|5|7|8|9)\d{8}$/.test(normalizeVnPhone(raw));
}

/** "0912345678" → "0912 345 678" */
export function formatVnPhone(raw: string): string {
  const d = normalizeVnPhone(raw);
  if (d.length !== 10) return raw;
  return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
}

/** "0912345678" → "0912 *** 678" */
export function maskVnPhone(raw: string): string {
  const d = normalizeVnPhone(raw);
  if (d.length !== 10) return raw;
  return `${d.slice(0, 4)} *** ${d.slice(7)}`;
}

type DateInput = Date | string | number;
const toDate = (v: DateInput) => (v instanceof Date ? v : new Date(v));

const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('vi-VN', { timeZone: VN_TIME_ZONE, ...opts });

const timeFmt = fmt({ hour: '2-digit', minute: '2-digit', hour12: false });
const dateFmt = fmt({ day: '2-digit', month: '2-digit', year: 'numeric' });
const weekdayDateFmt = fmt({
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
});

/** "14:05" */
export function formatTime(v: DateInput): string {
  return timeFmt.format(toDate(v));
}

/** "02/11/2026" */
export function formatDate(v: DateInput): string {
  return dateFmt.format(toDate(v));
}

/** "14:05 · 02/11/2026" */
export function formatDateTime(v: DateInput): string {
  const d = toDate(v);
  return `${formatTime(d)} · ${formatDate(d)}`;
}

/** "T2, 02/11" */
export function formatWeekdayDate(v: DateInput): string {
  return weekdayDateFmt.format(toDate(v));
}

/** Minutes → "2 giờ 30 phút" / "45 phút" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} phút`;
  return m === 0 ? `${h} giờ` : `${h} giờ ${m} phút`;
}
