import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TripBatchEntity } from './trip-batch.entity';
import { TripRunEntity } from './trip-run.entity';

export type BookingStatusDb = 'WAITING' | 'PICKED_UP' | 'DROPPED_OFF' | 'CANCELLED';
export type PaymentMethodDb = 'COD' | 'MOMO' | 'ZALOPAY' | 'VNPAY';
export type PaymentStatusDb = 'PENDING' | 'PAID' | 'FAILED';

@Entity('bookings')
export class BookingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  trip_batch_id!: string;

  @ManyToOne(() => TripBatchEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_batch_id' })
  trip_batch!: TripBatchEntity;

  @Column('uuid', { nullable: true })
  trip_run_id!: string | null;

  @ManyToOne(() => TripRunEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'trip_run_id' })
  trip_run!: TripRunEntity | null;

  @Column({ type: 'varchar', length: 255 })
  passenger_name!: string;

  @Column({ type: 'varchar', length: 32 })
  passenger_phone!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  booker_name!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  booker_phone!: string | null;

  @Column({ type: 'text' })
  pickup_address!: string;

  @Column({ type: 'double precision' })
  pickup_lat!: number;

  @Column({ type: 'double precision' })
  pickup_lng!: number;

  @Column({ type: 'text' })
  dropoff_address!: string;

  @Column({ type: 'double precision' })
  dropoff_lat!: number;

  @Column({ type: 'double precision' })
  dropoff_lng!: number;

  @Column({ type: 'int', nullable: true })
  pickup_order!: number | null;

  @Column({ type: 'int', nullable: true })
  dropoff_order!: number | null;

  @Column({
    type: 'enum',
    enum: ['WAITING', 'PICKED_UP', 'DROPPED_OFF', 'CANCELLED'],
    default: 'WAITING',
  })
  status!: BookingStatusDb;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  seat_label!: string | null;

  @Column({ type: 'double precision', nullable: true })
  unit_price!: number | null;

  @Column({ type: 'double precision', nullable: true })
  total_amount!: number | null;

  @Column({
    type: 'enum',
    enum: ['COD', 'MOMO', 'ZALOPAY', 'VNPAY'],
    nullable: true,
  })
  payment_method!: PaymentMethodDb | null;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING',
  })
  payment_status!: PaymentStatusDb;
}
