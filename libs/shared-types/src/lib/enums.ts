/**
 * Domain enums — the single definition used by the API entities (`enum:` columns),
 * request validation (`@IsIn`) and every client. Change here = compile errors everywhere.
 */
const tuple = <const T extends readonly string[]>(...v: T) => v;

export const USER_KINDS = tuple('STAFF', 'DRIVER');
export type UserKind = (typeof USER_KINDS)[number];

export const USER_STATUSES = tuple('ACTIVE', 'INACTIVE', 'LOCKED');
export type UserStatus = (typeof USER_STATUSES)[number];

export const VEHICLE_STATUSES = tuple(
  'AVAILABLE',
  'IN_USE',
  'MAINTENANCE',
  'INACTIVE',
);
export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];

export const STOP_KINDS = tuple('PICKUP', 'DROPOFF', 'BOTH');
export type StopKind = (typeof STOP_KINDS)[number];

export const SEAT_TIERS = tuple('STANDARD', 'VIP');
export type SeatTier = (typeof SEAT_TIERS)[number];

export const TRIP_BATCH_STATUSES = tuple(
  'OPEN',
  'CLOSED',
  'CLUSTERED',
  'DISPATCHED',
  'COMPLETED',
  'CANCELLED',
);
export type TripBatchStatus = (typeof TRIP_BATCH_STATUSES)[number];

export const TRIP_RUN_STATUSES = tuple(
  'PENDING',
  'DISPATCHED',
  'IN_PROGRESS',
  'FINISHED',
  'CANCELLED',
);
export type TripRunStatus = (typeof TRIP_RUN_STATUSES)[number];

export const BOOKING_STATUSES = tuple(
  'PENDING_PAYMENT',
  'CONFIRMED',
  'PICKED_UP',
  'DROPPED_OFF',
  'NO_SHOW',
  'CANCELLED',
);
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_SOURCES = tuple('WEB', 'ADMIN', 'CALL_CENTER');
export type BookingSource = (typeof BOOKING_SOURCES)[number];

export const PAYMENT_METHODS = tuple(
  'CASH',
  'BANK_TRANSFER',
  'VNPAY',
  'MOMO',
  'ZALOPAY',
);
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = tuple(
  'UNPAID',
  'PENDING',
  'PAID',
  'REFUNDED',
  'FAILED',
);
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_TXN_STATUSES = tuple(
  'PENDING',
  'SUCCEEDED',
  'FAILED',
  'EXPIRED',
);
export type PaymentTxnStatus = (typeof PAYMENT_TXN_STATUSES)[number];

export const CARGO_STATUSES = tuple(
  'CREATED',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
  'RETURNED',
  'CANCELLED',
);
export type CargoStatus = (typeof CARGO_STATUSES)[number];

export const CARGO_SIZES = tuple('S', 'M', 'L', 'XL');
export type CargoSize = (typeof CARGO_SIZES)[number];

export const CARGO_PAYERS = tuple('SENDER', 'RECEIVER');
export type CargoPayer = (typeof CARGO_PAYERS)[number];

export const COD_SETTLEMENT_STATUSES = tuple(
  'PENDING',
  'CONFIRMED',
  'REJECTED',
);
export type CodSettlementStatus = (typeof COD_SETTLEMENT_STATUSES)[number];

export const FINANCE_KINDS = tuple('INCOME', 'EXPENSE');
export type FinanceKind = (typeof FINANCE_KINDS)[number];

export const FINANCE_CATEGORIES = tuple(
  'TICKET',
  'CARGO',
  'COD',
  'FUEL',
  'TOLL',
  'SALARY',
  'MAINTENANCE',
  'REFUND',
  'OTHER',
);
export type FinanceCategory = (typeof FINANCE_CATEGORIES)[number];

export const INCIDENT_KINDS = tuple(
  'ACCIDENT',
  'BREAKDOWN',
  'MEDICAL',
  'SECURITY',
  'PASSENGER',
  'OTHER',
);
export type IncidentKind = (typeof INCIDENT_KINDS)[number];

export const INCIDENT_STATUSES = tuple('OPEN', 'ACKNOWLEDGED', 'RESOLVED');
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export const CHAT_SENDER_ROLES = tuple('DRIVER', 'OPS');
export type ChatSenderRole = (typeof CHAT_SENDER_ROLES)[number];

export const TICKET_KINDS = tuple(
  'CONTACT',
  'CHANGE_REQUEST',
  'CANCEL_REQUEST',
  'COMPLAINT',
);
export type TicketKind = (typeof TICKET_KINDS)[number];

export const TICKET_STATUSES = tuple(
  'NEW',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
);
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const OTP_PURPOSES = tuple('BOOKING_LOOKUP');
export type OtpPurpose = (typeof OTP_PURPOSES)[number];

export const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6] as const; // 0 = Chủ nhật

/** Allowed status transitions — enforced by the API, used by UIs to show valid actions. */
export const BOOKING_TRANSITIONS: Record<
  BookingStatus,
  readonly BookingStatus[]
> = {
  PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PICKED_UP', 'NO_SHOW', 'CANCELLED'],
  PICKED_UP: ['DROPPED_OFF'],
  DROPPED_OFF: [],
  NO_SHOW: [],
  CANCELLED: [],
};

export const TRIP_RUN_TRANSITIONS: Record<
  TripRunStatus,
  readonly TripRunStatus[]
> = {
  PENDING: ['DISPATCHED', 'CANCELLED'],
  DISPATCHED: ['IN_PROGRESS', 'PENDING', 'CANCELLED'],
  IN_PROGRESS: ['FINISHED'],
  FINISHED: [],
  CANCELLED: [],
};

export const CARGO_TRANSITIONS: Record<CargoStatus, readonly CargoStatus[]> = {
  CREATED: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['IN_TRANSIT', 'DELIVERED', 'RETURNED'],
  IN_TRANSIT: ['DELIVERED', 'RETURNED'],
  DELIVERED: [],
  RETURNED: [],
  CANCELLED: [],
};

export const TRIP_BATCH_TRANSITIONS: Record<
  TripBatchStatus,
  readonly TripBatchStatus[]
> = {
  OPEN: ['CLOSED', 'CLUSTERED', 'CANCELLED'],
  CLOSED: ['OPEN', 'CLUSTERED', 'CANCELLED'],
  CLUSTERED: ['OPEN', 'DISPATCHED', 'CANCELLED'],
  DISPATCHED: ['COMPLETED', 'CLUSTERED'],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransition<S extends string>(
  map: Record<S, readonly S[]>,
  from: S,
  to: S,
): boolean {
  return from === to || map[from].includes(to);
}

/** Permission slugs checked by the API `@Permissions()` guard and used by the admin menu. */
export const PERMISSIONS = tuple(
  'dashboard.view',
  'booking.read',
  'booking.write',
  'dispatch.manage',
  'trip.read',
  'trip.write',
  'cargo.read',
  'cargo.write',
  'cod.reconcile',
  'fleet.read',
  'fleet.write',
  'driver.read',
  'driver.write',
  'customer.read',
  'customer.write',
  'finance.read',
  'finance.write',
  'report.view',
  'settings.manage',
  'support.manage',
  'rbac.manage',
  'audit.read',
);
export type Permission = (typeof PERMISSIONS)[number];
