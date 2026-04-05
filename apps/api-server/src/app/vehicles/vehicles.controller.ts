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
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import type { VehicleStatus } from '@limousine-workspace/shared-types';
import { AdminJwtGuard } from '../auth/admin-jwt.guard';
import { VehiclesService } from './vehicles.service';

class CreateVehicleDto {
  @IsString()
  @MaxLength(32)
  license_plate!: string;

  @IsInt()
  @Min(1)
  capacity!: number;

  @IsOptional()
  @IsEnum(['AVAILABLE', 'MAINTENANCE', 'IN_USE'] as const)
  status?: VehicleStatus;
}

class PatchVehicleDto {
  @IsOptional()
  @IsString()
  license_plate?: string;

  @IsOptional()
  @IsInt()
  capacity?: number;

  @IsOptional()
  @IsEnum(['AVAILABLE', 'MAINTENANCE', 'IN_USE'] as const)
  status?: VehicleStatus;
}

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehicles: VehiclesService) {}

  @Get()
  @UseGuards(AdminJwtGuard)
  list() {
    return this.vehicles.list();
  }

  @Get(':id')
  @UseGuards(AdminJwtGuard)
  one(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehicles.findOne(id);
  }

  @Post()
  @UseGuards(AdminJwtGuard)
  create(@Body() dto: CreateVehicleDto) {
    return this.vehicles.create({
      license_plate: dto.license_plate,
      capacity: dto.capacity,
      status: dto.status ?? 'AVAILABLE',
    });
  }

  @Patch(':id')
  @UseGuards(AdminJwtGuard)
  patch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PatchVehicleDto,
  ) {
    return this.vehicles.update(id, dto as never);
  }

  @Delete(':id')
  @UseGuards(AdminJwtGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.vehicles.remove(id);
    return { ok: true };
  }
}
