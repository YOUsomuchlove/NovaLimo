import {
  OTP_PURPOSES,
  type OtpPurpose,
  USER_KINDS,
  USER_STATUSES,
  type UserKind,
  type UserStatus,
} from '@limousine-workspace/shared-types';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { BaseEntity, SoftDeleteEntity } from './base';
import type { VehicleEntity } from './fleet.entities';

@Entity('users')
export class UserEntity extends SoftDeleteEntity {
  @Column({ type: 'varchar', length: 255 })
  full_name!: string;

  @Index({ unique: true, where: 'deleted_at IS NULL' })
  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string | null;

  /** Never selected by default — load explicitly with `addSelect` for login. */
  @Column({ type: 'varchar', length: 255, select: false })
  password_hash!: string;

  @Column({ type: 'enum', enum: USER_KINDS, enumName: 'user_kind' })
  kind!: UserKind;

  @Column({
    type: 'enum',
    enum: USER_STATUSES,
    enumName: 'user_status',
    default: 'ACTIVE',
  })
  status!: UserStatus;

  @Column({ type: 'text', nullable: true })
  avatar_url!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  last_login_at!: Date | null;

  @Column({ type: 'int', default: 0 })
  failed_login_count!: number;

  @Column({ type: 'timestamptz', nullable: true })
  locked_until!: Date | null;

  @OneToOne('DriverProfileEntity', 'user')
  driver_profile?: Relation<DriverProfileEntity> | null;
}

@Entity('driver_profiles')
export class DriverProfileEntity {
  @PrimaryColumn('uuid')
  user_id!: string;

  @OneToOne('UserEntity', 'driver_profile', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: Relation<UserEntity>;

  @Column({ type: 'varchar', length: 32, nullable: true })
  license_number!: string | null;

  @Column({ type: 'varchar', length: 8, nullable: true })
  license_class!: string | null;

  @Column({ type: 'date', nullable: true })
  license_expires_on!: string | null;

  @Column({ type: 'date', nullable: true })
  date_of_birth!: string | null;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emergency_contact!: string | null;

  @Column('uuid', { nullable: true })
  default_vehicle_id!: string | null;

  @ManyToOne('VehicleEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'default_vehicle_id' })
  default_vehicle!: Relation<VehicleEntity> | null;

  @Column({ type: 'date', nullable: true })
  hired_on!: string | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;
}

@Entity('refresh_tokens')
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid')
  user_id!: string;

  @ManyToOne('UserEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: Relation<UserEntity>;

  /** sha256 of the opaque token — the token itself is never stored. */
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  token_hash!: string;

  @Column({ type: 'timestamptz' })
  expires_at!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revoked_at!: Date | null;

  @Column('uuid', { nullable: true })
  replaced_by_id!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  user_agent!: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  ip!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}

@Entity('roles')
export class RoleEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  slug!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  /** System roles (superadmin) cannot be edited or deleted. */
  @Column({ type: 'boolean', default: false })
  is_system!: boolean;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  permissions!: string[];
}

@Entity('user_roles')
export class UserRoleEntity {
  @PrimaryColumn('uuid')
  user_id!: string;

  @PrimaryColumn('uuid')
  role_id!: string;

  @ManyToOne('UserEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: Relation<UserEntity>;

  @ManyToOne('RoleEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role!: Relation<RoleEntity>;
}

@Entity('audit_logs')
@Index(['resource', 'resource_id'])
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid', { nullable: true })
  actor_user_id!: string | null;

  @ManyToOne('UserEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actor_user_id' })
  actor!: Relation<UserEntity> | null;

  /** e.g. `POST /api/admin/vehicles` */
  @Column({ type: 'varchar', length: 255 })
  action!: string;

  @Column({ type: 'varchar', length: 64 })
  resource!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  resource_id!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  payload!: Record<string, unknown> | null;

  @Column({ type: 'int' })
  status_code!: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  ip!: string | null;

  @Index()
  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}

@Entity('otp_codes')
@Index(['phone', 'purpose'])
export class OtpCodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  @Column({ type: 'enum', enum: OTP_PURPOSES, enumName: 'otp_purpose' })
  purpose!: OtpPurpose;

  @Column({ type: 'varchar', length: 64 })
  code_hash!: string;

  @Column({ type: 'timestamptz' })
  expires_at!: Date;

  @Column({ type: 'int', default: 0 })
  attempts!: number;

  @Column({ type: 'timestamptz', nullable: true })
  consumed_at!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}

@Entity('push_tokens')
export class PushTokenEntity extends BaseEntity {
  @Index()
  @Column('uuid')
  user_id!: string;

  @ManyToOne('UserEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: Relation<UserEntity>;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  token!: string;

  @Column({ type: 'varchar', length: 16 })
  platform!: string;
}
