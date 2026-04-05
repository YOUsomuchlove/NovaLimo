import type { Cargo, DriverMyRunWithBookings, TripRunStatus } from '@limousine-workspace/shared-types';

const DEFAULT_API = 'http://localhost:3000/api';

export function getApiBaseUrl(): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (globalThis as any).process?.env?.EXPO_PUBLIC_API_URL as string | undefined;
  return (env || DEFAULT_API).replace(/\/$/, '');
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (!text || text === 'null') return {} as T;
  return JSON.parse(text) as T;
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function loginDriver(phone: string, password: string): Promise<{ access_token: string }> {
  const res = await fetch(`${getApiBaseUrl()}/auth/login/driver`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  return parseJson(res);
}

export async function fetchMyRuns(
  token: string,
  status: TripRunStatus,
): Promise<DriverMyRunWithBookings[]> {
  const q = new URLSearchParams({ status });
  const res = await fetch(`${getApiBaseUrl()}/trips/my-runs?${q}`, {
    headers: authHeaders(token),
  });
  return parseJson(res);
}

export async function fetchRunDetail(
  token: string,
  runId: string,
): Promise<DriverMyRunWithBookings> {
  const res = await fetch(`${getApiBaseUrl()}/trips/my-runs/${runId}`, {
    headers: authHeaders(token),
  });
  return parseJson(res);
}

export async function fetchCurrentShift(token: string): Promise<{ id: string } | null> {
  const res = await fetch(`${getApiBaseUrl()}/driver/shifts/current`, {
    headers: authHeaders(token),
  });
  if (res.status === 204 || res.status === 404) return null;
  if (!res.ok) throw new Error(await res.text());
  const data = await parseJson<{ id?: string }>(res);
  return data?.id ? (data as { id: string }) : null;
}

export async function startShift(token: string): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}/driver/shifts/start`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function endShift(token: string): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}/driver/shifts/end`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function postDriverLocation(
  token: string,
  lat: number,
  lng: number,
): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}/driver/location`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ lat, lng }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function fetchMyCargos(token: string): Promise<Cargo[]> {
  const res = await fetch(`${getApiBaseUrl()}/cargos/my-tasks`, {
    headers: authHeaders(token),
  });
  return parseJson(res);
}
