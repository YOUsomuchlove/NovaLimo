import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { TripBatchStatus } from '@limousine-workspace/shared-types';
import { Repository } from 'typeorm';
import { TripBatchEntity } from '../entities/trip-batch.entity';
import { tripBatchToDto } from '../mappers/to-dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class TripBatchesService {
  constructor(
    @InjectRepository(TripBatchEntity)
    private readonly batches: Repository<TripBatchEntity>,
    private readonly events: EventsGateway,
  ) {}

  async listPublic(status?: TripBatchStatus) {
    const q = this.batches
      .createQueryBuilder('b')
      .orderBy('b.departure_time', 'ASC');
    if (status) q.andWhere('b.status = :status', { status });
    const rows = await q.getMany();
    return rows.map(tripBatchToDto);
  }

  async findOne(id: string) {
    const b = await this.batches.findOne({ where: { id } });
    if (!b) throw new NotFoundException('Trip batch not found');
    return tripBatchToDto(b);
  }

  async create(data: Partial<TripBatchEntity>) {
    const row = await this.batches.save(this.batches.create(data));
    const dto = tripBatchToDto(row);
    this.events.emitTripBatchUpdated(row.id, dto);
    return dto;
  }

  async update(id: string, patch: Partial<TripBatchEntity>) {
    const b = await this.batches.findOne({ where: { id } });
    if (!b) throw new NotFoundException('Trip batch not found');
    Object.assign(b, patch);
    const saved = await this.batches.save(b);
    const dto = tripBatchToDto(saved);
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
