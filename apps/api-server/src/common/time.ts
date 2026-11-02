/**
 * Time helpers pinned to Asia/Ho_Chi_Minh (UTC+7, no DST) — business days and departure
 * times are always Vietnamese local time regardless of the server's TZ.
 */
export const VN_OFFSET_MIN = 7 * 60;

/** "2026-11-02" + "08:30" (VN local) → Date (UTC instant) */
export function vnLocalToDate(date: string, time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const [y, mo, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h, m) - VN_OFFSET_MIN * 60_000);
}

/** Date → "2026-11-02" in VN local time */
export function vnDateString(at: Date = new Date()): string {
  return new Date(at.getTime() + VN_OFFSET_MIN * 60_000)
    .toISOString()
    .slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday, VN local */
export function vnDayOfWeek(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Start/end (exclusive) instants of a VN local day */
export function vnDayRange(date: string): { from: Date; to: Date } {
  const from = vnLocalToDate(date, '00:00');
  return { from, to: new Date(from.getTime() + 86_400_000) };
}

export const addMinutes = (d: Date, min: number) =>
  new Date(d.getTime() + min * 60_000);
