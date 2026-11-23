'use client';

import { io, type Socket } from 'socket.io-client';
import { getAdminToken, getSocketBaseUrl } from './api';

let socket: Socket | null = null;
let socketToken: string | null = null;

/**
 * Returns the authenticated Admin Socket.io client connected to `/realtime`.
 * Automatically joins the `ops` room on the server when a valid staff JWT is passed.
 */
export function getAdminSocket(): Socket {
  const token = getAdminToken();
  if (socket && socketToken !== token) {
    socket.disconnect();
    socket = null;
  }
  if (!socket) {
    socketToken = token;
    socket = io(`${getSocketBaseUrl()}/realtime`, {
      transports: ['websocket', 'polling'],
      auth: token ? { token } : undefined,
      reconnectionDelayMax: 10_000,
    });
  }
  return socket;
}

export function disconnectAdminSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    socketToken = null;
  }
}
