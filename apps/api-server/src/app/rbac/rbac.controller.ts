import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { AdminJwtGuard } from '../auth/admin-jwt.guard';
import { RbacService } from './rbac.service';

class AuditLogDto {
  @IsString()
  @MaxLength(64)
  action!: string;

  @IsOptional()
  @IsString()
  resource?: string | null;

  @IsOptional()
  @IsUUID()
  resource_id?: string | null;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown> | null;
}

type Authed = { user: { userId: string } };

@Controller('rbac')
export class RbacController {
  constructor(private readonly rbac: RbacService) {}

  @Get('roles')
  @UseGuards(AdminJwtGuard)
  roles() {
    return this.rbac.listRoles();
  }

  @Get('permissions')
  @UseGuards(AdminJwtGuard)
  permissions() {
    return this.rbac.listPermissions();
  }

  @Post('audit-logs')
  @UseGuards(AdminJwtGuard)
  audit(
    @Req() req: Authed,
    @Body() dto: AuditLogDto,
  ) {
    return this.rbac.appendAudit({
      actor_user_id: req.user.userId,
      action: dto.action,
      resource: dto.resource ?? null,
      resource_id: dto.resource_id ?? null,
      payload: dto.payload ?? null,
    });
  }
}
