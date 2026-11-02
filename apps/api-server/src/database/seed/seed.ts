import { PERMISSIONS } from '@limousine-workspace/shared-types';
import * as bcrypt from 'bcryptjs';
import type { DataSource, EntityManager } from 'typeorm';
import { generateTripBatches } from '../../modules/schedule/batch-generator';
import {
  DriverProfileEntity,
  PriceRuleEntity,
  RoleEntity,
  RouteEntity,
  type SeatLayoutJson,
  SettingEntity,
  StopEntity,
  TimeSlotEntity,
  UserEntity,
  UserRoleEntity,
  VehicleEntity,
  VehicleTypeEntity,
  toPoint,
} from '../entities';
import { DEFAULT_SETTINGS } from './default-settings';

const V = (label: string) => ({ label, tier: 'VIP' as const });
const S = (label: string) => ({ label, tier: 'STANDARD' as const });

export const SEAT_LAYOUT_9: SeatLayoutJson = [
  [V('A1'), null, V('A2')],
  [V('B1'), null, V('B2')],
  [S('C1'), S('C2'), S('C3')],
  [S('D1'), null, S('D2')],
];

export const SEAT_LAYOUT_12: SeatLayoutJson = [
  [V('A1'), null, V('A2')],
  [V('B1'), null, V('B2')],
  [S('C1'), S('C2'), S('C3')],
  [S('D1'), null, S('D2')],
  [S('E1'), S('E2'), S('E3')],
];

const ROLES: {
  slug: string;
  name: string;
  description: string;
  permissions: string[];
  is_system?: boolean;
}[] = [
  {
    slug: 'superadmin',
    name: 'Quản trị hệ thống',
    description: 'Toàn quyền',
    permissions: [...PERMISSIONS],
    is_system: true,
  },
  {
    slug: 'dispatcher',
    name: 'Điều hành',
    description: 'Điều phối chuyến, quản lý vé và đội xe',
    permissions: [
      'dashboard.view',
      'booking.read',
      'booking.write',
      'dispatch.manage',
      'trip.read',
      'trip.write',
      'cargo.read',
      'cargo.write',
      'fleet.read',
      'driver.read',
      'customer.read',
      'support.manage',
    ],
  },
  {
    slug: 'accountant',
    name: 'Kế toán',
    description: 'Tài chính, đối soát COD, báo cáo',
    permissions: [
      'dashboard.view',
      'booking.read',
      'cargo.read',
      'cod.reconcile',
      'finance.read',
      'finance.write',
      'report.view',
      'customer.read',
    ],
  },
  {
    slug: 'customer_service',
    name: 'Chăm sóc khách hàng',
    description: 'Tổng đài, đặt vé hộ, xử lý yêu cầu',
    permissions: [
      'dashboard.view',
      'booking.read',
      'booking.write',
      'trip.read',
      'cargo.read',
      'customer.read',
      'customer.write',
      'support.manage',
    ],
  },
];

async function upsertBy<T extends object>(
  m: EntityManager,
  entity: new () => T,
  where: Partial<T>,
  data: Partial<T>,
): Promise<T> {
  const repo = m.getRepository(entity);
  const existing = await repo.findOne({ where: where as never });
  if (existing) return existing;
  return repo.save(repo.create({ ...where, ...data } as T));
}

/**
 * Idempotent dev/staging seed: reference data (roles, vehicle types, routes, stops, slots, prices,
 * settings), demo staff/drivers/vehicles and trip batches for the next 7 days.
 */
export async function runSeed(ds: DataSource): Promise<void> {
  await ds.transaction(async (m) => {
    /* roles */
    const roles: Record<string, RoleEntity> = {};
    for (const r of ROLES)
      roles[r.slug] = await upsertBy(m, RoleEntity, { slug: r.slug }, r);

    /* staff + drivers (dev passwords) */
    const staffPw = bcrypt.hashSync(
      process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345',
      10,
    );
    const driverPw = bcrypt.hashSync(
      process.env.SEED_DRIVER_PASSWORD ?? 'Driver@12345',
      10,
    );
    const staff = [
      {
        phone: '0900000001',
        full_name: 'Quản trị NovaLimo',
        role: 'superadmin',
        email: 'admin@novalimo.vn',
      },
      {
        phone: '0900000002',
        full_name: 'Trần Điều Hành',
        role: 'dispatcher',
        email: 'dieuhanh@novalimo.vn',
      },
      {
        phone: '0900000003',
        full_name: 'Lê Kế Toán',
        role: 'accountant',
        email: 'ketoan@novalimo.vn',
      },
      {
        phone: '0900000004',
        full_name: 'Phạm Chăm Sóc',
        role: 'customer_service',
        email: 'cskh@novalimo.vn',
      },
    ];
    for (const s of staff) {
      const u = await upsertBy(
        m,
        UserEntity,
        { phone: s.phone },
        {
          full_name: s.full_name,
          email: s.email,
          kind: 'STAFF',
          password_hash: staffPw,
        },
      );
      await m
        .getRepository(UserRoleEntity)
        .upsert({ user_id: u.id, role_id: roles[s.role].id }, [
          'user_id',
          'role_id',
        ]);
    }

    /* vehicle types */
    const vt9 = await upsertBy(
      m,
      VehicleTypeEntity,
      { code: 'LIMO9' },
      {
        name: 'Limousine 9 chỗ',
        capacity: 9,
        seat_layout: SEAT_LAYOUT_9,
        description: 'Ford Transit / Dcar President, ghế massage',
      },
    );
    const vt12 = await upsertBy(
      m,
      VehicleTypeEntity,
      { code: 'LIMO12' },
      {
        name: 'Limousine 12 chỗ',
        capacity: 12,
        seat_layout: SEAT_LAYOUT_12,
        description: 'Hyundai Solati Limousine',
      },
    );

    /* vehicles */
    const vehicles = [
      {
        license_plate: '29B-123.45',
        vt: vt9,
        brand: 'Ford',
        model: 'Transit Dcar',
        year: 2024,
        color: 'Đen',
      },
      {
        license_plate: '29B-678.90',
        vt: vt9,
        brand: 'Ford',
        model: 'Transit Dcar',
        year: 2023,
        color: 'Đen',
      },
      {
        license_plate: '29B-246.80',
        vt: vt12,
        brand: 'Hyundai',
        model: 'Solati',
        year: 2024,
        color: 'Trắng',
      },
      {
        license_plate: '29B-135.79',
        vt: vt9,
        brand: 'Ford',
        model: 'Transit Dcar',
        year: 2022,
        color: 'Xám',
      },
    ];
    const vehicleRows: VehicleEntity[] = [];
    for (const v of vehicles) {
      vehicleRows.push(
        await upsertBy(
          m,
          VehicleEntity,
          { license_plate: v.license_plate },
          {
            vehicle_type_id: v.vt.id,
            brand: v.brand,
            model: v.model,
            year: v.year,
            color: v.color,
            odometer_km: 42_000,
          },
        ),
      );
    }

    const drivers = [
      {
        phone: '0911000001',
        full_name: 'Nguyễn Văn Tài',
        license: 'B2-0123456',
      },
      {
        phone: '0911000002',
        full_name: 'Hoàng Minh Đức',
        license: 'D-0456789',
      },
      { phone: '0911000003', full_name: 'Vũ Quốc Hùng', license: 'D-0789123' },
    ];
    for (const [i, d] of drivers.entries()) {
      const u = await upsertBy(
        m,
        UserEntity,
        { phone: d.phone },
        { full_name: d.full_name, kind: 'DRIVER', password_hash: driverPw },
      );
      await upsertBy(
        m,
        DriverProfileEntity,
        { user_id: u.id },
        {
          license_number: d.license,
          license_class: 'D',
          license_expires_on: '2030-12-31',
          default_vehicle_id: vehicleRows[i]?.id ?? null,
          hired_on: '2024-03-01',
        },
      );
    }

    /* routes, stops, slots, prices */
    const network = [
      {
        code: 'HNQN',
        name: 'Hà Nội → Hạ Long',
        origin_name: 'Hà Nội',
        destination_name: 'Hạ Long, Quảng Ninh',
        distance_km: 165,
        duration_min: 150,
        price: 290_000,
        vt: vt9,
        times: ['06:00', '08:00', '10:00', '13:00', '15:00', '17:30'],
        stops: [
          {
            name: 'Nhà hát Lớn',
            address: '1 Tràng Tiền, Hoàn Kiếm, Hà Nội',
            lat: 21.0245,
            lng: 105.8576,
            kind: 'PICKUP',
          },
          {
            name: 'Royal City',
            address: '72A Nguyễn Trãi, Thanh Xuân, Hà Nội',
            lat: 21.0021,
            lng: 105.8154,
            kind: 'PICKUP',
          },
          {
            name: 'Times City',
            address: '458 Minh Khai, Hai Bà Trưng, Hà Nội',
            lat: 20.9954,
            lng: 105.8681,
            kind: 'PICKUP',
          },
          {
            name: 'Bãi Cháy',
            address: 'Đường Hạ Long, Bãi Cháy, Hạ Long',
            lat: 20.9555,
            lng: 107.0457,
            kind: 'DROPOFF',
          },
          {
            name: 'Tuần Châu',
            address: 'Khu du lịch Tuần Châu, Hạ Long',
            lat: 20.9306,
            lng: 106.9937,
            kind: 'DROPOFF',
          },
        ],
      },
      {
        code: 'HNNB',
        name: 'Hà Nội → Sân bay Nội Bài',
        origin_name: 'Hà Nội',
        destination_name: 'Sân bay Nội Bài',
        distance_km: 30,
        duration_min: 50,
        price: 150_000,
        vt: vt12,
        times: ['05:00', '07:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
        stops: [
          {
            name: 'Hồ Gươm',
            address: 'Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội',
            lat: 21.0285,
            lng: 105.8542,
            kind: 'PICKUP',
          },
          {
            name: 'Keangnam',
            address: 'Phạm Hùng, Nam Từ Liêm, Hà Nội',
            lat: 21.0172,
            lng: 105.7839,
            kind: 'PICKUP',
          },
          {
            name: 'Nhà ga T1',
            address: 'Ga quốc nội T1, Sân bay Nội Bài',
            lat: 21.2142,
            lng: 105.8025,
            kind: 'DROPOFF',
          },
          {
            name: 'Nhà ga T2',
            address: 'Ga quốc tế T2, Sân bay Nội Bài',
            lat: 21.2187,
            lng: 105.8042,
            kind: 'DROPOFF',
          },
        ],
      },
      {
        code: 'HNHP',
        name: 'Hà Nội → Hải Phòng',
        origin_name: 'Hà Nội',
        destination_name: 'Hải Phòng',
        distance_km: 120,
        duration_min: 120,
        price: 220_000,
        vt: vt9,
        times: ['06:30', '09:30', '14:00', '17:00'],
        stops: [
          {
            name: 'Mỹ Đình',
            address: '20 Phạm Hùng, Nam Từ Liêm, Hà Nội',
            lat: 21.0287,
            lng: 105.7781,
            kind: 'PICKUP',
          },
          {
            name: 'Long Biên',
            address: 'Ngọc Lâm, Long Biên, Hà Nội',
            lat: 21.0453,
            lng: 105.8749,
            kind: 'PICKUP',
          },
          {
            name: 'Lạch Tray',
            address: 'Lạch Tray, Ngô Quyền, Hải Phòng',
            lat: 20.8466,
            lng: 106.6941,
            kind: 'DROPOFF',
          },
        ],
      },
    ] as const;

    for (const [i, r] of network.entries()) {
      const route = await upsertBy(
        m,
        RouteEntity,
        { code: r.code },
        {
          name: r.name,
          origin_name: r.origin_name,
          destination_name: r.destination_name,
          distance_km: r.distance_km,
          duration_min: r.duration_min,
          sort_order: i,
        },
      );
      for (const [j, s] of r.stops.entries()) {
        await upsertBy(
          m,
          StopEntity,
          { route_id: route.id, name: s.name },
          {
            address: s.address,
            location: toPoint(s.lat, s.lng),
            kind: s.kind,
            sort_order: j,
          },
        );
      }
      for (const t of r.times) {
        await upsertBy(
          m,
          TimeSlotEntity,
          { route_id: route.id, departure_time: `${t}:00` },
          {
            vehicle_type_id: r.vt.id,
            planned_vehicles: r.code === 'HNNB' ? 1 : 2,
          },
        );
      }
      await upsertBy(
        m,
        PriceRuleEntity,
        { route_id: route.id, name: 'Giá tiêu chuẩn' },
        { base_price_vnd: r.price, vip_surcharge_vnd: 50_000, priority: 0 },
      );
    }

    /* settings */
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await m
        .getRepository(SettingEntity)
        .upsert(
          { key, value },
          { conflictPaths: ['key'], skipUpdateIfNoValuesChanged: true },
        );
    }

    const created = await generateTripBatches(m, { days: 7 });
    console.log(`  · trip batches created: ${created}`);
  });
}
