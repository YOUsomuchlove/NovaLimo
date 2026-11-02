/** Che SĐT dạng 0912 *** **78 (demo UI). */
export function maskPhoneDisplay(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.length < 8) return raw.trim() || '—';
  return `${d.slice(0, 4)} *** **${d.slice(-2)}`;
}
