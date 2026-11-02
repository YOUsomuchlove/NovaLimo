import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../../common/auth/auth-user';
import { CurrentUser, Staff } from '../../common/auth/decorators';
import {
  AuditListQuery,
  CreateDriverDto,
  CreateRoleDto,
  CreateStaffDto,
  PeopleListQuery,
  ResetPasswordDto,
  UpdateDriverDto,
  UpdateRoleDto,
  UpdateStaffDto,
} from './people.dto';
import { PeopleService } from './people.service';

const Id = () => Param('id', ParseUUIDPipe);

@ApiTags('admin · people & rbac')
@Controller('admin')
export class PeopleController {
  constructor(private readonly people: PeopleService) {}

  /* staff */
  @Staff('rbac.manage') @Get('staff') listStaff(@Query() q: PeopleListQuery) {
    return this.people.listStaff(q);
  }
  @Staff('rbac.manage') @Get('staff/:id') getStaff(@Id() id: string) {
    return this.people.getStaff(id);
  }
  @Staff('rbac.manage') @Post('staff') createStaff(
    @Body() dto: CreateStaffDto,
  ) {
    return this.people.createStaff(dto);
  }
  @Staff('rbac.manage')
  @Patch('staff/:id')
  updateStaff(
    @Id() id: string,
    @Body() dto: UpdateStaffDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.people.updateStaff(id, dto, user.sub);
  }
  @Staff('rbac.manage')
  @Put('staff/:id/password')
  @HttpCode(204)
  resetStaffPassword(@Id() id: string, @Body() dto: ResetPasswordDto) {
    return this.people.resetPassword(id, dto.new_password);
  }
  @Staff('rbac.manage') @Delete('staff/:id') @HttpCode(204) archiveStaff(
    @Id() id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.people.archiveUser(id, user.sub);
  }

  /* drivers */
  @Staff('driver.read') @Get('drivers') listDrivers(
    @Query() q: PeopleListQuery,
  ) {
    return this.people.listDrivers(q);
  }
  @Staff('driver.read') @Get('drivers/:id') getDriver(@Id() id: string) {
    return this.people.getDriver(id);
  }
  @Staff('driver.write') @Post('drivers') createDriver(
    @Body() dto: CreateDriverDto,
  ) {
    return this.people.createDriver(dto);
  }
  @Staff('driver.write') @Patch('drivers/:id') updateDriver(
    @Id() id: string,
    @Body() dto: UpdateDriverDto,
  ) {
    return this.people.updateDriver(id, dto);
  }
  @Staff('driver.write')
  @Put('drivers/:id/password')
  @HttpCode(204)
  resetDriverPassword(@Id() id: string, @Body() dto: ResetPasswordDto) {
    return this.people.resetPassword(id, dto.new_password);
  }
  @Staff('driver.write') @Delete('drivers/:id') @HttpCode(204) archiveDriver(
    @Id() id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.people.archiveUser(id, user.sub);
  }

  /* roles */
  @Staff('rbac.manage') @Get('roles') listRoles() {
    return this.people.listRoles();
  }
  @Staff('rbac.manage') @Post('roles') createRole(@Body() dto: CreateRoleDto) {
    return this.people.createRole(dto);
  }
  @Staff('rbac.manage') @Patch('roles/:id') updateRole(
    @Id() id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.people.updateRole(id, dto);
  }
  @Staff('rbac.manage') @Delete('roles/:id') @HttpCode(204) deleteRole(
    @Id() id: string,
  ) {
    return this.people.deleteRole(id);
  }

  /* audit */
  @Staff('audit.read') @Get('audit-logs') audit(@Query() q: AuditListQuery) {
    return this.people.listAudit(q);
  }
}
