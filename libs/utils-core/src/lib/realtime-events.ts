/**
 * Socket.io contract — namespace `io(origin + '/realtime')` (NOT under `/api`).
 * Auth: pass `{ auth: { token: accessToken } }`; anonymous sockets may only join `batch:*` / `booking:*` rooms.
 *
 * Rooms the server puts sockets in:
 *   ops            every staff user (dispatch / monitor / CS)
 *   driver:{id}    a driver's own devices
 *   batch:{id}     anyone viewing a trip's seat map (after `subscribe_batch`)
 *   booking:{code} a customer waiting for payment confirmation (after `subscribe_booking`)
 */
export const RealtimeEvents = {
  /** server → batch:{id} — SeatsChangedEvent */
  seatsChanged: 'seats_changed',
  /** server → booking:{code} — { code, payment_status } */
  paymentConfirmed: 'payment_confirmed',
  /** server → ops — BookingDto */
  bookingUpdated: 'booking_updated',
  /** server → ops — { id, status } */
  tripBatchUpdated: 'trip_batch_updated',
  /** server → ops + driver:{id} — TripRunDto */
  tripRunUpdated: 'trip_run_updated',
  /** server → ops — DriverLocationEvent */
  driverLocation: 'driver_location',
  /** server → ops + driver:{id} — ChatMessageDto */
  chatMessage: 'chat_message',
  /** server → ops — IncidentDto */
  incidentReported: 'incident_reported',
  /** server → ops — { driver_id, on_shift } */
  shiftChanged: 'shift_changed',
  /** server → driver:{id} — NotificationDto */
  notification: 'notification',
} as const;

/** Client → server messages */
export const RealtimeCommands = {
  subscribeBatch: 'subscribe_batch',
  unsubscribeBatch: 'unsubscribe_batch',
  subscribeBooking: 'subscribe_booking',
} as const;

export const realtimeRooms = {
  ops: 'ops',
  driver: (id: string) => `driver:${id}`,
  batch: (id: string) => `batch:${id}`,
  booking: (code: string) => `booking:${code}`,
};
