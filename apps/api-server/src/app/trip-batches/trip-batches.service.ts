import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import type { Booking, TripBatch, TripRun } from '@limousine-workspace/shared-types';
import { BookingEntity } from '../entities/booking.entity';
import { TripBatchEntity } from '../entities/trip-batch.entity';
import { TripRunEntity } from '../entities/trip-run.entity';
import { VehicleEntity } from '../entities/vehicle.entity';
import type { ClusterResult } from '../dispatch/dispatch.service';
import { DispatchService } from '../dispatch/dispatch.service';
import { EventsGateway } from '../events/events.gateway';
import {
  bookingToDomain,
  tripBatchToDomain,
  tripRunToDomain,
} from '../mappers/to-domain';

export type DispatchBoardRow = {
  trip_run: TripRun;
  vehicle_capacity: number;
  bookings: Booking[];
};

export type DispatchBoardResult = {
  trip_batch: TripBatch;
  waiting: Booking[];
  runs: DispatchBoardRow[];
};

@Injectable()
export class TripBatchesService {
  constructor(
    @InjectRepository(TripBatchEntity)
    private readonly tripBatches: Repository<TripBatchEntity>,
    @InjectRepository(TripRunEntity)
    private readonly tripRuns: Repository<TripRunEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookings: Repository<BookingEntity>,
    @InjectRepository(VehicleEntity)
    private readonly vehicles: Repository<VehicleEntity>,
    private readonly dispatch: DispatchService,
    private readonly events: EventsGateway,
  ) {}

  async list(): Promise<TripBatch[]> {
    const rows = await this.tripBatches.find({
      order: { departure_time: 'DESC' },
    });
    return rows.map(tripBatchToDomain);
  }

  async getDispatchBoard(batchId: string): Promise<DispatchBoardResult> {
    const batch = await this.tripBatches.findOne({ where: { id: batchId } });
    if (!batch) throw new NotFoundException('trip batch not found');

    const runs = await this.tripRuns.find({
      where: { trip_batch_id: batchId },
      order: { id: 'ASC' },
    });
    const waitingRows = await this.bookings.find({
      where: { trip_batch_id: batchId, trip_run_id: IsNull() },
      order: { id: 'ASC' },
    });

    const rows: DispatchBoardRow[] = [];
    for (const run of runs) {
      const veh = await this.vehicles.findOne({ where: { id: run.vehicle_id } });
      const bs = await this.bookings.find({
        where: { trip_run_id: run.id },
        order: { pickup_order: 'ASC' },
      });
      rows.push({
        trip_run: tripRunToDomain(run),
        vehicle_capacity: veh?.capacity ?? 0,
        bookings: bs.map(bookingToDomain),
      });
    }

    return {
      trip_batch: tripBatchToDomain(batch),
      waiting: waitingRows.map(bookingToDomain),
      runs: rows,
    };
  }

  async cluster(id: string): Promise<ClusterResult> {
    const result = await this.dispatch.clusterTripBatch(id);
    this.events.emitTripBatchUpdated(id, result);
    return result;
  }

  async finalizeDispatch(
    batchId: string,
    items: Array<{
      booking_id: string;
      trip_run_id: string;
      pickup_order: number;
      dropoff_order: number;
    }>,
  ): Promise<{ updated: number }> {
    const result = await this.dispatch.finalizeDispatch(batchId, items);
    this.events.emitTripBatchUpdated(batchId, { type: 'finalize', ...result });
    return result;
  }
}
