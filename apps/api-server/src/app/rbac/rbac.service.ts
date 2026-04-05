import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from '../entities/audit-log.entity';
import { PermissionEntity } from '../entities/permission.entity';
import { RoleEntity } from '../entities/role.entity';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roles: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissions: Repository<PermissionEntity>,
    @InjectRepository(AuditLogEntity)
    private readonly audit: Repository<AuditLogEntity>,
  ) {}

  listRoles() {
    return this.roles.find({ order: { slug: 'ASC' } });
  }

  listPermissions() {
    return this.permissions.find({ order: { slug: 'ASC' } });
  }

  async appendAudit(data: {
    actor_user_id?: string | null;
    action: string;
    resource?: string | null;
    resource_id?: string | null;
    payload?: Record<string, unknown> | null;
  }) {
    return this.audit.save(
      this.audit.create({
        ...data,
        created_at: new Date(),
      }),
    );
  }
}
