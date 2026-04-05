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
}
