import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogEntity } from '../entities/audit-log.entity';
import { PermissionEntity } from '../entities/permission.entity';
import { RoleEntity } from '../entities/role.entity';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity, PermissionEntity, AuditLogEntity]),
  ],
  controllers: [RbacController],
  providers: [RbacService],
})
export class RbacModule {}
