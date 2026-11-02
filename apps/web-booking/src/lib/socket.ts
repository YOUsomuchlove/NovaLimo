'use client';

import { getSocketOriginFromApiBaseUrl } from '@limousine-workspace/utils-core';
import { io, type Socket } from 'socket.io-client';
import { API_URL } from './api';

let socket: Socket | null = null;

/** Anonymous connection to /realtime — may only join public rooms (seat maps, own payment). */
export function realtime(): Socket {
  if (!socket) {
    socket = io(`${getSocketOriginFromApiBaseUrl(API_URL)}/realtime`, {
      transports: ['websocket'],
      reconnectionDelayMax: 10_000,
    });
  }
  return socket;
}
