import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from '../entities/booking.entity';
import { CargoEntity } from '../entities/cargo.entity';
import { TripRunEntity } from '../entities/trip-run.entity';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TripRunEntity, BookingEntity, CargoEntity]),
  ],
  controllers: [TripsController],
  providers: [TripsService],
})
export class TripsModule {}
