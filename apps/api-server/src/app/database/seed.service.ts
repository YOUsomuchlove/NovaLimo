import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { TripBatchEntity } from '../entities/trip-batch.entity';
import { UserEntity } from '../entities/user.entity';
import { VehicleEntity } from '../entities/vehicle.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(VehicleEntity)
    private readonly vehicles: Repository<VehicleEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(TripBatchEntity)
    private readonly tripBatches: Repository<TripBatchEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    const vCount = await this.vehicles.count();
    if (vCount === 0) {
      await this.vehicles.save([
        { license_plate: '29B-12345', capacity: 10, status: 'AVAILABLE' },
        { license_plate: '29B-54321', capacity: 10, status: 'AVAILABLE' },
        { license_plate: '30A-22222', capacity: 10, status: 'AVAILABLE' },
      ]);
      this.logger.log('Seeded vehicles');
    }

    const uCount = await this.users.count();
    if (uCount === 0) {
      await this.users.save([
        {
          full_name: 'Admin',
          phone: '0000000000',
          password_hash: null,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
        {
          full_name: 'Driver 1',
          phone: '0900000001',
          password_hash: bcrypt.hashSync('demo', 10),
          role: 'DRIVER',
          status: 'ACTIVE',
        },
        {
          full_name: 'Driver 2',
          phone: '0900000002',
          password_hash: bcrypt.hashSync('demo', 10),
          role: 'DRIVER',
          status: 'ACTIVE',
        },
        {
          full_name: 'Driver 3',
          phone: '0900000003',
          password_hash: bcrypt.hashSync('demo', 10),
          role: 'DRIVER',
          status: 'ACTIVE',
        },
      ]);
      this.logger.log('Seeded users');
    }

    const bCount = await this.tripBatches.count();
    if (bCount === 0) {
      await this.tripBatches.save({
        route_name: 'Hà Nội - Quảng Ninh',
        departure_time: new Date(),
        status: 'OPEN',
      });
      this.logger.log('Seeded trip batch');
    }
  }
}
