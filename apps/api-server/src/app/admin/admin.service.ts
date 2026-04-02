import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingEntity } from '../entities/booking.entity';
import { TripBatchEntity } from '../entities/trip-batch.entity';
import { TripRunEntity } from '../entities/trip-run.entity';
import { VehicleEntity } from '../entities/vehicle.entity';

export type AdminStatsDto = {
  trip_batches_open: number;
  trip_batches_clustered: number;
  trip_runs_in_progress: number;
  bookings_total: number;
  revenue_paid_vnd: number;
  vehicles_available: number;
};

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(TripBatchEntity)
    private readonly batches: Repository<TripBatchEntity>,
    @InjectRepository(TripRunEntity)
    private readonly runs: Repository<TripRunEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookings: Repository<BookingEntity>,
    @InjectRepository(VehicleEntity)
    private readonly vehicles: Repository<VehicleEntity>,
  ) {}

  async getStats(): Promise<AdminStatsDto> {
    const [open, clustered] = await Promise.all([
      this.batches.count({ where: { status: 'OPEN' } }),
      this.batches.count({ where: { status: 'CLUSTERED' } }),
    ]);
    const trip_runs_in_progress = await this.runs.count({
      where: { status: 'IN_PROGRESS' },
    });
    const bookings_total = await this.bookings.count();
    const raw = await this.bookings
      .createQueryBuilder('b')
      .select('COALESCE(SUM(b.total_amount),0)', 'sum')
      .where('b.payment_status = :ps', { ps: 'PAID' })
      .getRawOne<{ sum: string }>();
    const revenue_paid_vnd = parseFloat(raw?.sum ?? '0') || 0;
    const vehicles_available = await this.vehicles.count({
      where: { status: 'AVAILABLE' },
    });

    return {
      trip_batches_open: open,
      trip_batches_clustered: clustered,
      trip_runs_in_progress,
      bookings_total,
      revenue_paid_vnd,
      vehicles_available,
    };
  }
}
