import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogEntity } from '../entities/audit-log.entity';
import { BookingEntity } from '../entities/booking.entity';
import { CargoEntity } from '../entities/cargo.entity';
import { CustomerEntity } from '../entities/customer.entity';
import { DriverLocationEntity } from '../entities/driver-location.entity';
import { DriverShiftEntity } from '../entities/driver-shift.entity';
import { FinanceTransactionEntity } from '../entities/finance-transaction.entity';
import { PermissionEntity } from '../entities/permission.entity';
import { RolePermissionEntity } from '../entities/role-permission.entity';
import { RoleEntity } from '../entities/role.entity';
import { TripBatchEntity } from '../entities/trip-batch.entity';
import { TripRunEntity } from '../entities/trip-run.entity';
import { UserRoleEntity } from '../entities/user-role.entity';
import { UserEntity } from '../entities/user.entity';
import { VehicleEntity } from '../entities/vehicle.entity';
import { SeedService } from './seed.service';

const entities = [
  UserEntity,
  VehicleEntity,
  TripBatchEntity,
  TripRunEntity,
  BookingEntity,
  CargoEntity,
  DriverShiftEntity,
  DriverLocationEntity,
  CustomerEntity,
  FinanceTransactionEntity,
  RoleEntity,
  PermissionEntity,
  RolePermissionEntity,
  UserRoleEntity,
  AuditLogEntity,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        url: cfg.get<string>('DATABASE_URL'),
        autoLoadEntities: false,
        entities,
        synchronize: cfg.get<string>('TYPEORM_SYNCHRONIZE') === 'true',
        logging: cfg.get<string>('TYPEORM_LOGGING') === 'true',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [SeedService],
  exports: [TypeOrmModule, SeedService],
})
export class DatabaseModule {}
