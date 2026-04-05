import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('driver_shifts')
export class DriverShiftEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  driver_id!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driver_id' })
  driver!: UserEntity;

  @Column({ type: 'timestamptz' })
  started_at!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  ended_at!: Date | null;

  @Column({ type: 'double precision', nullable: true })
  start_lat!: number | null;

  @Column({ type: 'double precision', nullable: true })
  start_lng!: number | null;
}
