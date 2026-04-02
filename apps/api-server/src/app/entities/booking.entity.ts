import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'bookings' })
export class BookingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  trip_batch_id!: string;

  @Column({ type: 'uuid', nullable: true })
  trip_run_id!: string | null;

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

  /** PostGIS geography — đồng bộ từ pickup_lat/lng */
  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  pickup_geom!: string | null;

  @Column({ type: 'text' })
  dropoff_address!: string;

  @Column({ type: 'double precision' })
  dropoff_lat!: number;

  @Column({ type: 'double precision' })
  dropoff_lng!: number;

  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  dropoff_geom!: string | null;

  @Column({ type: 'int', nullable: true })
  pickup_order!: number | null;

  @Column({ type: 'int', nullable: true })
  dropoff_order!: number | null;

  @Column({ type: 'varchar', length: 32 })
  status!: 'WAITING' | 'PICKED_UP' | 'DROPPED_OFF' | 'CANCELLED';

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  seat_label!: string | null;

  @Column({ type: 'double precision', default: 0 })
  unit_price!: number;

  @Column({ type: 'double precision', default: 0 })
  total_amount!: number;

  @Column({ type: 'varchar', length: 16, nullable: true })
  payment_method!: 'COD' | 'MOMO' | 'ZALOPAY' | 'VNPAY' | null;

  @Column({ type: 'varchar', length: 16, default: 'PENDING' })
  payment_status!: 'PENDING' | 'PAID' | 'FAILED';
}
