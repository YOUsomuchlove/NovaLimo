import type {
  BookingDto,
  PaymentInstructionDto,
} from '@limousine-workspace/shared-types';
import {
  type BookingEntity,
  type PaymentEntity,
  fromPoint,
} from '../../database/entities';

const iso = (d: Date | null) => d?.toISOString() ?? null;

/** Requires relations: trip_batch.route, seats */
export function toBookingDto(b: BookingEntity): BookingDto {
  const batch = b.trip_batch;
  return {
    id: b.id,
    code: b.code,
    status: b.status,
    source: b.source,
    trip: {
      id: batch.id,
      code: batch.code,
      route: {
        id: batch.route.id,
        code: batch.route.code,
        name: batch.route.name,
        origin_name: batch.route.origin_name,
        destination_name: batch.route.destination_name,
        duration_min: batch.route.duration_min,
      },
      departure_at: batch.departure_at.toISOString(),
      arrival_eta: batch.arrival_eta.toISOString(),
    },
    trip_run_id: b.trip_run_id,
    contact_name: b.contact_name,
    contact_phone: b.contact_phone,
    contact_email: b.contact_email,
    pickup: {
      stop_id: b.pickup_stop_id,
      address: b.pickup_address,
      location: fromPoint(b.pickup_point) ?? { lat: 0, lng: 0 },
    },
    dropoff: {
      stop_id: b.dropoff_stop_id,
      address: b.dropoff_address,
      location: fromPoint(b.dropoff_point) ?? { lat: 0, lng: 0 },
    },
    pickup_order: b.pickup_order,
    dropoff_order: b.dropoff_order,
    seats: (b.seats ?? [])
      .filter(
        (s) =>
          s.is_active || b.status === 'CANCELLED' || b.status === 'NO_SHOW',
      )
      .sort((x, y) => x.seat_label.localeCompare(y.seat_label))
      .map((s) => ({
        seat_label: s.seat_label,
        tier: s.tier,
        price_vnd: s.price_vnd,
        passenger_name: s.passenger_name,
        passenger_phone: s.passenger_phone,
      })),
    note: b.note,
    subtotal_vnd: b.subtotal_vnd,
    discount_vnd: b.discount_vnd,
    total_vnd: b.total_vnd,
    payment_method: b.payment_method,
    payment_status: b.payment_status,
    payment_due_at: iso(b.payment_due_at),
    picked_up_at: iso(b.picked_up_at),
    dropped_off_at: iso(b.dropped_off_at),
    cancelled_at: iso(b.cancelled_at),
    cancel_reason: b.cancel_reason,
    created_at: b.created_at.toISOString(),
  };
}

export function toPaymentInstruction(
  p: PaymentEntity,
  bank?: { bin: string; account_no: string; account_name: string },
): PaymentInstructionDto {
  return {
    payment_id: p.id,
    method: p.method,
    amount_vnd: p.amount_vnd,
    reference: p.reference,
    status: p.status,
    expires_at: iso(p.expires_at),
    ...(p.method === 'BANK_TRANSFER' && bank
      ? {
          bank: {
            ...bank,
            // VietQR quick-link image: amount + transfer content pre-filled for every Vietnamese banking app.
            qr_image_url:
              `https://img.vietqr.io/image/${bank.bin}-${bank.account_no}-compact2.png` +
              `?amount=${p.amount_vnd}&addInfo=${encodeURIComponent(p.reference)}&accountName=${encodeURIComponent(bank.account_name)}`,
          },
        }
      : {}),
  };
}
