import type {
  DriverLocationEvent,
  SeatsChangedEvent,
} from '@limousine-workspace/shared-types';
import {
  RealtimeCommands,
  RealtimeEvents,
  realtimeRooms,
} from '@limousine-workspace/utils-core';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import type { AuthUser } from '../../common/auth/auth-user';

const UUID = /^[0-9a-f-]{36}$/i;
const BOOKING_CODE = /^NL-[0-9A-Z]{6}$/;

/**
 * Socket.io namespace `/realtime`. Staff join `ops`, drivers join `driver:{id}`; anonymous
 * clients may only subscribe to seat availability (`batch:{id}`) and their own payment status
 * (`booking:{code}`) — no PII or GPS is ever broadcast globally.
 * CORS for the socket is checked by the adapter configured in main.ts.
 */
@WebSocketGateway({ namespace: '/realtime' })
export class RealtimeGateway implements OnGatewayConnection {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwt: JwtService) {}

  async handleConnection(socket: Socket): Promise<void> {
    const token = (socket.handshake.auth as { token?: string } | undefined)
      ?.token;
    if (!token) return; // anonymous: public rooms only
    try {
      const user = await this.jwt.verifyAsync<AuthUser>(token);
      socket.data.user = user;
      await socket.join(
        user.kind === 'STAFF'
          ? realtimeRooms.ops
          : realtimeRooms.driver(user.sub),
      );
    } catch {
      socket.emit('auth_error', { code: 'TOKEN_INVALID' });
      socket.disconnect(true);
    }
  }

  @SubscribeMessage(RealtimeCommands.subscribeBatch)
  async subscribeBatch(
    @ConnectedSocket() socket: Socket,
    @MessageBody() batchId: string,
  ) {
    if (typeof batchId !== 'string' || !UUID.test(batchId))
      return { ok: false };
    await socket.join(realtimeRooms.batch(batchId));
    return { ok: true };
  }

  @SubscribeMessage(RealtimeCommands.unsubscribeBatch)
  async unsubscribeBatch(
    @ConnectedSocket() socket: Socket,
    @MessageBody() batchId: string,
  ) {
    if (typeof batchId === 'string')
      await socket.leave(realtimeRooms.batch(batchId));
    return { ok: true };
  }

  @SubscribeMessage(RealtimeCommands.subscribeBooking)
  async subscribeBooking(
    @ConnectedSocket() socket: Socket,
    @MessageBody() code: string,
  ) {
    if (typeof code !== 'string' || !BOOKING_CODE.test(code))
      return { ok: false };
    await socket.join(realtimeRooms.booking(code));
    return { ok: true };
  }

  /* ---------- emitters (fire-and-forget, never throw into business logic) ---------- */

  private emit(room: string | string[], event: string, payload: unknown) {
    try {
      this.server?.to(room).emit(event, payload);
    } catch (e) {
      this.logger.warn(
        `emit ${event} failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  seatsChanged(payload: SeatsChangedEvent) {
    this.emit(
      realtimeRooms.batch(payload.trip_batch_id),
      RealtimeEvents.seatsChanged,
      payload,
    );
  }

  paymentConfirmed(code: string, payment_status: string) {
    this.emit(realtimeRooms.booking(code), RealtimeEvents.paymentConfirmed, {
      code,
      payment_status,
    });
  }

  toOps(
    event: (typeof RealtimeEvents)[keyof typeof RealtimeEvents],
    payload: unknown,
  ) {
    this.emit(realtimeRooms.ops, event, payload);
  }

  toDriver(
    driverId: string,
    event: (typeof RealtimeEvents)[keyof typeof RealtimeEvents],
    payload: unknown,
  ) {
    this.emit(realtimeRooms.driver(driverId), event, payload);
  }

  toOpsAndDriver(
    driverId: string,
    event: (typeof RealtimeEvents)[keyof typeof RealtimeEvents],
    payload: unknown,
  ) {
    this.emit(
      [realtimeRooms.ops, realtimeRooms.driver(driverId)],
      event,
      payload,
    );
  }

  driverLocation(payload: DriverLocationEvent) {
    this.emit(realtimeRooms.ops, RealtimeEvents.driverLocation, payload);
  }
}
