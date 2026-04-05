import { BadRequestException, Injectable } from '@nestjs/common';
import { BookingsService } from '../bookings/bookings.service';
import { TripRunsService } from '../trip-runs/trip-runs.service';

@Injectable()
export class DispatchService {
  constructor(
    private readonly bookings: BookingsService,
    private readonly runs: TripRunsService,
  ) {}

  async assignBooking(bookingId: string, tripRunId: string | null) {
    const booking = await this.bookings.findOne(bookingId);

    if (tripRunId === null) {
      return this.bookings.updateAdmin(bookingId, { trip_run_id: null });
    }

    const run = await this.runs.findEntity(tripRunId);
    if (run.trip_batch_id !== booking.trip_batch_id) {
      throw new BadRequestException(
        'trip_run must belong to the same trip_batch as the booking',
      );
    }
    return this.bookings.updateAdmin(bookingId, { trip_run_id: tripRunId });
  }
}
