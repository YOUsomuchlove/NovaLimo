import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'cargos' })
export class CargoEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  waybill_code!: string;

  @Column({ type: 'uuid', nullable: true })
  trip_run_id!: string | null;

  @Column({ type: 'varchar', length: 255 })
  sender_name!: string;

  @Column({ type: 'varchar', length: 32 })
  sender_phone!: string;

  @Column({ type: 'varchar', length: 255 })
  receiver_name!: string;

  @Column({ type: 'varchar', length: 32 })
  receiver_phone!: string;

  @Column({ type: 'double precision' })
  pickup_lat!: number;

  @Column({ type: 'double precision' })
  pickup_lng!: number;

  @Column({ type: 'double precision' })
  dropoff_lat!: number;

  @Column({ type: 'double precision' })
  dropoff_lng!: number;

  @Column({ type: 'varchar', length: 32 })
  status!: 'PENDING' | 'PICKED_UP' | 'DELIVERED';
}
