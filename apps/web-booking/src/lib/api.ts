/**
 * api-server: `setGlobalPrefix('api')` + `PORT` (mặc định 3000) → ví dụ
 * `http://localhost:3000/api`.
 */
const DEFAULT_API = 'http://localhost:3000/api';

/** Public booking app — cùng quy ước web-admin: `NEXT_PUBLIC_API_URL` (không dấu / cuối). */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  return fromEnv || DEFAULT_API;
}
