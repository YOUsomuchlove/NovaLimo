import {
  BOOKING_STATUSES,
  BOOKING_TRANSITIONS,
  CARGO_STATUSES,
  CARGO_TRANSITIONS,
  TRIP_BATCH_STATUSES,
  TRIP_BATCH_TRANSITIONS,
  TRIP_RUN_STATUSES,
  TRIP_RUN_TRANSITIONS,
  canTransition,
} from './enums';

describe('status transition maps', () => {
  it.each([
    ['booking', BOOKING_STATUSES, BOOKING_TRANSITIONS],
    ['trip run', TRIP_RUN_STATUSES, TRIP_RUN_TRANSITIONS],
    ['trip batch', TRIP_BATCH_STATUSES, TRIP_BATCH_TRANSITIONS],
    ['cargo', CARGO_STATUSES, CARGO_TRANSITIONS],
  ] as const)(
    '%s map covers every status and only targets known statuses',
    (_name, statuses, map) => {
      const all = new Set<string>(statuses);
      expect(Object.keys(map).sort()).toEqual([...statuses].sort());
      for (const targets of Object.values(map) as readonly string[][])
        for (const t of targets) expect(all.has(t)).toBe(true);
    },
  );

  it('treats staying in the same status as allowed and terminal states as final', () => {
    expect(canTransition(BOOKING_TRANSITIONS, 'CONFIRMED', 'CONFIRMED')).toBe(
      true,
    );
    expect(canTransition(BOOKING_TRANSITIONS, 'CANCELLED', 'CONFIRMED')).toBe(
      false,
    );
    expect(canTransition(TRIP_RUN_TRANSITIONS, 'FINISHED', 'IN_PROGRESS')).toBe(
      false,
    );
  });
});
