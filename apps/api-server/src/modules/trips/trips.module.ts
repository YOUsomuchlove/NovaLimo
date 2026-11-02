import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { SeatAvailabilityService } from './seat-availability.service';
import {
  TripsAdminController,
  TripsPublicController,
} from './trips.controller';
import { TripsService } from './trips.service';

@Module({
  imports: [CatalogModule],
  controllers: [TripsPublicController, TripsAdminController],
  providers: [TripsService, SeatAvailabilityService],
  exports: [TripsService, SeatAvailabilityService],
})
export class TripsModule {}
