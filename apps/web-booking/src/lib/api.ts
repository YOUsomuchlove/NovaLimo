const DEFAULT_API = 'http://localhost:3000/api';

/** Public booking app — same env convention as web-admin (`NEXT_PUBLIC_API_URL`). */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  return fromEnv || DEFAULT_API;
}
