import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 128, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;
}
