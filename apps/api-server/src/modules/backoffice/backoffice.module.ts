import { Module } from '@nestjs/common';
import { TripsModule } from '../trips/trips.module';
import {
  BackofficeController,
  BackofficePublicController,
} from './backoffice.controllers';
import { BackofficeService } from './backoffice.service';
import { GeocodeService } from './geocode.service';
import { ReportsService } from './reports.service';

@Module({
  imports: [TripsModule],
  controllers: [BackofficeController, BackofficePublicController],
  providers: [BackofficeService, ReportsService, GeocodeService],
})
export class BackofficeModule {}
