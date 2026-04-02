import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'vehicles' })
export class VehicleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 32 })
  license_plate!: string;

  @Column({ type: 'int' })
  capacity!: number;

  @Column({ type: 'varchar', length: 32 })
  status!: 'AVAILABLE' | 'MAINTENANCE' | 'IN_USE';
}
