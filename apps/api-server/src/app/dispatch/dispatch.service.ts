import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import type { Booking, TripBatch, TripRun } from '@limousine-workspace/shared-types';
import { BookingEntity } from '../entities/booking.entity';
import { TripBatchEntity } from '../entities/trip-batch.entity';
import { TripRunEntity } from '../entities/trip-run.entity';
import { UserEntity } from '../entities/user.entity';
import { VehicleEntity } from '../entities/vehicle.entity';
import {
  bookingToDomain,
  tripBatchToDomain,
  tripRunToDomain,
} from '../mappers/to-domain';
import { syncBookingGeomsForBatch } from '../utils/sync-booking-geom';
import { kMeansLabels } from './kmeans';
import { OrToolsVrpService } from './ortools-vrp.service';
import { SpatialClusterService } from './spatial-cluster.service';

export type ClusterResult = {
  trip_batch: TripBatch;
  created_trip_runs: TripRun[];
  updated_bookings: Booking[];
};

@Injectable()
export class DispatchService {
  private readonly logger = new Logger(DispatchService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly config: ConfigService,
    private readonly spatialCluster: SpatialClusterService,
    private readonly ortoolsVrp: OrToolsVrpService,
  ) {}

  async clusterTripBatch(batchId: string): Promise<ClusterResult> {
    return this.dataSource.transaction(async (em) => {
      const batchRepo = em.getRepository(TripBatchEntity);
      const bookingRepo = em.getRepository(BookingEntity);
      const vehicleRepo = em.getRepository(VehicleEntity);
      const userRepo = em.getRepository(UserEntity);
      const runRepo = em.getRepository(TripRunEntity);

      const batch = await batchRepo.findOne({ where: { id: batchId } });
      if (!batch) throw new BadRequestException('trip batch not found');
      if (batch.status !== 'OPEN')
        throw new BadRequestException('trip batch is not OPEN');

      const batchBookings = await bookingRepo.find({
        where: { trip_batch_id: batchId },
        order: { id: 'ASC' },
      });
      if (batchBookings.length === 0)
        throw new BadRequestException('no bookings in this trip batch');

      await syncBookingGeomsForBatch(this.dataSource, batchId);

      const vehicles = await vehicleRepo.find({
        where: { status: 'AVAILABLE' },
        order: { license_plate: 'ASC' },
      });
      if (vehicles.length === 0)
        throw new BadRequestException('no AVAILABLE vehicles');

      const drivers = await userRepo.find({
        where: { role: 'DRIVER', status: 'ACTIVE' },
        order: { phone: 'ASC' },
      });
      if (drivers.length === 0)
        throw new BadRequestException('no ACTIVE drivers');

      const capacity = Math.max(1, vehicles[0]?.capacity ?? 10);
      const clusterMode =
        this.config.get<string>('DISPATCH_CLUSTER_MODE') ?? 'postgres';
      const epsM = Number(
        this.config.get<string>('DISPATCH_CLUSTER_EPS_M') ?? '500',
      );

      let nonEmpty: BookingEntity[][];
      if (clusterMode === 'postgres') {
        const labelMap = await this.spatialCluster.clusterPickupLabels(
          batchId,
          epsM,
          1,
        );
        if (labelMap && labelMap.size > 0) {
          nonEmpty = this.spatialCluster.groupByLabels(
            batchBookings,
            labelMap,
          );
        } else {
          nonEmpty = this.groupBookingsByKMeans(
            batchBookings,
            capacity,
            vehicles.length,
            drivers.length,
          );
        }
      } else {
        nonEmpty = this.groupBookingsByKMeans(
          batchBookings,
          capacity,
          vehicles.length,
          drivers.length,
        );
      }

      const finalGroups = this.splitOversizedGroups(nonEmpty, capacity);

      if (finalGroups.length > vehicles.length || finalGroups.length > drivers.length) {
        throw new BadRequestException(
          'Không đủ xe/tài xế cho số nhóm sau khi tách capacity — tăng xe hoặc giảm số khách',
        );
      }

      const createdRuns: TripRunEntity[] = [];
      const updatedBookings: BookingEntity[] = [];

      for (let g = 0; g < finalGroups.length; g++) {
        const group = finalGroups[g];
        const vehicle = vehicles[g];
        const driver = drivers[g];

        const run = runRepo.create({
          trip_batch_id: batchId,
          vehicle_id: vehicle.id,
          driver_id: driver.id,
          status: 'PENDING',
        });
        const savedRun = await runRepo.save(run);
        createdRuns.push(savedRun);

        const tour = await this.ortoolsVrp.orderPickupStops(group);

        for (let t = 0; t < tour.length; t++) {
          const b = group[tour[t]];
          b.trip_run_id = savedRun.id;
          b.pickup_order = t + 1;
          b.dropoff_order = t + 1;
          updatedBookings.push(await bookingRepo.save(b));
        }
      }

      batch.status = 'CLUSTERED';
      await batchRepo.save(batch);

      this.logger.log(
        `Clustered batch ${batchId}: mode=${clusterMode} runs=${finalGroups.length} eps_m=${epsM} (PostGIS ST_ClusterDBSCAN or k-means) + OSRM/NN via OrToolsVrpService`,
      );

      return {
        trip_batch: tripBatchToDomain(batch),
        created_trip_runs: createdRuns.map(tripRunToDomain),
        updated_bookings: updatedBookings.map(bookingToDomain),
      };
    });
  }

  private groupBookingsByKMeans(
    batchBookings: BookingEntity[],
    capacity: number,
    vehicleCount: number,
    driverCount: number,
  ): BookingEntity[][] {
    const kMeansK = Math.min(
      Math.ceil(batchBookings.length / capacity),
      vehicleCount,
      driverCount,
    );
    const points = batchBookings.map((b) => ({
      lng: b.pickup_lng,
      lat: b.pickup_lat,
    }));
    const labels = kMeansLabels(points, kMeansK);
    const groups: BookingEntity[][] = Array.from(
      { length: kMeansK },
      () => [],
    );
    for (let i = 0; i < batchBookings.length; i++) {
      const lab = Math.min(Math.max(labels[i], 0), kMeansK - 1);
      groups[lab].push(batchBookings[i]);
    }
    return groups.filter((g) => g.length > 0);
  }

  private splitOversizedGroups(
    groups: BookingEntity[][],
    capacity: number,
  ): BookingEntity[][] {
    const out: BookingEntity[][] = [];
    for (const g of groups) {
      if (g.length === 0) continue;
      if (g.length <= capacity) {
        out.push(g);
        continue;
      }
      for (let i = 0; i < g.length; i += capacity) {
        out.push(g.slice(i, i + capacity));
      }
    }
    return out;
  }

  /**
   * Sau khi điều hành kéo thả trên admin: chốt trip_run_id + thứ tự đón/trả.
   */
  async finalizeDispatch(
    batchId: string,
    items: Array<{
      booking_id: string;
      trip_run_id: string;
      pickup_order: number;
      dropoff_order: number;
    }>,
  ): Promise<{ updated: number }> {
    return this.dataSource.transaction(async (em) => {
      const batchRepo = em.getRepository(TripBatchEntity);
      const bookingRepo = em.getRepository(BookingEntity);
      const runRepo = em.getRepository(TripRunEntity);
      const vehicleRepo = em.getRepository(VehicleEntity);

      const batch = await batchRepo.findOne({ where: { id: batchId } });
      if (!batch) throw new BadRequestException('trip batch not found');
      if (batch.status !== 'CLUSTERED')
        throw new BadRequestException(
          'trip batch must be CLUSTERED before finalize',
        );

      const runs = await runRepo.find({ where: { trip_batch_id: batchId } });
      if (runs.length === 0)
        throw new BadRequestException('no trip runs for batch');
      const runIds = new Set(runs.map((r) => r.id));
      const vehicles = await vehicleRepo.find({
        where: { id: In(runs.map((r) => r.vehicle_id)) },
      });
      const capByRun = new Map<string, number>();
      for (const r of runs) {
        const v = vehicles.find((x) => x.id === r.vehicle_id);
        capByRun.set(r.id, v?.capacity ?? 99);
      }

      const byRun = new Map<string, number>();
      for (const it of items) {
        if (!runIds.has(it.trip_run_id))
          throw new BadRequestException('invalid trip_run_id');
        byRun.set(
          it.trip_run_id,
          (byRun.get(it.trip_run_id) ?? 0) + 1,
        );
      }
      for (const [runId, n] of byRun) {
        const cap = capByRun.get(runId) ?? 0;
        if (n > cap) {
          throw new BadRequestException(
            `capacity exceeded for trip run ${runId}`,
          );
        }
      }

      let updated = 0;
      for (const it of items) {
        const b = await bookingRepo.findOne({ where: { id: it.booking_id } });
        if (!b || b.trip_batch_id !== batchId)
          throw new BadRequestException('invalid booking_id');
        b.trip_run_id = it.trip_run_id;
        b.pickup_order = it.pickup_order;
        b.dropoff_order = it.dropoff_order;
        await bookingRepo.save(b);
        updated++;
      }

      for (const r of runs) {
        r.status = 'IN_PROGRESS';
        await runRepo.save(r);
      }

      this.logger.log(`Finalized dispatch for batch ${batchId}: ${updated} bookings`);
      return { updated };
    });
  }
}
