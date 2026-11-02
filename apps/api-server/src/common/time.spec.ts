import {
  addDays,
  vnDateString,
  vnDayOfWeek,
  vnDayRange,
  vnLocalToDate,
} from './time';

describe('VN time helpers', () => {
  it('converts VN local date+time to the right UTC instant', () => {
    expect(vnLocalToDate('2026-11-03', '08:30').toISOString()).toBe(
      '2026-11-03T01:30:00.000Z',
    );
    expect(vnLocalToDate('2026-11-03', '05:00').toISOString()).toBe(
      '2026-11-02T22:00:00.000Z',
    );
  });

  it('formats the VN calendar date of an instant', () => {
    expect(vnDateString(new Date('2026-11-02T17:30:00Z'))).toBe('2026-11-03'); // 00:30 VN next day
    expect(vnDateString(new Date('2026-11-02T16:59:00Z'))).toBe('2026-11-02');
  });

  it('computes day ranges and weekdays', () => {
    const { from, to } = vnDayRange('2026-11-03');
    expect(from.toISOString()).toBe('2026-11-02T17:00:00.000Z');
    expect(to.getTime() - from.getTime()).toBe(86_400_000);
    expect(vnDayOfWeek('2026-11-01')).toBe(0); // Sunday
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });
});
