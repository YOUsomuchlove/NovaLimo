export function getApiBaseUrl(): string {
  const v = process.env.NEXT_PUBLIC_API_URL?.trim();
  return v || 'http://localhost:3000/api';
}

/**
 * HTTP origin for Socket.io (`/realtime`), not under `/api`.
 * Logic matches `getSocketOriginFromApiBaseUrl` in `@limousine-workspace/utils-core`.
 */
export function getSocketBaseUrl(): string {
  return getApiBaseUrl().replace(/\/$/, '').replace(/\/api\/?$/, '');
}
