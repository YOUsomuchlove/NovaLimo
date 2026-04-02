const DEFAULT_API = 'http://localhost:3000/api';

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return (
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || DEFAULT_API
    );
  }
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || DEFAULT_API;
}

/**
 * HTTP origin for Socket.io (`/realtime`), not under `/api`.
 * Logic matches `getSocketOriginFromApiBaseUrl` in `@limousine-workspace/utils-core` (Next bundler cannot import that lib from client).
 */
export function getSocketBaseUrl(): string {
  return getApiBaseUrl().replace(/\/$/, '').replace(/\/api\/?$/, '');
}
