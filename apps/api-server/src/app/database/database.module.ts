import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from '../entities/booking.entity';
import { CargoEntity } from '../entities/cargo.entity';
import { DriverLocationEntity } from '../entities/driver-location.entity';
import { DriverShiftEntity } from '../entities/driver-shift.entity';
import { TripBatchEntity } from '../entities/trip-batch.entity';
import { TripRunEntity } from '../entities/trip-run.entity';
import { UserEntity } from '../entities/user.entity';
import { VehicleEntity } from '../entities/vehicle.entity';
import { DatabaseInitService } from './database-init.service';
import { SeedService } from './seed.service';

const entities = [
  VehicleEntity,
  UserEntity,
  TripBatchEntity,
  TripRunEntity,
  BookingEntity,
  CargoEntity,
  DriverShiftEntity,
  DriverLocationEntity,
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url:
          config.get<string>('DATABASE_URL') ??
          'postgresql://novalimo:novalimo@localhost:5432/novalimo',
        entities,
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        logging: config.get<string>('TYPEORM_LOGGING') === 'true',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [DatabaseInitService, SeedService],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
