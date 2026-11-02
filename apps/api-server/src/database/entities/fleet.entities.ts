import {
  STOP_KINDS,
  type SeatTier,
  type StopKind,
  VEHICLE_STATUSES,
  type VehicleStatus,
} from '@limousine-workspace/shared-types';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  type Relation,
} from 'typeorm';
import { BaseEntity, type GeoPoint, SoftDeleteEntity, geoPoint } from './base';

/** Seat plan: rows of cells; `null` = aisle. Same shape as shared-ui `SeatLayout.rows`. */
export type SeatLayoutJson = ({ label: string; tier: SeatTier } | null)[][];

@Entity('vehicle_types')
export class VehicleTypeEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 32 })
  code!: string;

  @Column({ type: 'varchar', length: 128 })
  name!: string;

  /** Sellable seats — must equal the number of cells in `seat_layout`. */
  @Column({ type: 'int' })
  capacity!: number;

  @Column({ type: 'jsonb' })
  seat_layout!: SeatLayoutJson;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text', nullable: true })
  image_url!: string | null;
}

@Entity('vehicles')
export class VehicleEntity extends SoftDeleteEntity {
  @Index({ unique: true, where: 'deleted_at IS NULL' })
  @Column({ type: 'varchar', length: 20 })
  license_plate!: string;

  @Column('uuid')
  vehicle_type_id!: string;

  @ManyToOne('VehicleTypeEntity', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vehicle_type_id' })
  vehicle_type!: Relation<VehicleTypeEntity>;

  @Column({
    type: 'enum',
    enum: VEHICLE_STATUSES,
    enumName: 'vehicle_status',
    default: 'AVAILABLE',
  })
  status!: VehicleStatus;

  @Column({ type: 'varchar', length: 64, nullable: true })
  brand!: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  model!: string | null;

  @Column({ type: 'int', nullable: true })
  year!: number | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  color!: string | null;

  @Column({ type: 'int', default: 0 })
  odometer_km!: number;

  @Column({ type: 'date', nullable: true })
  registration_expires_on!: string | null;

  @Column({ type: 'date', nullable: true })
  insurance_expires_on!: string | null;

  @Column({ type: 'date', nullable: true })
  next_maintenance_on!: string | null;

  @Column({ type: 'text', nullable: true })
  image_url!: string | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;
}

@Entity('routes')
export class RouteEntity extends SoftDeleteEntity {
  @Index({ unique: true, where: 'deleted_at IS NULL' })
  @Column({ type: 'varchar', length: 32 })
  code!: string;

  /** "Hà Nội → Quảng Ninh" */
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 128 })
  origin_name!: string;

  @Column({ type: 'varchar', length: 128 })
  destination_name!: string;

  @Column({ type: 'int', nullable: true })
  distance_km!: number | null;

  /** Typical door-to-door duration, used to compute arrival ETA. */
  @Column({ type: 'int' })
  duration_min!: number;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text', nullable: true })
  image_url!: string | null;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'int', default: 0 })
  sort_order!: number;
}

@Entity('stops')
export class StopEntity extends SoftDeleteEntity {
  @Index()
  @Column('uuid')
  route_id!: string;

  @ManyToOne('RouteEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route!: Relation<RouteEntity>;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text' })
  address!: string;

  @Index({ spatial: true })
  @Column(geoPoint())
  location!: GeoPoint;

  @Column({
    type: 'enum',
    enum: STOP_KINDS,
    enumName: 'stop_kind',
    default: 'BOTH',
  })
  kind!: StopKind;

  @Column({ type: 'int', default: 0 })
  sort_order!: number;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;
}

/** Recurring departure: generates `trip_batches` N days ahead. */
@Entity('time_slots')
export class TimeSlotEntity extends SoftDeleteEntity {
  @Index()
  @Column('uuid')
  route_id!: string;

  @ManyToOne('RouteEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route!: Relation<RouteEntity>;

  /** Local time Asia/Ho_Chi_Minh, "HH:mm" */
  @Column({ type: 'time' })
  departure_time!: string;

  /** 0 = Chủ nhật … 6 = Thứ bảy */
  @Column({ type: 'int', array: true, default: () => "'{0,1,2,3,4,5,6}'" })
  days_of_week!: number[];

  @Column('uuid')
  vehicle_type_id!: string;

  @ManyToOne('VehicleTypeEntity', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vehicle_type_id' })
  vehicle_type!: Relation<VehicleTypeEntity>;

  /** Vehicles planned per departure → seats on sale = capacity × planned_vehicles */
  @Column({ type: 'int', default: 1 })
  planned_vehicles!: number;

  @Column({ type: 'date', nullable: true })
  valid_from!: string | null;

  @Column({ type: 'date', nullable: true })
  valid_to!: string | null;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;
}

/** Highest `priority` matching rule wins (route + optional vehicle type + optional date window). */
@Entity('price_rules')
export class PriceRuleEntity extends SoftDeleteEntity {
  @Index()
  @Column('uuid')
  route_id!: string;

  @ManyToOne('RouteEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route!: Relation<RouteEntity>;

  @Column('uuid', { nullable: true })
  vehicle_type_id!: string | null;

  @ManyToOne('VehicleTypeEntity', { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicle_type_id' })
  vehicle_type!: Relation<VehicleTypeEntity> | null;

  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({ type: 'int' })
  base_price_vnd!: number;

  /** Added per seat with tier VIP */
  @Column({ type: 'int', default: 0 })
  vip_surcharge_vnd!: number;

  @Column({ type: 'date', nullable: true })
  valid_from!: string | null;

  @Column({ type: 'date', nullable: true })
  valid_to!: string | null;

  @Column({ type: 'int', default: 0 })
  priority!: number;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;
}
