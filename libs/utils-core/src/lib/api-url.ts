/**
 * Socket.io mounts at `/realtime` on the HTTP origin, not under Nest's global `/api` prefix.
 * Strip trailing `/api` from the REST base URL before connecting.
 */
export function getSocketOriginFromApiBaseUrl(apiBaseUrl: string): string {
  return apiBaseUrl.replace(/\/$/, '').replace(/\/api\/?$/, '');
}
