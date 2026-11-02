import {
  BOOKING_SOURCES,
  BOOKING_STATUSES,
  type BookingSource,
  type BookingStatus,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PAYMENT_TXN_STATUSES,
  type PaymentMethod,
  type PaymentStatus,
  type PaymentTxnStatus,
  SEAT_TIERS,
  type SeatTier,
  TRIP_BATCH_STATUSES,
  TRIP_RUN_STATUSES,
  type TripBatchStatus,
  type TripRunStatus,
} from '@limousine-workspace/shared-types';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  type Relation,
} from 'typeorm';
import { BaseEntity, type GeoPoint, SoftDeleteEntity, geoPoint } from './base';
import type {
  RouteEntity,
  StopEntity,
  TimeSlotEntity,
  VehicleEntity,
  VehicleTypeEntity,
} from './fleet.entities';
import type { UserEntity } from './identity.entities';

/** One departure (route + time). Holds all bookings until dispatch splits them into runs. */
@Entity('trip_batches')
@Index(['route_id', 'departure_at'])
@Index('uq_trip_batches_slot_departure', ['time_slot_id', 'departure_at'], {
  unique: true,
  where: 'time_slot_id IS NOT NULL',
})
export class TripBatchEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 32 })
  code!: string;

  @Column('uuid')
  route_id!: string;

  @ManyToOne('RouteEntity', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'route_id' })
  route!: Relation<RouteEntity>;

  @Column('uuid', { nullable: true })
  time_slot_id!: string | null;

  @ManyToOne('TimeSlotEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'time_slot_id' })
  time_slot!: Relation<TimeSlotEntity> | null;

  @Index()
  @Column({ type: 'timestamptz' })
  departure_at!: Date;

  @Column({ type: 'timestamptz' })
  arrival_eta!: Date;

  @Column('uuid')
  vehicle_type_id!: string;

  @ManyToOne('VehicleTypeEntity', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vehicle_type_id' })
  vehicle_type!: Relation<VehicleTypeEntity>;

  /** Each seat label can be sold this many times (one per vehicle). */
  @Column({ type: 'int', default: 1 })
  planned_vehicles!: number;

  @Column({
    type: 'enum',
    enum: TRIP_BATCH_STATUSES,
    enumName: 'trip_batch_status',
    default: 'OPEN',
  })
  status!: TripBatchStatus;

  /** Online sales stop this many minutes before departure. */
  @Column({ type: 'int', default: 60 })
  sales_close_min!: number;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @OneToMany('TripRunEntity', 'trip_batch')
  runs?: Relation<TripRunEntity[]>;
}

/** One vehicle + driver executing part of a batch. */
@Entity('trip_runs')
export class TripRunEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 32 })
  code!: string;

  @Index()
  @Column('uuid')
  trip_batch_id!: string;

  @ManyToOne('TripBatchEntity', 'runs', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_batch_id' })
  trip_batch!: Relation<TripBatchEntity>;

  @Column('uuid')
  vehicle_id!: string;

  @ManyToOne('VehicleEntity', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle!: Relation<VehicleEntity>;

  @Index()
  @Column('uuid')
  driver_id!: string;

  @ManyToOne('UserEntity', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'driver_id' })
  driver!: Relation<UserEntity>;

  @Column({
    type: 'enum',
    enum: TRIP_RUN_STATUSES,
    enumName: 'trip_run_status',
    default: 'PENDING',
  })
  status!: TripRunStatus;

  @Column({ type: 'timestamptz', nullable: true })
  dispatched_at!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  started_at!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  finished_at!: Date | null;

  @Column({
    type: 'numeric',
    precision: 8,
    scale: 2,
    nullable: true,
    transformer: { to: (v) => v, from: (v) => (v === null ? null : Number(v)) },
  })
  planned_distance_km!: number | null;

  /** GeoJSON LineString of the planned route (OSRM), for maps. */
  @Column({ type: 'jsonb', nullable: true })
  route_geometry!: {
    type: 'LineString';
    coordinates: [number, number][];
  } | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;
}

@Entity('customers')
export class CustomerEntity extends SoftDeleteEntity {
  @Column({ type: 'varchar', length: 255 })
  full_name!: string;

  @Index({ unique: true, where: 'deleted_at IS NULL' })
  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  tags!: string[];
}

@Entity('bookings')
export class BookingEntity extends BaseEntity {
  /** Human code shown to customers: NL-XXXXXX */
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 16 })
  code!: string;

  @Index()
  @Column('uuid')
  trip_batch_id!: string;

  @ManyToOne('TripBatchEntity', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'trip_batch_id' })
  trip_batch!: Relation<TripBatchEntity>;

  @Index()
  @Column('uuid', { nullable: true })
  trip_run_id!: string | null;

  @ManyToOne('TripRunEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'trip_run_id' })
  trip_run!: Relation<TripRunEntity> | null;

  @Index()
  @Column('uuid', { nullable: true })
  customer_id!: string | null;

  @ManyToOne('CustomerEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'customer_id' })
  customer!: Relation<CustomerEntity> | null;

  /** Person who booked (and receives SMS); passengers are per seat. */
  @Column({ type: 'varchar', length: 255 })
  contact_name!: string;

  @Index()
  @Column({ type: 'varchar', length: 20 })
  contact_phone!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contact_email!: string | null;

  @Column('uuid', { nullable: true })
  pickup_stop_id!: string | null;

  @ManyToOne('StopEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'pickup_stop_id' })
  pickup_stop!: Relation<StopEntity> | null;

  @Column({ type: 'text' })
  pickup_address!: string;

  @Index({ spatial: true })
  @Column(geoPoint())
  pickup_point!: GeoPoint;

  @Column('uuid', { nullable: true })
  dropoff_stop_id!: string | null;

  @ManyToOne('StopEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'dropoff_stop_id' })
  dropoff_stop!: Relation<StopEntity> | null;

  @Column({ type: 'text' })
  dropoff_address!: string;

  @Index({ spatial: true })
  @Column(geoPoint())
  dropoff_point!: GeoPoint;

  @Column({ type: 'int', nullable: true })
  pickup_order!: number | null;

  @Column({ type: 'int', nullable: true })
  dropoff_order!: number | null;

  @Column({
    type: 'enum',
    enum: BOOKING_STATUSES,
    enumName: 'booking_status',
    default: 'PENDING_PAYMENT',
  })
  status!: BookingStatus;

  @Column({
    type: 'enum',
    enum: BOOKING_SOURCES,
    enumName: 'booking_source',
    default: 'WEB',
  })
  source!: BookingSource;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @Column({ type: 'int' })
  subtotal_vnd!: number;

  @Column({ type: 'int', default: 0 })
  discount_vnd!: number;

  @Column({ type: 'int' })
  total_vnd!: number;

  @Column({ type: 'enum', enum: PAYMENT_METHODS, enumName: 'payment_method' })
  payment_method!: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PAYMENT_STATUSES,
    enumName: 'payment_status',
    default: 'UNPAID',
  })
  payment_status!: PaymentStatus;

  /** Unpaid online bookings are cancelled after this time (seat released). */
  @Column({ type: 'timestamptz', nullable: true })
  payment_due_at!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  picked_up_at!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  dropped_off_at!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  cancelled_at!: Date | null;

  @Column({ type: 'text', nullable: true })
  cancel_reason!: string | null;

  @Column('uuid', { nullable: true })
  created_by_id!: string | null;

  @OneToMany('BookingSeatEntity', 'booking', { cascade: ['insert'] })
  seats?: Relation<BookingSeatEntity[]>;
}

/**
 * One sold seat. A label can be sold `planned_vehicles` times per batch (`seat_unit` 1..n);
 * the partial unique index makes double-selling impossible at the DB level.
 */
@Entity('booking_seats')
@Index(
  'uq_booking_seats_active',
  ['trip_batch_id', 'seat_label', 'seat_unit'],
  { unique: true, where: 'is_active' },
)
export class BookingSeatEntity extends BaseEntity {
  @Index()
  @Column('uuid')
  booking_id!: string;

  @ManyToOne('BookingEntity', 'seats', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking!: Relation<BookingEntity>;

  @Column('uuid')
  trip_batch_id!: string;

  @Column({ type: 'varchar', length: 8 })
  seat_label!: string;

  @Column({ type: 'int', default: 1 })
  seat_unit!: number;

  @Column({
    type: 'enum',
    enum: SEAT_TIERS,
    enumName: 'seat_tier',
    default: 'STANDARD',
  })
  tier!: SeatTier;

  @Column({ type: 'int' })
  price_vnd!: number;

  @Column({ type: 'varchar', length: 255 })
  passenger_name!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  passenger_phone!: string | null;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;
}

/** Short-lived reservation while the customer fills in details / pays. */
@Entity('seat_holds')
@Index('uq_seat_holds', ['trip_batch_id', 'seat_label', 'seat_unit'], {
  unique: true,
})
export class SeatHoldEntity extends BaseEntity {
  @Column('uuid')
  trip_batch_id!: string;

  @ManyToOne('TripBatchEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_batch_id' })
  trip_batch!: Relation<TripBatchEntity>;

  @Column({ type: 'varchar', length: 8 })
  seat_label!: string;

  @Column({ type: 'int', default: 1 })
  seat_unit!: number;

  /** Opaque token returned to the client that owns the hold. */
  @Index()
  @Column({ type: 'varchar', length: 64 })
  hold_token!: string;

  @Index()
  @Column({ type: 'timestamptz' })
  expires_at!: Date;
}

@Entity('payments')
export class PaymentEntity extends BaseEntity {
  @Index()
  @Column('uuid', { nullable: true })
  booking_id!: string | null;

  @ManyToOne('BookingEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'booking_id' })
  booking!: Relation<BookingEntity> | null;

  @Index()
  @Column('uuid', { nullable: true })
  cargo_id!: string | null;

  @Column({ type: 'enum', enum: PAYMENT_METHODS, enumName: 'payment_method' })
  method!: PaymentMethod;

  @Column({ type: 'int' })
  amount_vnd!: number;

  /** Transfer content customers must type (bank transfer) — matched by the webhook. */
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 32 })
  reference!: string;

  @Column({
    type: 'enum',
    enum: PAYMENT_TXN_STATUSES,
    enumName: 'payment_txn_status',
    default: 'PENDING',
  })
  status!: PaymentTxnStatus;

  @Index({ unique: true, where: 'provider_txn_id IS NOT NULL' })
  @Column({ type: 'varchar', length: 128, nullable: true })
  provider_txn_id!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  paid_at!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  expires_at!: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  raw!: Record<string, unknown> | null;

  @Column('uuid', { nullable: true })
  recorded_by_id!: string | null;
}
