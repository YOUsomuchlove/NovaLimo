import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type VehicleStatusDb = 'AVAILABLE' | 'MAINTENANCE' | 'IN_USE';

@Entity('vehicles')
export class VehicleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 32, unique: true })
  license_plate!: string;

  @Column({ type: 'int' })
  capacity!: number;

  @Column({
    type: 'enum',
    enum: ['AVAILABLE', 'MAINTENANCE', 'IN_USE'],
    default: 'AVAILABLE',
  })
  status!: VehicleStatusDb;
}
