import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { RealtimeEvents } from '@limousine-workspace/utils-core';
import { Server } from 'socket.io';

/**
 * Phát sự kiện realtime (namespace `/realtime`).
 * Được gọi từ: TripBatchesService, TripRunsService, BookingsService, DriversService.
 */
@WebSocketGateway({
  namespace: '/realtime',
  cors: { origin: '*' },
})
export class EventsGateway {
  private readonly logger = new Logger(EventsGateway.name);

  @WebSocketServer()
  server!: Server;

  emitTripBatchUpdated(batchId: string, payload: unknown): void {
    try {
      this.server.emit(RealtimeEvents.tripBatchUpdated, { batchId, payload });
    } catch (e) {
      this.logger.warn(
        `emit trip_batch_updated failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  emitTripRunUpdated(tripRun: unknown): void {
    try {
      this.server.emit(RealtimeEvents.tripRunUpdated, tripRun);
    } catch (e) {
      this.logger.warn(
        `emit trip_run_updated failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  emitBookingStatusChanged(booking: unknown): void {
    try {
      this.server.emit(RealtimeEvents.bookingStatusChanged, booking);
    } catch (e) {
      this.logger.warn(
        `emit booking_status_changed failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  emitDriverLocation(payload: {
    driver_id: string;
    lat: number;
    lng: number;
    recorded_at: string;
  }): void {
    try {
      this.server.emit(RealtimeEvents.driverLocation, payload);
    } catch (e) {
      this.logger.warn(
        `emit driver_location failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  emitDriverChat(payload: {
    from: 'driver' | 'ops';
    driver_id: string;
    message: string;
    at: string;
  }): void {
    try {
      this.server.emit(RealtimeEvents.driverChat, payload);
    } catch (e) {
      this.logger.warn(
        `emit driver_chat failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  emitShiftStarted(payload: { driver_id: string; shift_id: string; at: string }): void {
    try {
      this.server.emit(RealtimeEvents.shiftStarted, payload);
    } catch (e) {
      this.logger.warn(
        `emit shift started failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  emitShiftEnded(payload: {
    driver_id: string;
    shift_id: string;
    at: string;
    location_pings: number;
  }): void {
    try {
      this.server.emit(RealtimeEvents.shiftEnded, payload);
    } catch (e) {
      this.logger.warn(
        `emit shift ended failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }
}
