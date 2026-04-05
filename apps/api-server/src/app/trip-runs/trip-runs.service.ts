import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { TripRunStatus } from '@limousine-workspace/shared-types';
import { Repository } from 'typeorm';
import { TripRunEntity } from '../entities/trip-run.entity';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class TripRunsService {
  constructor(
    @InjectRepository(TripRunEntity)
    private readonly runs: Repository<TripRunEntity>,
    private readonly events: EventsGateway,
  ) {}

  async list() {
    return this.runs.find({
      order: { id: 'DESC' },
      take: 500,
      relations: ['trip_batch', 'vehicle', 'driver'],
    });
  }

  async findOne(id: string) {
    const r = await this.runs.findOne({
      where: { id },
      relations: ['trip_batch', 'vehicle', 'driver'],
    });
    if (!r) throw new NotFoundException('Trip run not found');
    return r;
  }

  async create(data: Partial<TripRunEntity>) {
    const row = await this.runs.save(this.runs.create(data));
    this.events.emitTripRunUpdated(row);
    return row;
  }

  async update(id: string, patch: Partial<TripRunEntity>) {
    const r = await this.runs.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Trip run not found');
    Object.assign(r, patch);
    const saved = await this.runs.save(r);
    this.events.emitTripRunUpdated(saved);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const x = await this.runs.delete(id);
    if (!x.affected) throw new NotFoundException('Trip run not found');
  }

  async findEntity(id: string): Promise<TripRunEntity> {
    const r = await this.runs.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Trip run not found');
    return r;
  }

  async listStatusesForDriver(driverId: string, status: TripRunStatus) {
    return this.runs.find({
      where: { driver_id: driverId, status },
      relations: ['trip_batch', 'vehicle'],
      order: { id: 'DESC' },
    });
  }
}
