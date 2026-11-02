import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type TripBatchStatusDb = 'OPEN' | 'CLUSTERED' | 'COMPLETED';

@Entity('trip_batches')
export class TripBatchEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 512 })
  route_name!: string;

  @Column({ type: 'timestamptz' })
  departure_time!: Date;

  @Column({
    type: 'enum',
    enum: ['OPEN', 'CLUSTERED', 'COMPLETED'],
    default: 'OPEN',
  })
  status!: TripBatchStatusDb;

  /** Giá vé gợi ý trên web đặt vé (VND / ghế hoặc tổng tùy nghiệp vụ — hiện dùng cho 1 ghế). */
  @Column({ type: 'int', default: 350000 })
  list_price_vnd!: number;

  @Column({ type: 'int', default: 9 })
  vehicle_capacity!: number;
}
