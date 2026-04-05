import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('driver_locations')
export class DriverLocationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  driver_id!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driver_id' })
  driver!: UserEntity;

  @Column({ type: 'double precision' })
  lat!: number;

  @Column({ type: 'double precision' })
  lng!: number;

  @Column({ type: 'timestamptz' })
  recorded_at!: Date;
}
