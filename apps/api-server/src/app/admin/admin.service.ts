import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingEntity } from '../entities/booking.entity';
import { TripBatchEntity } from '../entities/trip-batch.entity';
import { TripRunEntity } from '../entities/trip-run.entity';
import { VehicleEntity } from '../entities/vehicle.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(TripBatchEntity)
    private readonly batches: Repository<TripBatchEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookings: Repository<BookingEntity>,
    @InjectRepository(VehicleEntity)
    private readonly vehicles: Repository<VehicleEntity>,
    @InjectRepository(TripRunEntity)
    private readonly runs: Repository<TripRunEntity>,
  ) {}

  async stats() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const trips_today = await this.batches
      .createQueryBuilder('b')
      .where('b.departure_time BETWEEN :start AND :end', { start, end })
      .getCount();

    const pending_bookings = await this.bookings.count({
      where: { status: 'WAITING' },
    });

    const vehicles_in_use = await this.vehicles.count({
      where: { status: 'IN_USE' },
    });

    const active_runs = await this.runs.count({
      where: { status: 'IN_PROGRESS' },
    });

    return {
      trips_today,
      pending_bookings,
      vehicles_in_use,
      active_trip_runs: active_runs,
    };
  }
}
