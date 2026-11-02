import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { TripBatchStatus } from '@limousine-workspace/shared-types';
import { Not, Repository } from 'typeorm';
import { BookingEntity } from '../entities/booking.entity';
import { TripBatchEntity } from '../entities/trip-batch.entity';
import { tripBatchToDto } from '../mappers/to-dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class TripBatchesService {
  constructor(
    @InjectRepository(TripBatchEntity)
    private readonly batches: Repository<TripBatchEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookings: Repository<BookingEntity>,
    private readonly events: EventsGateway,
  ) {}

  /** Đếm số nhãn ghế đã giữ (vé không hủy). */
  private async countBookedSeatLabels(tripBatchId: string): Promise<number> {
    const rows = await this.bookings.find({
      where: {
        trip_batch_id: tripBatchId,
        status: Not('CANCELLED' as never),
      },
      select: ['seat_label'],
    });
    const set = new Set<string>();
    for (const r of rows) {
      if (!r.seat_label) continue;
      for (const part of r.seat_label.split(/\s*,\s*/)) {
        const s = part.trim();
        if (s) set.add(s);
      }
    }
    return set.size;
  }

  private async toPublicDto(b: TripBatchEntity) {
    const booked = await this.countBookedSeatLabels(b.id);
    return tripBatchToDto(b, booked);
  }

  async listPublic(status?: TripBatchStatus) {
    const q = this.batches
      .createQueryBuilder('b')
      .orderBy('b.departure_time', 'ASC');
    if (status) q.andWhere('b.status = :status', { status });
    const rows = await q.getMany();
    const out = [];
    for (const b of rows) {
      out.push(await this.toPublicDto(b));
    }
    return out;
  }

  async findOne(id: string) {
    const b = await this.batches.findOne({ where: { id } });
    if (!b) throw new NotFoundException('Trip batch not found');
    return this.toPublicDto(b);
  }

  async create(data: Partial<TripBatchEntity>) {
    const row = await this.batches.save(this.batches.create(data));
    const dto = await this.toPublicDto(row);
    this.events.emitTripBatchUpdated(row.id, dto);
    return dto;
  }

  async update(id: string, patch: Partial<TripBatchEntity>) {
    const b = await this.batches.findOne({ where: { id } });
    if (!b) throw new NotFoundException('Trip batch not found');
    Object.assign(b, patch);
    const saved = await this.batches.save(b);
    const dto = await this.toPublicDto(saved);
    this.events.emitTripBatchUpdated(saved.id, dto);
    return dto;
  }

  async remove(id: string): Promise<void> {
    const r = await this.batches.delete(id);
    if (!r.affected) throw new NotFoundException('Trip batch not found');
  }

  async getEntity(id: string): Promise<TripBatchEntity> {
    const b = await this.batches.findOne({ where: { id } });
    if (!b) throw new NotFoundException('Trip batch not found');
    return b;
  }
}
