import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IsEnum, IsNumber, IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import type { CargoStatus } from '@limousine-workspace/shared-types';
import { Type } from 'class-transformer';
import { AdminJwtGuard } from '../auth/admin-jwt.guard';
import { DriverJwtGuard } from '../auth/driver-jwt.guard';
import { CargosService } from './cargos.service';

class PartyDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(32)
  phone!: string;
}

class CreateCargoDto {
  @IsOptional()
  @IsUUID()
  trip_run_id?: string | null;

  @IsString()
  @MaxLength(64)
  waybill_code!: string;

  @IsObject()
  @Type(() => PartyDto)
  sender_info!: PartyDto;

  @IsObject()
  @Type(() => PartyDto)
  receiver_info!: PartyDto;

  @IsNumber()
  pickup_lat!: number;

  @IsNumber()
  pickup_lng!: number;

  @IsNumber()
  dropoff_lat!: number;

  @IsNumber()
  dropoff_lng!: number;

  @IsOptional()
  @IsEnum(['PENDING', 'PICKED_UP', 'DELIVERED'] as const)
  status?: CargoStatus;
}

class PatchCargoDto {
  @IsEnum(['PENDING', 'PICKED_UP', 'DELIVERED'] as const)
  status!: CargoStatus;
}

type Authed = { user: { userId: string } };

@Controller('cargos')
export class CargosController {
  constructor(private readonly cargos: CargosService) {}

  @Get('my-tasks')
  @UseGuards(DriverJwtGuard)
  myTasks(@Req() req: Authed) {
    return this.cargos.myTasks(req.user.userId);
  }

  @Get('all')
  @UseGuards(AdminJwtGuard)
  listAdmin() {
    return this.cargos.listAdmin();
  }

  @Post()
  @UseGuards(AdminJwtGuard)
  create(@Body() dto: CreateCargoDto) {
    return this.cargos.create({
      trip_run_id: dto.trip_run_id ?? null,
      waybill_code: dto.waybill_code,
      sender_info: dto.sender_info,
      receiver_info: dto.receiver_info,
      pickup_lat: dto.pickup_lat,
      pickup_lng: dto.pickup_lng,
      dropoff_lat: dto.dropoff_lat,
      dropoff_lng: dto.dropoff_lng,
      status: dto.status ?? 'PENDING',
    });
  }

  @Get(':id')
  @UseGuards(AdminJwtGuard)
  one(@Param('id', ParseUUIDPipe) id: string) {
    return this.cargos.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminJwtGuard)
  patch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PatchCargoDto,
  ) {
    return this.cargos.updateStatus(id, dto.status);
  }
}
