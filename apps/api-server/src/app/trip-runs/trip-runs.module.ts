import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripRunEntity } from '../entities/trip-run.entity';
import { EventsModule } from '../events/events.module';
import { TripRunsController } from './trip-runs.controller';
import { TripRunsService } from './trip-runs.service';

@Module({
  imports: [TypeOrmModule.forFeature([TripRunEntity]), EventsModule],
  controllers: [TripRunsController],
  providers: [TripRunsService],
  exports: [TripRunsService],
})
export class TripRunsModule {}
