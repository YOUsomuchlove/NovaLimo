import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type UserRoleDb = 'ADMIN' | 'DRIVER';
export type UserStatusDb = 'ACTIVE' | 'INACTIVE';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  full_name!: string;

  @Column({ type: 'varchar', length: 32, unique: true })
  phone!: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash!: string;

  @Column({ type: 'enum', enum: ['ADMIN', 'DRIVER'] })
  role!: UserRoleDb;

  @Column({ type: 'enum', enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  status!: UserStatusDb;
}
