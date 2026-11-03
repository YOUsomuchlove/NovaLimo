/**
 * REST response/request shapes shared by the API and every client.
 * Dates are ISO strings; money is integer VND; coordinates are `{ lat, lng }`.
 */
import type {
  BookingSource,
  BookingStatus,
  CargoPayer,
  CargoSize,
  CargoStatus,
  ChatSenderRole,
  CodSettlementStatus,
  FinanceCategory,
  FinanceKind,
  IncidentKind,
  IncidentStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentTxnStatus,
  SeatTier,
  StopKind,
  TicketKind,
  TicketStatus,
  TripBatchStatus,
  TripRunStatus,
  UserKind,
  UserStatus,
  VehicleStatus,
} from './enums';

export type ID = string;
export type ISODate = string;
export interface LatLng {
  lat: number;
  lng: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ListQuery {
  page?: number;
  limit?: number;
  q?: string;
  sort?: string;
}

/** Error body for every non-2xx response. */
export interface ApiError {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
}

/* ---------------- Auth ---------------- */

export interface AuthTokens {
  access_token: string;
  /** Opaque, single use — rotated on every refresh */
  refresh_token: string;
  /** Seconds until the access token expires */
  expires_in: number;
}

export interface Me {
  id: ID;
  full_name: string;
  phone: string;
  email: string | null;
  kind: UserKind;
  avatar_url: string | null;
  roles: { slug: string; name: string }[];
  permissions: string[];
}

/* ---------------- Catalog ---------------- */

export interface SeatCellDto {
  label: string;
  tier: SeatTier;
}

export interface VehicleTypeDto {
  id: ID;
  code: string;
  name: string;
  capacity: number;
  seat_layout: (SeatCellDto | null)[][];
  description: string | null;
  image_url: string | null;
}

export interface VehicleDto {
  id: ID;
  license_plate: string;
  status: VehicleStatus;
  vehicle_type: Pick<VehicleTypeDto, 'id' | 'code' | 'name' | 'capacity'>;
  brand: string | null;
  model: string | null;
  year: number | null;
  color: string | null;
  odometer_km: number;
  registration_expires_on: string | null;
  insurance_expires_on: string | null;
  next_maintenance_on: string | null;
  image_url: string | null;
  note: string | null;
  created_at: ISODate;
}

export interface StopDto {
  id: ID;
  route_id: ID;
  name: string;
  address: string;
  location: LatLng;
  kind: StopKind;
  sort_order: number;
  is_active: boolean;
}

export interface RouteDto {
  id: ID;
  code: string;
  name: string;
  origin_name: string;
  destination_name: string;
  distance_km: number | null;
  duration_min: number;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  stops?: StopDto[];
  /** Cheapest current base fare (public listing) */
  from_price_vnd?: number | null;
  /** VIP seat surcharge of that fare */
  vip_surcharge_vnd?: number | null;
}

export interface TimeSlotDto {
  id: ID;
  route_id: ID;
  departure_time: string;
  days_of_week: number[];
  vehicle_type_id: ID;
  planned_vehicles: number;
  valid_from: string | null;
  valid_to: string | null;
  is_active: boolean;
}

export interface PriceRuleDto {
  id: ID;
  route_id: ID;
  vehicle_type_id: ID | null;
  name: string;
  base_price_vnd: number;
  vip_surcharge_vnd: number;
  valid_from: string | null;
  valid_to: string | null;
  priority: number;
  is_active: boolean;
}

/* ---------------- Trips ---------------- */

export interface TripBatchDto {
  id: ID;
  code: string;
  route: Pick<
    RouteDto,
    'id' | 'code' | 'name' | 'origin_name' | 'destination_name' | 'duration_min'
  >;
  departure_at: ISODate;
  arrival_eta: ISODate;
  vehicle_type: Pick<VehicleTypeDto, 'id' | 'code' | 'name' | 'capacity'>;
  planned_vehicles: number;
  status: TripBatchStatus;
  seats_total: number;
  seats_sold: number;
  seats_available: number;
  /** Base fare for a standard seat */
  price_vnd: number;
  vip_surcharge_vnd: number;
  /** Online sales open (status OPEN and before sales close) */
  bookable: boolean;
  note?: string | null;
}

export interface SeatAvailabilityDto {
  label: string;
  tier: SeatTier;
  price_vnd: number;
  /** How many of this label can still be sold (0 = sold out) */
  remaining: number;
  /** Units currently on hold by other customers */
  held: number;
}

export interface TripSeatMapDto {
  trip_batch_id: ID;
  layout: (SeatCellDto | null)[][];
  seats: SeatAvailabilityDto[];
}

export interface TripRunDto {
  id: ID;
  code: string;
  trip_batch_id: ID;
  status: TripRunStatus;
  vehicle: Pick<VehicleDto, 'id' | 'license_plate'> & { capacity: number };
  driver: {
    id: ID;
    full_name: string;
    phone: string;
    avatar_url: string | null;
  };
  passenger_count: number;
  cargo_count: number;
  dispatched_at: ISODate | null;
  started_at: ISODate | null;
  finished_at: ISODate | null;
  planned_distance_km: number | null;
}

/* ---------------- Bookings ---------------- */

export interface BookingSeatDto {
  seat_label: string;
  tier: SeatTier;
  price_vnd: number;
  passenger_name: string;
  passenger_phone: string | null;
}

export interface BookingDto {
  id: ID;
  code: string;
  status: BookingStatus;
  source: BookingSource;
  trip: Pick<
    TripBatchDto,
    'id' | 'code' | 'route' | 'departure_at' | 'arrival_eta'
  >;
  trip_run_id: ID | null;
  contact_name: string;
  contact_phone: string;
  contact_email: string | null;
  pickup: { stop_id: ID | null; address: string; location: LatLng };
  dropoff: { stop_id: ID | null; address: string; location: LatLng };
  pickup_order: number | null;
  dropoff_order: number | null;
  seats: BookingSeatDto[];
  note: string | null;
  subtotal_vnd: number;
  discount_vnd: number;
  total_vnd: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_due_at: ISODate | null;
  picked_up_at: ISODate | null;
  dropped_off_at: ISODate | null;
  cancelled_at: ISODate | null;
  cancel_reason: string | null;
  created_at: ISODate;
}

export interface CreateSeatHoldRequest {
  trip_batch_id: ID;
  seat_labels: string[];
  /** Pass the previous token to extend/replace an existing hold */
  hold_token?: string;
}

export interface SeatHoldDto {
  hold_token: string;
  trip_batch_id: ID;
  seat_labels: string[];
  expires_at: ISODate;
}

export interface PlaceInput {
  stop_id?: ID;
  address: string;
  lat: number;
  lng: number;
}

export interface CreateBookingRequest {
  trip_batch_id: ID;
  hold_token: string;
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  pickup: PlaceInput;
  dropoff: PlaceInput;
  passengers: { seat_label: string; name: string; phone?: string }[];
  payment_method: PaymentMethod;
  note?: string;
}

export interface PaymentInstructionDto {
  payment_id: ID;
  method: PaymentMethod;
  amount_vnd: number;
  reference: string;
  status: PaymentTxnStatus;
  expires_at: ISODate | null;
  /** Bank transfer only */
  bank?: {
    bin: string;
    account_no: string;
    account_name: string;
    qr_image_url: string;
  };
}

export interface CreateBookingResponse {
  booking: BookingDto;
  payment: PaymentInstructionDto | null;
}

/* ---------------- Cargo ---------------- */

export interface CargoQuoteRequest {
  route_id: ID;
  size: CargoSize;
  weight_kg: number;
  is_fragile?: boolean;
  declared_value_vnd?: number;
  cod_amount_vnd?: number;
}

export interface CargoQuoteDto {
  fee_vnd: number;
  breakdown: { label: string; amount_vnd: number }[];
}

export interface CargoDto {
  id: ID;
  waybill_code: string;
  status: CargoStatus;
  route: Pick<RouteDto, 'id' | 'code' | 'name'>;
  trip_batch_id: ID | null;
  trip_run_id: ID | null;
  sender: { name: string; phone: string; address: string; location: LatLng };
  receiver: { name: string; phone: string; address: string; location: LatLng };
  description: string;
  size: CargoSize;
  weight_kg: number;
  is_fragile: boolean;
  declared_value_vnd: number;
  fee_vnd: number;
  fee_payer: CargoPayer;
  cod_amount_vnd: number;
  cod_collected_at: ISODate | null;
  cod_settlement_id: ID | null;
  picked_up_at: ISODate | null;
  delivered_at: ISODate | null;
  proof_photo_url: string | null;
  note: string | null;
  created_at: ISODate;
}

export interface CodSettlementDto {
  id: ID;
  driver: { id: ID; full_name: string };
  amount_vnd: number;
  cargo_count: number;
  status: CodSettlementStatus;
  confirmed_at: ISODate | null;
  note: string | null;
  created_at: ISODate;
}

/* ---------------- People ---------------- */

export interface StaffUserDto {
  id: ID;
  full_name: string;
  phone: string;
  email: string | null;
  kind: UserKind;
  status: UserStatus;
  avatar_url: string | null;
  last_login_at: ISODate | null;
  roles: { id: ID; slug: string; name: string }[];
  created_at: ISODate;
}

export interface DriverDto extends Omit<StaffUserDto, 'roles'> {
  profile: {
    license_number: string | null;
    license_class: string | null;
    license_expires_on: string | null;
    date_of_birth: string | null;
    address: string | null;
    emergency_contact: string | null;
    default_vehicle: Pick<VehicleDto, 'id' | 'license_plate'> | null;
    hired_on: string | null;
    note: string | null;
  };
  /** Live state for dispatch/monitor screens */
  on_shift: boolean;
}

export interface RoleDto {
  id: ID;
  slug: string;
  name: string;
  description: string | null;
  is_system: boolean;
  permissions: string[];
  user_count: number;
}

export interface CustomerDto {
  id: ID;
  full_name: string;
  phone: string;
  email: string | null;
  note: string | null;
  tags: string[];
  booking_count: number;
  total_spent_vnd: number;
  last_trip_at: ISODate | null;
  created_at: ISODate;
}

export interface AuditLogDto {
  id: ID;
  actor: { id: ID; full_name: string } | null;
  action: string;
  resource: string;
  resource_id: string | null;
  payload: Record<string, unknown> | null;
  status_code: number;
  ip: string | null;
  created_at: ISODate;
}

/* ---------------- Driver app ---------------- */

export interface DriverStopDto {
  /** booking or cargo id */
  ref_id: ID;
  ref_type: 'BOOKING' | 'CARGO';
  kind: 'PICKUP' | 'DROPOFF';
  order: number | null;
  name: string;
  phone: string;
  address: string;
  location: LatLng;
  seats: string[];
  status: BookingStatus | CargoStatus;
  note: string | null;
  cod_amount_vnd?: number;
}

export interface DriverRunDetailDto extends TripRunDto {
  trip: Pick<
    TripBatchDto,
    'id' | 'code' | 'route' | 'departure_at' | 'arrival_eta'
  >;
  stops: DriverStopDto[];
}

export interface ShiftDto {
  id: ID;
  started_at: ISODate;
  ended_at: ISODate | null;
}

export interface ShiftSummaryDto {
  shift: ShiftDto | null;
  runs_finished: number;
  passengers_dropped: number;
  cargos_delivered: number;
  cod_collected_vnd: number;
  distance_km: number;
}

export interface ChatMessageDto {
  id: ID;
  driver_id: ID;
  sender_role: ChatSenderRole;
  sender_name: string;
  body: string;
  read_at: ISODate | null;
  created_at: ISODate;
}

export interface NotificationDto {
  id: ID;
  kind: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read_at: ISODate | null;
  created_at: ISODate;
}

export interface IncidentDto {
  id: ID;
  driver: { id: ID; full_name: string; phone: string };
  trip_run_id: ID | null;
  kind: IncidentKind;
  description: string;
  location: LatLng | null;
  photo_url: string | null;
  status: IncidentStatus;
  resolved_at: ISODate | null;
  resolution_note: string | null;
  created_at: ISODate;
}

export interface DriverIncomeDto {
  month: string;
  runs: number;
  passengers: number;
  cargos: number;
  /** Placeholder for salary rules (configured later) */
  estimated_income_vnd: number;
  days: { date: string; runs: number; passengers: number }[];
}

/* ---------------- Back office ---------------- */

export interface FinanceTransactionDto {
  id: ID;
  kind: FinanceKind;
  category: FinanceCategory;
  amount_vnd: number;
  occurred_at: ISODate;
  reference_type: string | null;
  reference_id: ID | null;
  memo: string | null;
  created_by: { id: ID; full_name: string } | null;
  created_at: ISODate;
}

export interface SupportTicketDto {
  id: ID;
  code: string;
  kind: TicketKind;
  status: TicketStatus;
  name: string;
  phone: string;
  email: string | null;
  subject: string;
  message: string;
  booking_id: ID | null;
  assignee: { id: ID; full_name: string } | null;
  internal_note: string | null;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface DashboardStatsDto {
  date: string;
  revenue_today_vnd: number;
  revenue_delta_pct: number | null;
  tickets_today: number;
  tickets_delta_pct: number | null;
  trips_today: number;
  runs_in_progress: number;
  vehicles: { total: number; in_use: number; maintenance: number };
  occupancy_pct: number;
  cancellations_today: number;
  open_incidents: number;
  pending_cod_vnd: number;
  revenue_last_7_days: { date: string; revenue_vnd: number; tickets: number }[];
  upcoming: TripBatchDto[];
}

export interface ReportSeriesPoint {
  date: string;
  [metric: string]: number | string;
}

/* ---------------- Realtime (Socket.io namespace /realtime) ---------------- */

export interface DriverLocationEvent {
  driver_id: ID;
  trip_run_id: ID | null;
  lat: number;
  lng: number;
  speed_kmh: number | null;
  heading: number | null;
  recorded_at: ISODate;
}

export interface SeatsChangedEvent {
  trip_batch_id: ID;
  seats: SeatAvailabilityDto[];
}
