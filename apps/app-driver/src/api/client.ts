import type {
  AuthTokens,
  BookingDto,
  CargoDto,
  ChatMessageDto,
  DriverIncomeDto,
  DriverRunDetailDto,
  IncidentDto,
  IncidentKind,
  NotificationDto,
  ShiftDto,
  ShiftSummaryDto,
  TripRunDto,
} from '@limousine-workspace/shared-types';

const DEFAULT_API = 'http://localhost:3000/api';

export interface DriverProfileMe {
  id: string;
  full_name: string;
  phone: string;
  avatar_url: string | null;
  license_number: string | null;
  license_expires_on: string | null;
  vehicle: {
    id: string;
    license_plate: string;
    type: string | null;
  } | null;
  shift: ShiftDto | null;
}

export type DriverRunScope = 'upcoming' | 'active' | 'done';

export function getApiBaseUrl(): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (globalThis as any).process?.env?.EXPO_PUBLIC_API_URL as
    | string
    | undefined;
  return (env || DEFAULT_API).replace(/\/$/, '');
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    try {
      const parsed = JSON.parse(text) as { message?: string | string[] };
      const msg = Array.isArray(parsed.message)
        ? parsed.message.join(', ')
        : parsed.message;
      throw new Error(msg || `HTTP ${res.status}`);
    } catch (e) {
      if (e instanceof Error && !e.message.startsWith('Unexpected token')) {
        throw e;
      }
      throw new Error(text || `HTTP ${res.status}`);
    }
  }
  if (!text || text === 'null') return null as unknown as T;
  return JSON.parse(text) as T;
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/* ---------------- Auth ---------------- */

export async function loginDriver(
  phone: string,
  password: string,
): Promise<AuthTokens> {
  const res = await fetch(`${getApiBaseUrl()}/auth/driver/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  return parseJson(res);
}

export async function refreshTokens(
  refresh_token: string,
): Promise<AuthTokens> {
  const res = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token }),
  });
  return parseJson(res);
}

export async function logoutDriver(
  token: string,
  refresh_token?: string | null,
): Promise<void> {
  try {
    await fetch(`${getApiBaseUrl()}/auth/logout`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ refresh_token: refresh_token ?? undefined }),
    });
  } catch {
    /* ignore */
  }
}

export async function changeDriverPassword(
  token: string,
  current_password: string,
  new_password: string,
): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}/auth/change-password`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ current_password, new_password }),
  });
  await parseJson(res);
}

/* ---------------- Profile & Shift ---------------- */

export async function fetchDriverMe(token: string): Promise<DriverProfileMe> {
  const res = await fetch(`${getApiBaseUrl()}/driver/me`, {
    headers: authHeaders(token),
  });
  return parseJson(res);
}

export async function fetchCurrentShift(
  token: string,
): Promise<ShiftDto | null> {
  const res = await fetch(`${getApiBaseUrl()}/driver/shifts/current`, {
    headers: authHeaders(token),
  });
  if (res.status === 204 || res.status === 404) return null;
  const data = await parseJson<ShiftDto | null>(res);
  return data?.id ? data : null;
}

export async function startShift(
  token: string,
  location?: { lat: number; lng: number },
): Promise<ShiftDto> {
  const res = await fetch(`${getApiBaseUrl()}/driver/shifts/start`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(location ? { location } : {}),
  });
  return parseJson(res);
}

export async function fetchShiftSummary(
  token: string,
): Promise<ShiftSummaryDto> {
  const res = await fetch(`${getApiBaseUrl()}/driver/shifts/summary`, {
    headers: authHeaders(token),
  });
  return parseJson(res);
}

export async function endShift(
  token: string,
  payload: {
    checklist: {
      vehicle_clean: boolean;
      fuel_checked: boolean;
      cash_handed_over: boolean;
    };
    note?: string;
    location?: { lat: number; lng: number };
  },
): Promise<ShiftDto> {
  const res = await fetch(`${getApiBaseUrl()}/driver/shifts/end`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}

/* ---------------- Runs & Passenger Stops ---------------- */

export async function fetchMyRuns(
  token: string,
  scope: DriverRunScope,
): Promise<TripRunDto[]> {
  const q = new URLSearchParams({ scope });
  const res = await fetch(`${getApiBaseUrl()}/driver/runs?${q}`, {
    headers: authHeaders(token),
  });
  return parseJson(res);
}

export async function fetchRunDetail(
  token: string,
  runId: string,
): Promise<DriverRunDetailDto> {
  const res = await fetch(`${getApiBaseUrl()}/driver/runs/${runId}`, {
    headers: authHeaders(token),
  });
  return parseJson(res);
}

export async function startRun(
  token: string,
  runId: string,
): Promise<TripRunDto> {
  const res = await fetch(`${getApiBaseUrl()}/driver/runs/${runId}/start`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({}),
  });
  return parseJson(res);
}

export async function finishRun(
  token: string,
  runId: string,
): Promise<TripRunDto> {
  const res = await fetch(`${getApiBaseUrl()}/driver/runs/${runId}/finish`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({}),
  });
  return parseJson(res);
}

export async function pickupBooking(
  token: string,
  bookingId: string,
): Promise<BookingDto> {
  const res = await fetch(
    `${getApiBaseUrl()}/driver/bookings/${bookingId}/pickup`,
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    },
  );
  return parseJson(res);
}

export async function dropoffBooking(
  token: string,
  bookingId: string,
): Promise<BookingDto> {
  const res = await fetch(
    `${getApiBaseUrl()}/driver/bookings/${bookingId}/dropoff`,
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    },
  );
  return parseJson(res);
}

export async function markNoShowBooking(
  token: string,
  bookingId: string,
  reason?: string,
): Promise<BookingDto> {
  const res = await fetch(
    `${getApiBaseUrl()}/driver/bookings/${bookingId}/no-show`,
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(reason ? { reason } : {}),
    },
  );
  return parseJson(res);
}

/* ---------------- GPS Locations ---------------- */

export async function postDriverLocation(
  token: string,
  lat: number,
  lng: number,
  extra?: { speed_kmh?: number; heading?: number; accuracy_m?: number },
): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}/driver/locations`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      points: [
        {
          lat,
          lng,
          speed_kmh: extra?.speed_kmh,
          heading: extra?.heading,
          accuracy_m: extra?.accuracy_m,
          recorded_at: new Date().toISOString(),
        },
      ],
    }),
  });
  await parseJson(res);
}

/* ---------------- Cargos ---------------- */

export async function fetchMyCargos(token: string): Promise<CargoDto[]> {
  const res = await fetch(`${getApiBaseUrl()}/driver/cargos`, {
    headers: authHeaders(token),
  });
  return parseJson(res);
}

export async function scanCargoByCode(
  token: string,
  code: string,
): Promise<CargoDto> {
  const res = await fetch(
    `${getApiBaseUrl()}/driver/cargos/scan/${encodeURIComponent(code.trim())}`,
    {
      headers: authHeaders(token),
    },
  );
  return parseJson(res);
}

export async function pickupCargo(
  token: string,
  cargoId: string,
  proof_photo_url?: string,
): Promise<CargoDto> {
  const res = await fetch(
    `${getApiBaseUrl()}/driver/cargos/${cargoId}/pickup`,
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(proof_photo_url ? { proof_photo_url } : {}),
    },
  );
  return parseJson(res);
}

export async function deliverCargo(
  token: string,
  cargoId: string,
  payload?: { proof_photo_url?: string; cod_collected?: boolean },
): Promise<CargoDto> {
  const res = await fetch(
    `${getApiBaseUrl()}/driver/cargos/${cargoId}/deliver`,
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload ?? {}),
    },
  );
  return parseJson(res);
}

export async function returnCargo(
  token: string,
  cargoId: string,
  proof_photo_url?: string,
): Promise<CargoDto> {
  const res = await fetch(
    `${getApiBaseUrl()}/driver/cargos/${cargoId}/return`,
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(proof_photo_url ? { proof_photo_url } : {}),
    },
  );
  return parseJson(res);
}

/* ---------------- Comms, Incidents & Income ---------------- */

export async function fetchDriverChat(
  token: string,
  before?: string,
): Promise<ChatMessageDto[]> {
  const q = before ? `?before=${encodeURIComponent(before)}` : '';
  const res = await fetch(`${getApiBaseUrl()}/driver/chat${q}`, {
    headers: authHeaders(token),
  });
  return parseJson(res);
}

export async function sendDriverChat(
  token: string,
  body: string,
): Promise<ChatMessageDto> {
  const res = await fetch(`${getApiBaseUrl()}/driver/chat`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ body }),
  });
  return parseJson(res);
}

export async function fetchDriverNotifications(
  token: string,
): Promise<NotificationDto[]> {
  const res = await fetch(`${getApiBaseUrl()}/driver/notifications`, {
    headers: authHeaders(token),
  });
  return parseJson(res);
}

export async function markNotificationsRead(
  token: string,
  ids?: string[],
): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}/driver/notifications/read`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(ids ? { ids } : {}),
  });
  await parseJson(res);
}

export async function reportDriverIncident(
  token: string,
  payload: {
    kind: IncidentKind;
    description: string;
    location?: { lat: number; lng: number };
    photo_url?: string;
  },
): Promise<IncidentDto> {
  const res = await fetch(`${getApiBaseUrl()}/driver/incidents`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}

export async function registerDriverPushToken(
  token: string,
  pushToken: string,
  platform: 'ios' | 'android',
): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}/driver/push-token`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ token: pushToken, platform }),
  });
  await parseJson(res);
}

export async function fetchDriverIncome(
  token: string,
  month?: string,
): Promise<DriverIncomeDto> {
  const q = month ? `?month=${encodeURIComponent(month)}` : '';
  const res = await fetch(`${getApiBaseUrl()}/driver/income${q}`, {
    headers: authHeaders(token),
  });
  return parseJson(res);
}
