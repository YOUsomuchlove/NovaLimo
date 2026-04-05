import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { TripRunStatus } from '@limousine-workspace/shared-types';
import { Repository } from 'typeorm';
import { BookingEntity } from '../entities/booking.entity';
import { CargoEntity } from '../entities/cargo.entity';
import { TripRunEntity } from '../entities/trip-run.entity';
import { driverMyRunToDto } from '../mappers/to-dto';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(TripRunEntity)
    private readonly runs: Repository<TripRunEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookings: Repository<BookingEntity>,
    @InjectRepository(CargoEntity)
    private readonly cargos: Repository<CargoEntity>,
  ) {}

  async myRuns(driverId: string, status: TripRunStatus) {
    const list = await this.runs.find({
      where: { driver_id: driverId, status },
      relations: ['trip_batch', 'vehicle'],
    });
    list.sort(
      (a, b) =>
        a.trip_batch.departure_time.getTime() -
        b.trip_batch.departure_time.getTime(),
    );
    const out = [];
    for (const run of list) {
      const [bookings, cargoCount, passenger_count] = await Promise.all([
        this.bookings.find({ where: { trip_run_id: run.id } }),
        this.cargos.count({ where: { trip_run_id: run.id } }),
        this.bookings
          .createQueryBuilder('b')
          .where('b.trip_run_id = :rid', { rid: run.id })
          .andWhere('b.status != :cancel', { cancel: 'CANCELLED' })
          .getCount(),
      ]);
      out.push(
        driverMyRunToDto({
          ...run,
          passenger_count,
          cargo_count: cargoCount,
          bookings,
        }),
      );
    }
    return out;
  }

  async myRunDetail(driverId: string, runId: string) {
    const run = await this.runs.findOne({
      where: { id: runId },
      relations: ['trip_batch', 'vehicle'],
    });
    if (!run) throw new NotFoundException('Trip run not found');
    if (run.driver_id !== driverId) throw new ForbiddenException();
    const bookings = await this.bookings.find({
      where: { trip_run_id: run.id },
    });
    const cargoCount = await this.cargos.count({
      where: { trip_run_id: run.id },
    });
    const passenger_count = await this.bookings
      .createQueryBuilder('b')
      .where('b.trip_run_id = :rid', { rid: run.id })
      .andWhere('b.status != :cancel', { cancel: 'CANCELLED' })
      .getCount();
    return driverMyRunToDto({
      ...run,
      passenger_count,
      cargo_count: cargoCount,
      bookings,
    });
  }
}
