import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverLocationEntity } from '../entities/driver-location.entity';
import { DriverShiftEntity } from '../entities/driver-shift.entity';
import { EventsModule } from '../events/events.module';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DriverShiftEntity, DriverLocationEntity]),
    EventsModule,
  ],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}
