import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'trip_batches' })
export class TripBatchEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  route_name!: string;

  @Column({ type: 'timestamptz' })
  departure_time!: Date;

  @Column({ type: 'varchar', length: 32 })
  status!: 'OPEN' | 'CLUSTERED' | 'COMPLETED';
}
