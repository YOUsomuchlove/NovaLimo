import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TripBatchEntity } from './trip-batch.entity';
import { UserEntity } from './user.entity';
import { VehicleEntity } from './vehicle.entity';

export type TripRunStatusDb = 'PENDING' | 'IN_PROGRESS' | 'FINISHED';

@Entity('trip_runs')
export class TripRunEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  trip_batch_id!: string;

  @ManyToOne(() => TripBatchEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_batch_id' })
  trip_batch!: TripBatchEntity;

  @Column('uuid')
  vehicle_id!: string;

  @ManyToOne(() => VehicleEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle!: VehicleEntity;

  @Column('uuid')
  driver_id!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'driver_id' })
  driver!: UserEntity;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'IN_PROGRESS', 'FINISHED'],
    default: 'PENDING',
  })
  status!: TripRunStatusDb;
}
