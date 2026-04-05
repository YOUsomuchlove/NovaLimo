export type UUID = string;

export type GeoPoint = {
  lat: number;
  lng: number;
};

export type VehicleStatus = 'AVAILABLE' | 'MAINTENANCE' | 'IN_USE';

export interface Vehicle {
  id: UUID;
  license_plate: string;
  capacity: number;
  status: VehicleStatus;
}

export type UserRole = 'ADMIN' | 'DRIVER';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: UUID;
  full_name: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
}

export type TripBatchStatus = 'OPEN' | 'CLUSTERED' | 'COMPLETED';

export interface TripBatch {
  id: UUID;
  route_name: string;
  departure_time: string; // ISO datetime
  status: TripBatchStatus;
}

export type TripRunStatus = 'PENDING' | 'IN_PROGRESS' | 'FINISHED';

export interface TripRun {
  id: UUID;
  trip_batch_id: UUID;
  vehicle_id: UUID;
  driver_id: UUID;
  status: TripRunStatus;
}

/** GET /trips/my-runs — thông tin hiển thị thẻ chuyến cho tài xế */
export interface DriverMyRun extends TripRun {
  route_name: string;
  departure_time: string;
  passenger_count: number;
  cargo_count: number;
  license_plate: string;
}

export type DriverMyRunWithBookings = DriverMyRun & { bookings: Booking[] };

export type BookingStatus =
  | 'WAITING'
  | 'PICKED_UP'
  | 'DROPPED_OFF'
  | 'CANCELLED';

export type PaymentMethod = 'COD' | 'MOMO' | 'ZALOPAY' | 'VNPAY';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface Booking {
  id: UUID;
  trip_batch_id: UUID;
  trip_run_id: UUID | null;

  passenger_name: string;
  passenger_phone: string;
  booker_name?: string | null;
  booker_phone?: string | null;

  pickup_address: string;
  pickup_location: GeoPoint;
  dropoff_address: string;
  dropoff_location: GeoPoint;

  pickup_order?: number | null;
  dropoff_order?: number | null;

  status: BookingStatus;
  note?: string | null;

  /** Ghế đã chọn (vd. A1, B2) — unique trong cùng trip_batch khi đã đặt */
  seat_label?: string | null;
  unit_price?: number;
  total_amount?: number;
  payment_method?: PaymentMethod | null;
  payment_status?: PaymentStatus;
}

export type CargoStatus = 'PENDING' | 'PICKED_UP' | 'DELIVERED';

export interface CargoPartyInfo {
  name: string;
  phone: string;
}

export interface Cargo {
  id: UUID;
  trip_run_id: UUID | null;
  waybill_code: string;
  sender_info: CargoPartyInfo;
  receiver_info: CargoPartyInfo;
  pickup_location: GeoPoint;
  dropoff_location: GeoPoint;
  status: CargoStatus;
}

/** Ca làm việc tài xế — app-mobile.pen · Kết thúc ca & Báo cáo; API /driver/shifts */
export type DriverShiftStatus = 'ACTIVE' | 'ENDED';

export interface DriverShift {
  id: UUID;
  driver_id: UUID;
  started_at: string;
  ended_at: string | null;
  status: DriverShiftStatus;
  /** Tọa độ khi bắt đầu ca (tuỳ chính sách) */
  start_location?: GeoPoint | null;
}

/** Tin nhắn chat tài xế ↔ điều hành — Socket.io /realtime */
export interface DriverDispatchChatMessage {
  id: UUID;
  shift_id?: UUID | null;
  driver_id: UUID;
  /** ADMIN user hoặc hệ thống */
  sender_role: 'DRIVER' | 'ADMIN';
  body: string;
  created_at: string;
}
