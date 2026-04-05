import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { RoleEntity } from './role.entity';
import { UserEntity } from './user.entity';

@Entity('user_roles')
export class UserRoleEntity {
  @PrimaryColumn('uuid')
  user_id!: string;

  @PrimaryColumn('uuid')
  role_id!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @ManyToOne(() => RoleEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role!: RoleEntity;
}
