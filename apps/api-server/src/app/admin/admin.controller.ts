import { Controller, Get } from '@nestjs/common';
import { AdminService, type AdminStatsDto } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('stats')
  stats(): Promise<AdminStatsDto> {
    return this.admin.getStats();
  }
}
