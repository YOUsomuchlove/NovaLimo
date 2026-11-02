import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { BookingEntity } from '../entities/booking.entity';
import { CargoEntity } from '../entities/cargo.entity';
import { PermissionEntity } from '../entities/permission.entity';
import { RolePermissionEntity } from '../entities/role-permission.entity';
import { RoleEntity } from '../entities/role.entity';
import { TripBatchEntity } from '../entities/trip-batch.entity';
import { TripRunEntity } from '../entities/trip-run.entity';
import { UserRoleEntity } from '../entities/user-role.entity';
import { UserEntity } from '../entities/user.entity';
import { VehicleEntity } from '../entities/vehicle.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(VehicleEntity)
    private readonly vehicles: Repository<VehicleEntity>,
    @InjectRepository(TripBatchEntity)
    private readonly batches: Repository<TripBatchEntity>,
    @InjectRepository(TripRunEntity)
    private readonly runs: Repository<TripRunEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookings: Repository<BookingEntity>,
    @InjectRepository(CargoEntity)
    private readonly cargos: Repository<CargoEntity>,
    @InjectRepository(RoleEntity)
    private readonly roles: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissions: Repository<PermissionEntity>,
    @InjectRepository(RolePermissionEntity)
    private readonly rolePerms: Repository<RolePermissionEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoles: Repository<UserRoleEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.seed();
    } catch (e) {
      this.logger.warn(
        `Seed skipped or failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  private async seed(): Promise<void> {
    const demoHash = bcrypt.hashSync('demo', 10);
    let admin = await this.users.findOne({
      where: { phone: '0000000000', role: 'ADMIN' },
    });
    if (!admin) {
      admin = await this.users.save(
        this.users.create({
          full_name: 'Demo Admin',
          phone: '0000000000',
          password_hash: demoHash,
          role: 'ADMIN',
          status: 'ACTIVE',
        }),
      );
      this.logger.log('Seeded admin user 0000000000 / demo');
    }

    let driver = await this.users.findOne({
      where: { phone: '0900000000', role: 'DRIVER' },
    });
    if (!driver) {
      driver = await this.users.save(
        this.users.create({
          full_name: 'Demo Driver',
          phone: '0900000000',
          password_hash: demoHash,
          role: 'DRIVER',
          status: 'ACTIVE',
        }),
      );
      this.logger.log('Seeded driver user 0900000000 / demo');
    }

    if (!admin || !driver) return;

    const permSlugs = [
      'admin.read',
      'admin.write',
      'dispatch.assign',
      'cargo.update',
      'finance.read',
    ];
    const permRows: PermissionEntity[] = [];
    for (const slug of permSlugs) {
      let p = await this.permissions.findOne({ where: { slug } });
      if (!p) {
        p = await this.permissions.save(
          this.permissions.create({ slug, description: slug }),
        );
      }
      permRows.push(p);
    }

    let adminRole = await this.roles.findOne({ where: { slug: 'superadmin' } });
    if (!adminRole) {
      adminRole = await this.roles.save(
        this.roles.create({ slug: 'superadmin', name: 'Super admin' }),
      );
    }
    for (const p of permRows) {
      const exists = await this.rolePerms.findOne({
        where: { role_id: adminRole.id, permission_id: p.id },
      });
      if (!exists) {
        await this.rolePerms.save(
          this.rolePerms.create({ role_id: adminRole.id, permission_id: p.id }),
        );
      }
    }
    const ur = await this.userRoles.findOne({
      where: { user_id: admin.id, role_id: adminRole.id },
    });
    if (!ur) {
      await this.userRoles.save(
        this.userRoles.create({ user_id: admin.id, role_id: adminRole.id }),
      );
    }

    let v1 = await this.vehicles.findOne({
      where: { license_plate: '29A-12345' },
    });
    if (!v1) {
      v1 = await this.vehicles.save(
        this.vehicles.create({
          license_plate: '29A-12345',
          capacity: 9,
          status: 'AVAILABLE',
        }),
      );
    }
    let v2 = await this.vehicles.findOne({
      where: { license_plate: '29B-99999' },
    });
    if (!v2) {
      v2 = await this.vehicles.save(
        this.vehicles.create({
          license_plate: '29B-99999',
          capacity: 9,
          status: 'AVAILABLE',
        }),
      );
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);

    let batch = await this.batches.findOne({
      where: { route_name: 'Hà Nội → Nội Bài' },
    });
    if (!batch) {
      batch = await this.batches.save(
        this.batches.create({
          route_name: 'Hà Nội → Nội Bài',
          departure_time: tomorrow,
          status: 'OPEN',
          list_price_vnd: 350000,
          vehicle_capacity: 9,
        }),
      );
    } else {
      batch.list_price_vnd = batch.list_price_vnd ?? 350000;
      batch.vehicle_capacity = batch.vehicle_capacity ?? 9;
      await this.batches.save(batch);
    }

    let run = await this.runs.findOne({
      where: { trip_batch_id: batch.id, driver_id: driver.id },
    });
    if (!run) {
      run = await this.runs.save(
        this.runs.create({
          trip_batch_id: batch.id,
          vehicle_id: v1.id,
          driver_id: driver.id,
          status: 'PENDING',
        }),
      );
    }

    const bookingCount = await this.bookings.count({
      where: { trip_batch_id: batch.id },
    });
    if (bookingCount === 0) {
      await this.bookings.save(
        this.bookings.create({
          trip_batch_id: batch.id,
          trip_run_id: null,
          passenger_name: 'Nguyễn Văn A',
          passenger_phone: '0912345678',
          booker_name: null,
          booker_phone: null,
          pickup_address: 'Hoàn Kiếm, Hà Nội',
          pickup_lat: 21.0285,
          pickup_lng: 105.8542,
          dropoff_address: 'Sân bay Nội Bài',
          dropoff_lat: 21.2187,
          dropoff_lng: 105.8042,
          pickup_order: null,
          dropoff_order: null,
          status: 'WAITING',
          note: null,
          seat_label: 'A1',
          unit_price: 350000,
          total_amount: 350000,
          payment_method: 'COD',
          payment_status: 'PENDING',
        }),
      );
    }

    const cargoCount = await this.cargos.count();
    if (cargoCount === 0) {
      await this.cargos.save(
        this.cargos.create({
          trip_run_id: run.id,
          waybill_code: 'WB-DEMO-001',
          sender_info: { name: 'Gửi A', phone: '0900111222' },
          receiver_info: { name: 'Nhận B', phone: '0900333444' },
          pickup_lat: 21.03,
          pickup_lng: 105.85,
          dropoff_lat: 21.22,
          dropoff_lng: 105.8,
          status: 'PENDING',
        }),
      );
    }
  }
}
