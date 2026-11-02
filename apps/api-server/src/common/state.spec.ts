import {
  BOOKING_TRANSITIONS,
  CARGO_TRANSITIONS,
  TRIP_RUN_TRANSITIONS,
} from '@limousine-workspace/shared-types';
import { assertTransition } from './state';

describe('status transitions', () => {
  it('allows the happy paths', () => {
    expect(() =>
      assertTransition(
        BOOKING_TRANSITIONS,
        'PENDING_PAYMENT',
        'CONFIRMED',
        'vé',
      ),
    ).not.toThrow();
    expect(() =>
      assertTransition(BOOKING_TRANSITIONS, 'CONFIRMED', 'PICKED_UP', 'vé'),
    ).not.toThrow();
    expect(() =>
      assertTransition(
        TRIP_RUN_TRANSITIONS,
        'DISPATCHED',
        'IN_PROGRESS',
        'chuyến',
      ),
    ).not.toThrow();
    expect(() =>
      assertTransition(CARGO_TRANSITIONS, 'PICKED_UP', 'DELIVERED', 'hàng'),
    ).not.toThrow();
  });

  it('rejects impossible jumps with 409', () => {
    expect(() =>
      assertTransition(BOOKING_TRANSITIONS, 'CANCELLED', 'CONFIRMED', 'vé'),
    ).toThrow(/CANCELLED sang CONFIRMED/);
    expect(() =>
      assertTransition(BOOKING_TRANSITIONS, 'CONFIRMED', 'DROPPED_OFF', 'vé'),
    ).toThrow();
    expect(() =>
      assertTransition(
        TRIP_RUN_TRANSITIONS,
        'FINISHED',
        'IN_PROGRESS',
        'chuyến',
      ),
    ).toThrow();
  });
});
