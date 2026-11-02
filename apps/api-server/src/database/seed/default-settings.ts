/** Default business settings (Admin › Cấu hình). Keys are stable; values are edited at runtime. */
export const DEFAULT_SETTINGS = {
  'booking.policy': {
    /** Free cancellation until this many hours before departure */
    free_cancel_hours: 24,
    /** Refund percentage when cancelling later than that (until sales close) */
    late_cancel_refund_pct: 50,
    max_seats_per_booking: 6,
    seat_hold_minutes: 10,
    payment_due_minutes: 15,
  },
  'cod.policy': {
    max_cod_vnd: 10_000_000,
    /** Fee charged to the sender, percent of COD amount */
    cod_fee_pct: 1,
    min_cod_fee_vnd: 10_000,
    /** Drivers must settle collected COD within N hours */
    settle_within_hours: 24,
  },
  'cargo.pricing': {
    base_fee_vnd: { S: 50_000, M: 80_000, L: 120_000, XL: 180_000 },
    per_kg_over_vnd: 5_000,
    included_kg: { S: 3, M: 10, L: 20, XL: 40 },
    fragile_surcharge_vnd: 30_000,
    /** Insurance as percent of declared value */
    insurance_pct: 0.5,
  },
  'notifications.templates': {
    booking_confirmed:
      'NovaLimo: Ve {code} da xac nhan. {route} {time} {date}. Ghe {seats}. Tra cuu: {link}',
    booking_reminder:
      'NovaLimo: Xe {plate} se don quy khach luc {time}. Tai xe {driver} {driver_phone}.',
    otp: 'NovaLimo: Ma xac thuc cua ban la {code}. Het han sau 5 phut.',
    cargo_created:
      'NovaLimo: Don hang {waybill} da duoc tiep nhan. Tra cuu: {link}',
  },
  'company.profile': {
    name: 'NovaLimo',
    hotline: '1900 6868',
    email: 'hotro@novalimo.vn',
    address: 'Hà Nội, Việt Nam',
  },
} as const;

export type SettingKey = keyof typeof DEFAULT_SETTINGS;
