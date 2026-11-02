import type { Booking, Cargo, DriverMyRunWithBookings, TripBatch } from '@limousine-workspace/shared-types';
import { BookingEntity } from '../entities/booking.entity';
import { CargoEntity } from '../entities/cargo.entity';
import { DriverShiftEntity } from '../entities/driver-shift.entity';
import { TripBatchEntity } from '../entities/trip-batch.entity';
import { TripRunEntity } from '../entities/trip-run.entity';
import { VehicleEntity } from '../entities/vehicle.entity';

/**
 * @param bookedSeatLabels — số ghế đã bán (đếm nhãn ghế duy nhất). Nếu bỏ qua, không gửi `seats_available`.
 */
export function tripBatchToDto(
  b: TripBatchEntity,
  bookedSeatLabels?: number,
): TripBatch {
  const cap = b.vehicle_capacity ?? 9;
  const dto: TripBatch = {
    id: b.id,
    route_name: b.route_name,
    departure_time: b.departure_time.toISOString(),
    status: b.status,
    list_price_vnd: b.list_price_vnd,
    vehicle_capacity: cap,
  };
  if (bookedSeatLabels !== undefined) {
    dto.seats_available = Math.max(0, cap - bookedSeatLabels);
  }
  return dto;
}

export function bookingToDto(b: BookingEntity): Booking {
  return {
    id: b.id,
    trip_batch_id: b.trip_batch_id,
    trip_run_id: b.trip_run_id,
    passenger_name: b.passenger_name,
    passenger_phone: b.passenger_phone,
    booker_name: b.booker_name,
    booker_phone: b.booker_phone,
    pickup_address: b.pickup_address,
    pickup_location: { lat: b.pickup_lat, lng: b.pickup_lng },
    dropoff_address: b.dropoff_address,
    dropoff_location: { lat: b.dropoff_lat, lng: b.dropoff_lng },
    pickup_order: b.pickup_order,
    dropoff_order: b.dropoff_order,
    status: b.status,
    note: b.note,
    seat_label: b.seat_label,
    unit_price: b.unit_price ?? undefined,
    total_amount: b.total_amount ?? undefined,
    payment_method: b.payment_method ?? undefined,
    payment_status: b.payment_status,
  };
}

export function cargoToDto(c: CargoEntity): Cargo {
  return {
    id: c.id,
    trip_run_id: c.trip_run_id,
    waybill_code: c.waybill_code,
    sender_info: c.sender_info,
    receiver_info: c.receiver_info,
    pickup_location: { lat: c.pickup_lat, lng: c.pickup_lng },
    dropoff_location: { lat: c.dropoff_lat, lng: c.dropoff_lng },
    status: c.status,
  };
}

export function driverShiftToDto(s: DriverShiftEntity): {
  id: string;
  driver_id: string;
  started_at: string;
  ended_at: string | null;
  status: 'ACTIVE' | 'ENDED';
  start_location?: { lat: number; lng: number } | null;
} {
  const active = s.ended_at === null;
  return {
    id: s.id,
    driver_id: s.driver_id,
    started_at: s.started_at.toISOString(),
    ended_at: s.ended_at ? s.ended_at.toISOString() : null,
    status: active ? 'ACTIVE' : 'ENDED',
    start_location:
      s.start_lat != null && s.start_lng != null
        ? { lat: s.start_lat, lng: s.start_lng }
        : null,
  };
}

export function driverMyRunToDto(
  run: TripRunEntity & {
    trip_batch: TripBatchEntity;
    vehicle: VehicleEntity;
    passenger_count: number;
    cargo_count: number;
    bookings: BookingEntity[];
  },
): DriverMyRunWithBookings {
  return {
    id: run.id,
    trip_batch_id: run.trip_batch_id,
    vehicle_id: run.vehicle_id,
    driver_id: run.driver_id,
    status: run.status,
    route_name: run.trip_batch.route_name,
    departure_time: run.trip_batch.departure_time.toISOString(),
    passenger_count: run.passenger_count,
    cargo_count: run.cargo_count,
    license_plate: run.vehicle.license_plate,
    bookings: run.bookings.map(bookingToDto),
  };
}
