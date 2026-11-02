import { Module } from '@nestjs/common';
import { BookingModule } from '../booking/booking.module';
import { CommsService } from './comms.service';
import { DriverService } from './driver.service';
import {
  CommsAdminController,
  DriverAppController,
  RunsAdminController,
} from './ops.controllers';
import { RunsService } from './runs.service';

@Module({
  imports: [BookingModule],
  controllers: [RunsAdminController, CommsAdminController, DriverAppController],
  providers: [RunsService, DriverService, CommsService],
  exports: [RunsService],
})
export class OpsModule {}
