import type {
  Booking,
  Cargo,
  DriverMyRunWithBookings,
  TripRun,
  TripRunStatus,
} from '@limousine-workspace/shared-types';
import { API_BASE_URL } from '../config';

export function getSocketBaseUrl(): string {
  return API_BASE_URL.replace(/\/$/, '').replace(/\/api\/?$/, '');
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export async function loginDriver(
  phone: string,
  password: string,
): Promise<{ access_token: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/login/driver`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  return parseJson(res);
}

export async function fetchMyRuns(
  token: string,
  status?: TripRunStatus,
): Promise<DriverMyRunWithBookings[]> {
  const q = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await fetch(`${API_BASE_URL}/trips/my-runs${q}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJson(res);
}

export async function fetchTripRunDetail(
  token: string,
  runId: string,
): Promise<{ trip_run: TripRun; bookings: Booking[] }> {
  const res = await fetch(`${API_BASE_URL}/trip-runs/${runId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJson(res);
}

export async function patchTripRunStatus(
  token: string,
  runId: string,
  status: TripRunStatus,
): Promise<TripRun> {
  const res = await fetch(`${API_BASE_URL}/trip-runs/${runId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  return parseJson(res);
}

export async function patchBookingStatus(
  token: string,
  bookingId: string,
  status: Booking['status'],
): Promise<Booking> {
  const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  return parseJson(res);
}

export async function fetchCargosForRun(
  token: string,
  runId: string,
): Promise<Cargo[]> {
  const res = await fetch(
    `${API_BASE_URL}/trips/my-runs/${runId}/cargos`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return parseJson(res);
}

export async function patchCargoDriverStatus(
  token: string,
  cargoId: string,
  status: Cargo['status'],
): Promise<Cargo> {
  const res = await fetch(
    `${API_BASE_URL}/cargos/${cargoId}/driver-status`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ status }),
    },
  );
  return parseJson(res);
}

export async function startShift(token: string): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/drivers/shifts/start`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJson(res);
}

export async function endShift(token: string): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/drivers/shifts/end`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJson(res);
}

export async function postDriverLocation(
  token: string,
  lat: number,
  lng: number,
): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/drivers/location`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ lat, lng }),
  });
  return parseJson(res);
}

export async function postDriverChat(
  token: string,
  message: string,
): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/drivers/chat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });
  return parseJson(res);
}

export async function fetchShiftSummary(token: string): Promise<{
  active: boolean;
  shift: { id: string; started_at?: string; ended_at?: string | null } | null;
  location_pings: number;
}> {
  const res = await fetch(`${API_BASE_URL}/drivers/shifts/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJson(res);
}

export async function fetchCurrentShift(
  token: string,
): Promise<{ id: string } | null> {
  const res = await fetch(`${API_BASE_URL}/drivers/shifts/current`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { shift?: { id: string } | null };
  return data.shift?.id ? { id: data.shift.id } : null;
}
