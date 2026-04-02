import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import type { Booking, TripBatch, TripRun } from '@limousine-workspace/shared-types';
import type { DispatchBoardResult } from './trip-batches.service';
import { TripBatchesService } from './trip-batches.service';

type ClusterResult = {
  trip_batch: TripBatch;
  created_trip_runs: TripRun[];
  updated_bookings: Booking[];
};

@Controller('trip-batches')
export class TripBatchesController {
  constructor(private readonly tripBatches: TripBatchesService) {}

  @Get()
  list(): Promise<TripBatch[]> {
    return this.tripBatches.list();
  }

  @Get(':id/dispatch-board')
  dispatchBoard(@Param('id') id: string): Promise<DispatchBoardResult> {
    return this.tripBatches.getDispatchBoard(id);
  }

  @Post(':id/cluster')
  cluster(@Param('id') id: string): Promise<ClusterResult> {
    return this.tripBatches.cluster(id);
  }

  @Post(':id/finalize-dispatch')
  finalizeDispatch(
    @Param('id') id: string,
    @Body()
    body: {
      items: Array<{
        booking_id: string;
        trip_run_id: string;
        pickup_order: number;
        dropoff_order: number;
      }>;
    },
  ): Promise<{ updated: number }> {
    return this.tripBatches.finalizeDispatch(id, body.items ?? []);
  }
}
