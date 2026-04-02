import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'trip_runs' })
export class TripRunEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  trip_batch_id!: string;

  @Column({ type: 'uuid' })
  vehicle_id!: string;

  @Column({ type: 'uuid' })
  driver_id!: string;

  @Column({ type: 'varchar', length: 32 })
  status!: 'PENDING' | 'IN_PROGRESS' | 'FINISHED';
}
