import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from '../entities/booking.entity';
import { TripBatchEntity } from '../entities/trip-batch.entity';
import { TripRunEntity } from '../entities/trip-run.entity';
import { VehicleEntity } from '../entities/vehicle.entity';
import { AdminController } from './admin.controller';
import { AdminUploadsController } from './admin-uploads.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TripBatchEntity,
      BookingEntity,
      VehicleEntity,
      TripRunEntity,
    ]),
  ],
  controllers: [AdminController, AdminUploadsController],
  providers: [AdminService],
})
export class AdminModule {}
