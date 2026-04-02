import type {
  Booking,
  Cargo,
  TripBatch,
  TripRun,
  User,
  Vehicle,
} from '@limousine-workspace/shared-types';
import type { BookingEntity } from '../entities/booking.entity';
import type { CargoEntity } from '../entities/cargo.entity';
import type { TripBatchEntity } from '../entities/trip-batch.entity';
import type { TripRunEntity } from '../entities/trip-run.entity';
import type { UserEntity } from '../entities/user.entity';
import type { VehicleEntity } from '../entities/vehicle.entity';

export function vehicleToDomain(e: VehicleEntity): Vehicle {
  return {
    id: e.id,
    license_plate: e.license_plate,
    capacity: e.capacity,
    status: e.status,
  };
}

export function userToDomain(e: UserEntity): User {
  return {
    id: e.id,
    full_name: e.full_name,
    phone: e.phone,
    role: e.role,
    status: e.status,
  };
}

export function tripBatchToDomain(e: TripBatchEntity): TripBatch {
  return {
    id: e.id,
    route_name: e.route_name,
    departure_time: e.departure_time.toISOString(),
    status: e.status,
  };
}

export function tripRunToDomain(e: TripRunEntity): TripRun {
  return {
    id: e.id,
    trip_batch_id: e.trip_batch_id,
    vehicle_id: e.vehicle_id,
    driver_id: e.driver_id,
    status: e.status,
  };
}

export function bookingToDomain(e: BookingEntity): Booking {
  return {
    id: e.id,
    trip_batch_id: e.trip_batch_id,
    trip_run_id: e.trip_run_id,
    passenger_name: e.passenger_name,
    passenger_phone: e.passenger_phone,
    booker_name: e.booker_name,
    booker_phone: e.booker_phone,
    pickup_address: e.pickup_address,
    pickup_location: { lat: e.pickup_lat, lng: e.pickup_lng },
    dropoff_address: e.dropoff_address,
    dropoff_location: { lat: e.dropoff_lat, lng: e.dropoff_lng },
    pickup_order: e.pickup_order,
    dropoff_order: e.dropoff_order,
    status: e.status,
    note: e.note,
    seat_label: e.seat_label,
    unit_price: e.unit_price,
    total_amount: e.total_amount,
    payment_method: e.payment_method,
    payment_status: e.payment_status,
  };
}

export function cargoToDomain(e: CargoEntity): Cargo {
  return {
    id: e.id,
    trip_run_id: e.trip_run_id,
    waybill_code: e.waybill_code,
    sender_info: { name: e.sender_name, phone: e.sender_phone },
    receiver_info: { name: e.receiver_name, phone: e.receiver_phone },
    pickup_location: { lat: e.pickup_lat, lng: e.pickup_lng },
    dropoff_location: { lat: e.dropoff_lat, lng: e.dropoff_lng },
    status: e.status,
  };
}
