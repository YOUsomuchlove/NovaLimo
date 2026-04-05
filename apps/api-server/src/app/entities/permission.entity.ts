import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permissions')
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 128, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 255 })
  description!: string;
}
