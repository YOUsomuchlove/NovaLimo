'use client';

/**
 * Per-tab booking state in sessionStorage: survives refresh, never goes into the URL
 * (no personal data in query strings). Storage can be unavailable (private mode) → no-ops.
 */
function read<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export interface PlaceDraft {
  stop_id?: string;
  address: string;
  lat?: number;
  lng?: number;
}

export interface BookingDraft {
  trip_id: string;
  hold_token?: string;
  hold_expires_at?: string;
  seats: string[];
  /** Display only — the server recomputes every price at checkout. */
  seat_prices?: Record<string, number>;
  contact?: { name: string; phone: string; email?: string };
  passengers?: Record<string, { name: string; phone?: string }>;
  pickup?: PlaceDraft;
  dropoff?: PlaceDraft;
  note?: string;
}

export const draftStore = {
  get: (tripId: string) => read<BookingDraft>(`nl.booking.${tripId}`),
  set: (draft: BookingDraft) => write(`nl.booking.${draft.trip_id}`, draft),
  clear: (tripId: string) => write(`nl.booking.${tripId}`, null),
};

/** Phone that owns a booking code, so success / ticket pages load without asking again. */
export const ticketPhones = {
  get: (code: string) => read<string>(`nl.ticket.${code}`),
  set: (code: string, phone: string) => write(`nl.ticket.${code}`, phone),
};

export interface LookupSession {
  token: string;
  phone: string;
  /** epoch ms */
  exp: number;
}

export const lookupSession = {
  get: () => {
    const v = read<LookupSession>('nl.lookup');
    return v && v.exp > Date.now() ? v : null;
  },
  set: (v: LookupSession | null) => write('nl.lookup', v),
};
