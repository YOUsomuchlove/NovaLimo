import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

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
      this.server.emit('trip_batch_updated', { batchId, payload });
    } catch (e) {
      this.logger.warn(
        `emit trip_batch_updated failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  emitTripRunUpdated(tripRun: unknown): void {
    try {
      this.server.emit('trip_run_updated', tripRun);
    } catch (e) {
      this.logger.warn(
        `emit trip_run_updated failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  emitBookingStatusChanged(booking: unknown): void {
    try {
      this.server.emit('booking_status_changed', booking);
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
      this.server.emit('driver_location', payload);
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
      this.server.emit('driver_chat', payload);
    } catch (e) {
      this.logger.warn(
        `emit driver_chat failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }
}
