import type {
  SeatAvailabilityDto,
  TripSeatMapDto,
} from '@limousine-workspace/shared-types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type EntityManager, In, type Repository } from 'typeorm';
import { vnDateString } from '../../common/time';
import {
  BookingSeatEntity,
  SeatHoldEntity,
  TripBatchEntity,
} from '../../database/entities';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PricingService, seatPrice } from '../catalog/pricing.service';

/** Seat counts per batch, computed in one grouped query (no N+1). */
@Injectable()
export class SeatAvailabilityService {
  constructor(
    @InjectRepository(TripBatchEntity)
    private readonly batches: Repository<TripBatchEntity>,
    @InjectRepository(BookingSeatEntity)
    private readonly seats: Repository<BookingSeatEntity>,
    private readonly pricing: PricingService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async soldCounts(
    batchIds: string[],
    manager?: EntityManager,
  ): Promise<Map<string, number>> {
    if (batchIds.length === 0) return new Map();
    const repo = manager
      ? manager.getRepository(BookingSeatEntity)
      : this.seats;
    const rows = await repo
      .createQueryBuilder('s')
      .select('s.trip_batch_id', 'id')
      .addSelect('COUNT(*)', 'n')
      .where({ trip_batch_id: In(batchIds), is_active: true })
      .groupBy('s.trip_batch_id')
      .getRawMany<{ id: string; n: string }>();
    return new Map(rows.map((r) => [r.id, Number(r.n)]));
  }

  /** Per-label availability. Pass a manager to read inside a booking transaction. */
  async seatMap(
    batchId: string,
    manager?: EntityManager,
  ): Promise<TripSeatMapDto> {
    const m = manager ?? this.batches.manager;
    const batch = await m.findOne(TripBatchEntity, {
      where: { id: batchId },
      relations: { vehicle_type: true },
    });
    if (!batch) throw new NotFoundException('Không tìm thấy chuyến');
    const fare = await this.pricing.findFare(
      batch.route_id,
      batch.vehicle_type_id,
      vnDateString(batch.departure_at),
    );

    const sold = await m
      .getRepository(BookingSeatEntity)
      .createQueryBuilder('s')
      .select('s.seat_label', 'label')
      .addSelect('COUNT(*)', 'n')
      .where({ trip_batch_id: batchId, is_active: true })
      .groupBy('s.seat_label')
      .getRawMany<{ label: string; n: string }>();
    const held = await m
      .getRepository(SeatHoldEntity)
      .createQueryBuilder('h')
      .select('h.seat_label', 'label')
      .addSelect('COUNT(*)', 'n')
      .where('h.trip_batch_id = :batchId AND h.expires_at > now()', { batchId })
      .groupBy('h.seat_label')
      .getRawMany<{ label: string; n: string }>();
    const soldBy = new Map(sold.map((r) => [r.label, Number(r.n)]));
    const heldBy = new Map(held.map((r) => [r.label, Number(r.n)]));

    const seats: SeatAvailabilityDto[] = batch.vehicle_type.seat_layout
      .flat()
      .flatMap((cell) =>
        cell
          ? [
              {
                label: cell.label,
                tier: cell.tier,
                price_vnd: fare ? seatPrice(fare, cell.tier) : 0,
                held: heldBy.get(cell.label) ?? 0,
                remaining: Math.max(
                  0,
                  batch.planned_vehicles -
                    (soldBy.get(cell.label) ?? 0) -
                    (heldBy.get(cell.label) ?? 0),
                ),
              },
            ]
          : [],
      );
    return {
      trip_batch_id: batchId,
      layout: batch.vehicle_type.seat_layout,
      seats,
    };
  }

  /** Push fresh availability to everyone viewing this batch's seat map. */
  async broadcast(batchId: string): Promise<void> {
    try {
      const map = await this.seatMap(batchId);
      this.realtime.seatsChanged({ trip_batch_id: batchId, seats: map.seats });
    } catch {
      /* realtime is best-effort */
    }
  }
}
