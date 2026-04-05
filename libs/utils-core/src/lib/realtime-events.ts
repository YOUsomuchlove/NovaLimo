/**
 * Socket.io event names — đồng bộ api-server `EventsGateway` và clients (web-admin, app-driver).
 * Namespace: `io(origin + '/realtime')` — không nằm dưới `/api`.
 */
export const RealtimeEvents = {
  tripBatchUpdated: 'trip_batch_updated',
  tripRunUpdated: 'trip_run_updated',
  bookingStatusChanged: 'booking_status_changed',
  /** Vị trí xe → Admin monitor */
  driverLocation: 'driver_location',
  /** Chat tài xế ↔ điều hành */
  driverChat: 'driver_chat',
  shiftStarted: 'driver_shift_started',
  shiftEnded: 'driver_shift_ended',
} as const;
