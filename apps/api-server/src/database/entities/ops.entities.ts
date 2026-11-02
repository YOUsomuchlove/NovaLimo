import {
  CARGO_PAYERS,
  CARGO_SIZES,
  CARGO_STATUSES,
  CHAT_SENDER_ROLES,
  COD_SETTLEMENT_STATUSES,
  type CargoPayer,
  type CargoSize,
  type CargoStatus,
  type ChatSenderRole,
  type CodSettlementStatus,
  FINANCE_CATEGORIES,
  FINANCE_KINDS,
  type FinanceCategory,
  type FinanceKind,
  INCIDENT_KINDS,
  INCIDENT_STATUSES,
  type IncidentKind,
  type IncidentStatus,
  TICKET_KINDS,
  TICKET_STATUSES,
  type TicketKind,
  type TicketStatus,
} from '@limousine-workspace/shared-types';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity, type GeoPoint, geoPoint } from './base';
import type { RouteEntity } from './fleet.entities';
import type { UserEntity } from './identity.entities';
import type { TripBatchEntity, TripRunEntity } from './trip.entities';

/* ---------------- Cargo ---------------- */

@Entity('cargos')
export class CargoEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 20 })
  waybill_code!: string;

  @Column('uuid')
  route_id!: string;

  @ManyToOne('RouteEntity', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'route_id' })
  route!: Relation<RouteEntity>;

  @Index()
  @Column('uuid', { nullable: true })
  trip_batch_id!: string | null;

  @ManyToOne('TripBatchEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'trip_batch_id' })
  trip_batch!: Relation<TripBatchEntity> | null;

  @Index()
  @Column('uuid', { nullable: true })
  trip_run_id!: string | null;

  @ManyToOne('TripRunEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'trip_run_id' })
  trip_run!: Relation<TripRunEntity> | null;

  @Column({ type: 'varchar', length: 255 })
  sender_name!: string;

  @Index()
  @Column({ type: 'varchar', length: 20 })
  sender_phone!: string;

  @Column({ type: 'text' })
  pickup_address!: string;

  @Column(geoPoint())
  pickup_point!: GeoPoint;

  @Column({ type: 'varchar', length: 255 })
  receiver_name!: string;

  @Index()
  @Column({ type: 'varchar', length: 20 })
  receiver_phone!: string;

  @Column({ type: 'text' })
  dropoff_address!: string;

  @Column(geoPoint())
  dropoff_point!: GeoPoint;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'enum',
    enum: CARGO_SIZES,
    enumName: 'cargo_size',
    default: 'S',
  })
  size!: CargoSize;

  @Column({
    type: 'numeric',
    precision: 6,
    scale: 2,
    transformer: { to: (v) => v, from: (v) => Number(v) },
  })
  weight_kg!: number;

  @Column({ type: 'boolean', default: false })
  is_fragile!: boolean;

  @Column({ type: 'int', default: 0 })
  declared_value_vnd!: number;

  @Column({ type: 'int' })
  fee_vnd!: number;

  @Column({
    type: 'enum',
    enum: CARGO_PAYERS,
    enumName: 'cargo_payer',
    default: 'SENDER',
  })
  fee_payer!: CargoPayer;

  /** Cash the driver must collect from the receiver for the sender. */
  @Column({ type: 'int', default: 0 })
  cod_amount_vnd!: number;

  @Column({ type: 'timestamptz', nullable: true })
  cod_collected_at!: Date | null;

  @Index()
  @Column('uuid', { nullable: true })
  cod_settlement_id!: string | null;

  @Column({
    type: 'enum',
    enum: CARGO_STATUSES,
    enumName: 'cargo_status',
    default: 'CREATED',
  })
  status!: CargoStatus;

  @Column({ type: 'timestamptz', nullable: true })
  picked_up_at!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  delivered_at!: Date | null;

  @Column({ type: 'text', nullable: true })
  proof_photo_url!: string | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @Column('uuid', { nullable: true })
  created_by_id!: string | null;
}

@Entity('cod_settlements')
export class CodSettlementEntity extends BaseEntity {
  @Index()
  @Column('uuid')
  driver_id!: string;

  @ManyToOne('UserEntity', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'driver_id' })
  driver!: Relation<UserEntity>;

  @Column({ type: 'int' })
  amount_vnd!: number;

  @Column({ type: 'int' })
  cargo_count!: number;

  @Column({
    type: 'enum',
    enum: COD_SETTLEMENT_STATUSES,
    enumName: 'cod_settlement_status',
    default: 'PENDING',
  })
  status!: CodSettlementStatus;

  @Column('uuid', { nullable: true })
  confirmed_by_id!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  confirmed_at!: Date | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;
}

/* ---------------- Driver operations ---------------- */

@Entity('driver_shifts')
export class DriverShiftEntity extends BaseEntity {
  @Index()
  @Column('uuid')
  driver_id!: string;

  @ManyToOne('UserEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driver_id' })
  driver!: Relation<UserEntity>;

  @Column({ type: 'timestamptz' })
  started_at!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  ended_at!: Date | null;

  @Column(geoPoint({ nullable: true }))
  start_point!: GeoPoint | null;

  @Column(geoPoint({ nullable: true }))
  end_point!: GeoPoint | null;

  /** Checklist answers submitted at end of shift. */
  @Column({ type: 'jsonb', nullable: true })
  end_checklist!: Record<string, boolean> | null;

  @Column({ type: 'text', nullable: true })
  end_note!: string | null;
}

@Entity('driver_locations')
@Index(['driver_id', 'recorded_at'])
export class DriverLocationEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column('uuid')
  driver_id!: string;

  @Column('uuid', { nullable: true })
  trip_run_id!: string | null;

  @Column(geoPoint())
  point!: GeoPoint;

  @Column({ type: 'real', nullable: true })
  speed_kmh!: number | null;

  @Column({ type: 'real', nullable: true })
  heading!: number | null;

  @Column({ type: 'real', nullable: true })
  accuracy_m!: number | null;

  @Column({ type: 'timestamptz' })
  recorded_at!: Date;
}

/** Thread = one driver ↔ operations. */
@Entity('chat_messages')
@Index(['driver_id', 'created_at'])
export class ChatMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  driver_id!: string;

  @Column('uuid')
  sender_user_id!: string;

  @ManyToOne('UserEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_user_id' })
  sender!: Relation<UserEntity>;

  @Column({
    type: 'enum',
    enum: CHAT_SENDER_ROLES,
    enumName: 'chat_sender_role',
  })
  sender_role!: ChatSenderRole;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'timestamptz', nullable: true })
  read_at!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}

@Entity('notifications')
@Index(['user_id', 'created_at'])
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  user_id!: string;

  @Column({ type: 'varchar', length: 64 })
  kind!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'jsonb', nullable: true })
  data!: Record<string, unknown> | null;

  @Column({ type: 'timestamptz', nullable: true })
  read_at!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}

@Entity('incidents')
export class IncidentEntity extends BaseEntity {
  @Index()
  @Column('uuid')
  driver_id!: string;

  @ManyToOne('UserEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driver_id' })
  driver!: Relation<UserEntity>;

  @Column('uuid', { nullable: true })
  trip_run_id!: string | null;

  @Column({ type: 'enum', enum: INCIDENT_KINDS, enumName: 'incident_kind' })
  kind!: IncidentKind;

  @Column({ type: 'text' })
  description!: string;

  @Column(geoPoint({ nullable: true }))
  point!: GeoPoint | null;

  @Column({ type: 'text', nullable: true })
  photo_url!: string | null;

  @Column({
    type: 'enum',
    enum: INCIDENT_STATUSES,
    enumName: 'incident_status',
    default: 'OPEN',
  })
  status!: IncidentStatus;

  @Column('uuid', { nullable: true })
  handled_by_id!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  resolved_at!: Date | null;

  @Column({ type: 'text', nullable: true })
  resolution_note!: string | null;
}

/* ---------------- Back office ---------------- */

@Entity('finance_transactions')
@Index(['occurred_at'])
export class FinanceTransactionEntity extends BaseEntity {
  @Column({ type: 'enum', enum: FINANCE_KINDS, enumName: 'finance_kind' })
  kind!: FinanceKind;

  @Column({
    type: 'enum',
    enum: FINANCE_CATEGORIES,
    enumName: 'finance_category',
  })
  category!: FinanceCategory;

  /** Always positive; direction comes from `kind`. */
  @Column({ type: 'int' })
  amount_vnd!: number;

  @Column({ type: 'timestamptz' })
  occurred_at!: Date;

  @Column({ type: 'varchar', length: 32, nullable: true })
  reference_type!: string | null;

  @Column('uuid', { nullable: true })
  reference_id!: string | null;

  @Column({ type: 'text', nullable: true })
  memo!: string | null;

  @Column('uuid', { nullable: true })
  created_by_id!: string | null;
}

@Entity('support_tickets')
export class SupportTicketEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 16 })
  code!: string;

  @Column({ type: 'enum', enum: TICKET_KINDS, enumName: 'ticket_kind' })
  kind!: TicketKind;

  @Column({
    type: 'enum',
    enum: TICKET_STATUSES,
    enumName: 'ticket_status',
    default: 'NEW',
  })
  status!: TicketStatus;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 255 })
  subject!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column('uuid', { nullable: true })
  booking_id!: string | null;

  @Column('uuid', { nullable: true })
  assignee_id!: string | null;

  @Column({ type: 'text', nullable: true })
  internal_note!: string | null;
}

/** Key/value business settings edited from Admin › Cấu hình (COD policy, notification templates…). */
@Entity('settings')
export class SettingEntity {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  key!: string;

  @Column({ type: 'jsonb' })
  value!: unknown;

  @Column('uuid', { nullable: true })
  updated_by_id!: string | null;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
