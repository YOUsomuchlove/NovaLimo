import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from '../auth/admin-jwt.guard';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('stats')
  @UseGuards(AdminJwtGuard)
  stats() {
    return this.admin.stats();
  }
}
