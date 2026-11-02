import {
  formatDate,
  formatDateTime,
  formatDuration,
  formatTime,
  formatVnPhone,
  formatVnd,
  isValidVnPhone,
  maskVnPhone,
  normalizeVnPhone,
} from './format';

// Intl in vi-VN uses NBSP / narrow spaces in some runtimes; normalise for stable assertions.
const s = (v: string) => v.replace(/[\u00a0\u202f]/g, ' ');

describe('format', () => {
  it('formats VND', () => {
    expect(s(formatVnd(350000))).toBe('350.000 ₫');
    expect(s(formatVnd(12_500_000, { compact: true }))).toBe('12,5 tr ₫');
    expect(s(formatVnd(2_000_000_000, { compact: true }))).toBe('2 tỷ ₫');
    expect(formatVnd(Number.NaN)).toBe('—');
  });

  it('handles Vietnamese phone numbers', () => {
    expect(normalizeVnPhone('+84 912 345 678')).toBe('0912345678');
    expect(isValidVnPhone('0912345678')).toBe(true);
    expect(isValidVnPhone('0212345678')).toBe(false);
    expect(formatVnPhone('0912345678')).toBe('0912 345 678');
    expect(maskVnPhone('0912345678')).toBe('0912 *** 678');
  });

  it('formats dates in Asia/Ho_Chi_Minh regardless of host TZ', () => {
    const iso = '2026-11-02T07:05:00Z'; // 14:05 in Hà Nội
    expect(formatTime(iso)).toBe('14:05');
    expect(formatDate(iso)).toBe('02/11/2026');
    expect(formatDateTime(iso)).toBe('14:05 · 02/11/2026');
  });

  it('formats durations', () => {
    expect(formatDuration(45)).toBe('45 phút');
    expect(formatDuration(150)).toBe('2 giờ 30 phút');
    expect(formatDuration(120)).toBe('2 giờ');
  });
});
