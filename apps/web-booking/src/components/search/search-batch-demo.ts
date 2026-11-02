import dayjs from 'dayjs';
import type { TripBatch } from '@limousine-workspace/shared-types';

const CAPS = [9, 12] as const;

function derivedDemoPrice(batch: TripBatch, dep: dayjs.Dayjs): number {
  return 1650000 + (dep.hour() % 6) * 50000;
}

function derivedDemoCapacity(batch: TripBatch): number {
  return CAPS[batch.id.charCodeAt(0) % 2];
}

function derivedDemoSeatsLeft(batch: TripBatch): number {
  return 3 + (batch.id.charCodeAt(1) % 5);
}

/**
 * Giá/ghế cho UI tìm kiếm: ưu tiên trường từ API (`TripBatch`) nếu có, không thì
 * công thức demo (ổn định theo `id` + giờ khởi hành).
 */
export function getBatchDemoMeta(batch: TripBatch) {
  const dep = dayjs(batch.departure_time);
  const mockPrice = batch.list_price_vnd ?? derivedDemoPrice(batch, dep);
  const capacity = batch.vehicle_capacity ?? derivedDemoCapacity(batch);
  const seatsLeft = batch.seats_available ?? derivedDemoSeatsLeft(batch);
  return { dep, mockPrice, capacity, seatsLeft };
}

export function formatTripTimeWindow(dep: dayjs.Dayjs): string {
  const end = dep.add(2, 'hour').add(30, 'minute');
  return `${dep.format('HH:mm')} - ${end.format('HH:mm')}`;
}
