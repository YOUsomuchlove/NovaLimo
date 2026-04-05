import { Module } from '@nestjs/common';
import { BookingsModule } from '../bookings/bookings.module';
import { TripRunsModule } from '../trip-runs/trip-runs.module';
import { DispatchController } from './dispatch.controller';
import { DispatchService } from './dispatch.service';

@Module({
  imports: [BookingsModule, TripRunsModule],
  controllers: [DispatchController],
  providers: [DispatchService],
})
export class DispatchModule {}
