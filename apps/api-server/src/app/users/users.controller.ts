import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import type { User } from '@limousine-workspace/shared-types';
import { UsersService, type UpsertUserInput } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(): Promise<User[]> {
    return this.users.list();
  }

  @Post()
  create(@Body() body: UpsertUserInput): Promise<User> {
    return this.users.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<UpsertUserInput>,
  ): Promise<User> {
    return this.users.update(id, body);
  }
}
