const DEFAULT_API = 'http://localhost:3000/api';

/** localStorage — đồng bộ khi gọi `authFetch` từ trình duyệt. */
export const ADMIN_WEB_TOKEN_KEY = 'novalimo_admin_access_token';

export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  return fromEnv || DEFAULT_API;
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_WEB_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_WEB_TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_WEB_TOKEN_KEY);
}

export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = getAdminToken();
  const headers = new Headers(init?.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}

export type AdminLoginResponse = { access_token: string };

export async function loginAdmin(phone: string, password: string): Promise<AdminLoginResponse> {
  const res = await fetch(`${getApiBaseUrl()}/auth/login/admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  if (!res.ok) {
    let msg = `Đăng nhập thất bại (${res.status})`;
    try {
      const j = (await res.json()) as { message?: string | string[] };
      const m = j.message;
      if (typeof m === 'string') msg = m;
      else if (Array.isArray(m)) msg = m.join(', ');
    } catch {
      /* keep default */
    }
    throw new Error(msg);
  }
  return res.json() as Promise<AdminLoginResponse>;
}

/**
 * Origin cho Socket.io (`/realtime`), không gồm `/api`.
 * @see apps/web-admin monitor page
 */
export function getSocketBaseUrl(): string {
  return getApiBaseUrl().replace(/\/$/, '').replace(/\/api\/?$/, '');
}
