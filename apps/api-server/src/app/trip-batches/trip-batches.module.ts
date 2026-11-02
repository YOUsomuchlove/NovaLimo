import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from '../entities/booking.entity';
import { TripBatchEntity } from '../entities/trip-batch.entity';
import { EventsModule } from '../events/events.module';
import { TripBatchesController } from './trip-batches.controller';
import { TripBatchesService } from './trip-batches.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TripBatchEntity, BookingEntity]),
    EventsModule,
  ],
  controllers: [TripBatchesController],
  providers: [TripBatchesService],
  exports: [TripBatchesService],
})
export class TripBatchesModule {}
