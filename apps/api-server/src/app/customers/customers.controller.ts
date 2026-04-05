import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { AdminJwtGuard } from '../auth/admin-jwt.guard';
import { CustomersService } from './customers.service';

class CreateCustomerDto {
  @IsString()
  @MaxLength(255)
  full_name!: string;

  @IsString()
  @MaxLength(32)
  phone!: string;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}

class PatchCustomerDto {
  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}

@Controller('customers')
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  @UseGuards(AdminJwtGuard)
  list() {
    return this.customers.list();
  }

  @Get(':id')
  @UseGuards(AdminJwtGuard)
  one(@Param('id', ParseUUIDPipe) id: string) {
    return this.customers.findOne(id);
  }

  @Post()
  @UseGuards(AdminJwtGuard)
  create(@Body() dto: CreateCustomerDto) {
    return this.customers.create(dto);
  }

  @Patch(':id')
  @UseGuards(AdminJwtGuard)
  patch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PatchCustomerDto,
  ) {
    return this.customers.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminJwtGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.customers.remove(id);
    return { ok: true };
  }
}
