import type { Booking } from '@limousine-workspace/shared-types';

export type NextStop = {
  booking: Booking;
  kind: 'pickup' | 'dropoff';
};

/** Thứ tự đón trước, sau đó thứ tự trả (theo đặc tả). */
export function getNextStop(bookings: Booking[]): NextStop | null {
  const waiting = bookings.filter((b) => b.status === 'WAITING');
  if (waiting.length) {
    const sorted = [...waiting].sort(
      (a, b) => (a.pickup_order ?? 0) - (b.pickup_order ?? 0),
    );
    return { booking: sorted[0], kind: 'pickup' };
  }
  const picked = bookings.filter((b) => b.status === 'PICKED_UP');
  if (picked.length) {
    const sorted = [...picked].sort(
      (a, b) => (a.dropoff_order ?? 0) - (b.dropoff_order ?? 0),
    );
    return { booking: sorted[0], kind: 'dropoff' };
  }
  return null;
}
