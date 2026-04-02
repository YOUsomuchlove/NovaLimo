import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type {
  Booking,
  DriverMyRunWithBookings,
  TripRunStatus,
} from '@limousine-workspace/shared-types';
import { BookingEntity } from '../entities/booking.entity';
import { CargoEntity } from '../entities/cargo.entity';
import { TripBatchEntity } from '../entities/trip-batch.entity';
import { TripRunEntity } from '../entities/trip-run.entity';
import { VehicleEntity } from '../entities/vehicle.entity';
import { bookingToDomain, cargoToDomain, tripRunToDomain } from '../mappers/to-domain';

export type MyRun = DriverMyRunWithBookings;

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(TripRunEntity)
    private readonly tripRuns: Repository<TripRunEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookings: Repository<BookingEntity>,
    @InjectRepository(TripBatchEntity)
    private readonly tripBatches: Repository<TripBatchEntity>,
    @InjectRepository(VehicleEntity)
    private readonly vehicles: Repository<VehicleEntity>,
    @InjectRepository(CargoEntity)
    private readonly cargos: Repository<CargoEntity>,
  ) {}

  async myRuns(
    driverId?: string,
    status?: TripRunStatus,
  ): Promise<MyRun[]> {
    const qb = this.tripRuns.createQueryBuilder('r');
    if (driverId) qb.andWhere('r.driver_id = :driverId', { driverId });
    if (status) qb.andWhere('r.status = :status', { status });
    qb.orderBy('r.id', 'ASC');
    const runs = await qb.getMany();
    if (runs.length === 0) return [];

    const batchIds = [...new Set(runs.map((x) => x.trip_batch_id))];
    const vehicleIds = [...new Set(runs.map((x) => x.vehicle_id))];
    const batches = await this.tripBatches.find({
      where: { id: In(batchIds) },
    });
    const vehs = await this.vehicles.find({ where: { id: In(vehicleIds) } });
    const batchMap = new Map(batches.map((b) => [b.id, b]));
    const vehicleMap = new Map(vehs.map((v) => [v.id, v]));

    const result: MyRun[] = [];
    for (const r of runs) {
      const tb = batchMap.get(r.trip_batch_id);
      const v = vehicleMap.get(r.vehicle_id);
      const list = await this.bookings.find({
        where: { trip_run_id: r.id },
        order: { pickup_order: 'ASC' },
      });
      const cargoCount = await this.cargos.count({
        where: { trip_run_id: r.id },
      });
      const base = tripRunToDomain(r);
      result.push({
        ...base,
        route_name: tb?.route_name ?? '',
        departure_time: tb?.departure_time?.toISOString() ?? '',
        license_plate: v?.license_plate ?? '',
        passenger_count: list.length,
        cargo_count: cargoCount,
        bookings: list.map(bookingToDomain),
      });
    }
    return result;
  }

  async cargosForRun(runId: string, driverId: string) {
    const run = await this.tripRuns.findOne({ where: { id: runId } });
    if (!run || run.driver_id !== driverId) return [];
    const rows = await this.cargos.find({
      where: { trip_run_id: runId },
      order: { waybill_code: 'ASC' },
    });
    return rows.map((e) => cargoToDomain(e));
  }
}
