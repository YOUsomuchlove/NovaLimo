import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { PermissionEntity } from './permission.entity';
import { RoleEntity } from './role.entity';

@Entity('role_permissions')
export class RolePermissionEntity {
  @PrimaryColumn('uuid')
  role_id!: string;

  @PrimaryColumn('uuid')
  permission_id!: string;

  @ManyToOne(() => RoleEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role!: RoleEntity;

  @ManyToOne(() => PermissionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission!: PermissionEntity;
}
