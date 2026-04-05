import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from '../auth/admin-jwt.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @UseGuards(AdminJwtGuard)
  list() {
    return this.users.list();
  }

  @Get(':id')
  @UseGuards(AdminJwtGuard)
  one(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.findOne(id);
  }
}
