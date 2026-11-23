import type {
  ApiError as ApiErrorBody,
  BookingDto,
  CargoDto,
  CargoQuoteDto,
  CargoQuoteRequest,
  CreateBookingRequest,
  CreateBookingResponse,
  CreateSeatHoldRequest,
  PaymentInstructionDto,
  RouteDto,
  SeatHoldDto,
  TripBatchDto,
  TripSeatMapDto,
} from '@limousine-workspace/shared-types';

/** REST base, ends with /api. Server components may use an internal URL (Docker network). */
export function getApiUrl(): string {
  const internal =
    typeof window === 'undefined' ? process.env['API_INTERNAL_URL'] : undefined;
  return (
    internal ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3000/api'
  ).replace(/\/$/, '');
}

export const API_URL = getApiUrl();

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

type FetchOpts = Omit<RequestInit, 'body' | 'headers'> & {
  body?: unknown;
  /** Seconds of ISR caching for server components; omit for no-store */
  revalidate?: number;
  headers?: Record<string, string>;
};

export async function api<T>(
  path: string,
  { body, revalidate, headers, ...init }: FetchOpts = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${getApiUrl()}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...(revalidate !== undefined
        ? { next: { revalidate } }
        : { cache: 'no-store' }),
    });
  } catch {
    throw new ApiError(
      0,
      'NETWORK',
      'Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại.',
    );
  }
  if (res.status === 204) return undefined as T;
  const data = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    const e = (data ?? {}) as Partial<ApiErrorBody>;
    throw new ApiError(
      res.status,
      e.code ?? 'ERROR',
      e.message ?? 'Đã có lỗi xảy ra, vui lòng thử lại',
      e.details,
    );
  }
  return data as T;
}

const qs = (params: Record<string, string | number | undefined>) =>
  new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => [k, String(v)]),
  ).toString();

export interface PublicSettings {
  company: { name: string; hotline: string; email: string; address: string };
  booking: {
    free_cancel_hours: number;
    late_cancel_refund_pct: number;
    max_seats_per_booking: number;
    seat_hold_minutes: number;
    payment_due_minutes: number;
  };
}

export interface GeocodeHit {
  lat: number;
  lng: number;
  display_name: string;
}

export interface CreateCargoRequest extends CargoQuoteRequest {
  description: string;
  fee_payer?: 'SENDER' | 'RECEIVER';
  note?: string;
  sender: {
    name: string;
    phone: string;
    address: string;
    lat: number;
    lng: number;
  };
  receiver: {
    name: string;
    phone: string;
    address: string;
    lat: number;
    lng: number;
  };
}

/** Typed endpoints of the public API (docs/api-surface.md). */
export const publicApi = {
  settings: () => api<PublicSettings>('/public/settings'),
  routes: () => api<RouteDto[]>('/public/routes'),
  trips: (p: { route_id: string; date: string; seats?: number }) =>
    api<TripBatchDto[]>(`/public/trips?${qs(p)}`),
  trip: (id: string) => api<TripBatchDto>(`/public/trips/${id}`),
  seats: (id: string) => api<TripSeatMapDto>(`/public/trips/${id}/seats`),
  hold: (body: CreateSeatHoldRequest) =>
    api<SeatHoldDto>('/public/seat-holds', { method: 'POST', body }),
  releaseHold: (token: string) =>
    api<void>(`/public/seat-holds/${encodeURIComponent(token)}`, {
      method: 'DELETE',
    }),
  createBooking: (body: CreateBookingRequest) =>
    api<CreateBookingResponse>('/public/bookings', { method: 'POST', body }),
  lookup: (code: string, phone: string) =>
    api<{ booking: BookingDto; payment: PaymentInstructionDto | null }>(
      `/public/bookings/lookup?${qs({ code, phone })}`,
    ),
  cancel: (code: string, phone: string, reason?: string) =>
    api<{ status: 'CANCELLED' | 'REFUND_REQUESTED'; booking: BookingDto }>(
      `/public/bookings/${encodeURIComponent(code)}/cancel`,
      {
        method: 'POST',
        body: { phone, reason },
      },
    ),
  requestOtp: (phone: string) =>
    api<{ expires_in: number; resend_in: number }>('/public/otp/request', {
      method: 'POST',
      body: { phone },
    }),
  verifyOtp: (phone: string, code: string) =>
    api<{ lookup_token: string; expires_in: number }>('/public/otp/verify', {
      method: 'POST',
      body: { phone, code },
    }),
  myBookings: (token: string) =>
    api<BookingDto[]>('/public/my-bookings', {
      headers: { 'x-lookup-token': token },
    }),
  cargoQuote: (body: CargoQuoteRequest) =>
    api<CargoQuoteDto>('/public/cargo/quote', { method: 'POST', body }),
  cargoCreate: (body: CreateCargoRequest) =>
    api<CargoDto>('/public/cargo/orders', { method: 'POST', body }),
  cargoTrack: (code: string, phone: string) =>
    api<CargoDto>(`/public/cargo/track?${qs({ code, phone })}`),
  contact: (body: {
    name: string;
    phone: string;
    email?: string;
    subject: string;
    message: string;
  }) => api<{ code: string }>('/public/contact', { method: 'POST', body }),
  geocode: (q: string) => api<GeocodeHit[]>(`/public/geocode?${qs({ q })}`),
};

/** Server components: a failing side widget must not take the whole page down. */
export async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

export const DEFAULT_SETTINGS: PublicSettings = {
  company: {
    name: 'NovaLimo',
    hotline: '1900 6868',
    email: 'hotro@novalimo.vn',
    address: 'Hà Nội, Việt Nam',
  },
  booking: {
    free_cancel_hours: 24,
    late_cancel_refund_pct: 50,
    max_seats_per_booking: 6,
    seat_hold_minutes: 10,
    payment_due_minutes: 15,
  },
};

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'
).replace(/\/$/, '');
