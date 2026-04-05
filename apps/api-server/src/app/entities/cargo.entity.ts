import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TripRunEntity } from './trip-run.entity';

export type CargoStatusDb = 'PENDING' | 'PICKED_UP' | 'DELIVERED';

@Entity('cargos')
export class CargoEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { nullable: true })
  trip_run_id!: string | null;

  @ManyToOne(() => TripRunEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'trip_run_id' })
  trip_run!: TripRunEntity | null;

  @Column({ type: 'varchar', length: 64, unique: true })
  waybill_code!: string;

  @Column({ type: 'jsonb' })
  sender_info!: { name: string; phone: string };

  @Column({ type: 'jsonb' })
  receiver_info!: { name: string; phone: string };

  @Column({ type: 'double precision' })
  pickup_lat!: number;

  @Column({ type: 'double precision' })
  pickup_lng!: number;

  @Column({ type: 'double precision' })
  dropoff_lat!: number;

  @Column({ type: 'double precision' })
  dropoff_lng!: number;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'PICKED_UP', 'DELIVERED'],
    default: 'PENDING',
  })
  status!: CargoStatusDb;
}
