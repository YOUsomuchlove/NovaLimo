import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Booking, TripRun, TripRunStatus } from '@limousine-workspace/shared-types';
import { BookingEntity } from '../entities/booking.entity';
import { TripRunEntity } from '../entities/trip-run.entity';
import { EventsGateway } from '../events/events.gateway';
import { bookingToDomain, tripRunToDomain } from '../mappers/to-domain';

export type TripRunDetail = {
  trip_run: TripRun;
  bookings: Booking[];
};

@Injectable()
export class TripRunsService {
  constructor(
    @InjectRepository(TripRunEntity)
    private readonly tripRuns: Repository<TripRunEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookings: Repository<BookingEntity>,
    private readonly events: EventsGateway,
  ) {}

  async list(tripBatchId?: string): Promise<TripRun[]> {
    const where = tripBatchId?.trim()
      ? { trip_batch_id: tripBatchId.trim() }
      : {};
    const rows = await this.tripRuns.find({
      where,
      order: { id: 'ASC' },
    });
    return rows.map(tripRunToDomain);
  }

  async getById(id: string): Promise<TripRunDetail> {
    const run = await this.tripRuns.findOne({ where: { id } });
    if (!run) throw new NotFoundException('trip run not found');

    const list = await this.bookings.find({
      where: { trip_run_id: id },
      order: { pickup_order: 'ASC' },
    });

    return {
      trip_run: tripRunToDomain(run),
      bookings: list.map(bookingToDomain),
    };
  }

  async patchStatusByDriver(
    runId: string,
    driverId: string,
    status: TripRunStatus,
  ): Promise<TripRun> {
    const run = await this.tripRuns.findOne({ where: { id: runId } });
    if (!run) throw new NotFoundException('trip run not found');
    if (run.driver_id !== driverId) throw new ForbiddenException();

    const order: TripRunStatus[] = ['PENDING', 'IN_PROGRESS', 'FINISHED'];
    const cur = order.indexOf(run.status);
    const next = order.indexOf(status);
    if (next === -1) throw new BadRequestException('invalid status');
    if (next !== cur && next !== cur + 1)
      throw new BadRequestException('invalid status transition');

    run.status = status;
    const saved = await this.tripRuns.save(run);
    const domain = tripRunToDomain(saved);
    this.events.emitTripRunUpdated(domain);
    return domain;
  }
}
