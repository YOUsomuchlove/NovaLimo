import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { TripBatchStatus } from '@limousine-workspace/shared-types';
import { AdminJwtGuard } from '../auth/admin-jwt.guard';
import type { TripBatchEntity } from '../entities/trip-batch.entity';
import { TripBatchesService } from './trip-batches.service';
import { TripBatchCreateDto, TripBatchUpdateDto } from './dto/trip-batch-mutate.dto';

@Controller('trip-batches')
export class TripBatchesController {
  constructor(private readonly batches: TripBatchesService) {}

  @Get()
  list(@Query('status') status?: TripBatchStatus) {
    return this.batches.listPublic(status);
  }

  @Get(':id')
  @UseGuards(AdminJwtGuard)
  one(@Param('id', ParseUUIDPipe) id: string) {
    return this.batches.findOne(id);
  }

  @Post()
  @UseGuards(AdminJwtGuard)
  create(@Body() dto: TripBatchCreateDto) {
    const data: Partial<TripBatchEntity> = {
      route_name: dto.route_name,
      departure_time: new Date(dto.departure_time),
      status: dto.status ?? 'OPEN',
    };
    if (dto.list_price_vnd != null) data.list_price_vnd = dto.list_price_vnd;
    if (dto.vehicle_capacity != null) data.vehicle_capacity = dto.vehicle_capacity;
    return this.batches.create(data);
  }

  @Patch(':id')
  @UseGuards(AdminJwtGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TripBatchUpdateDto,
  ) {
    const patch: Record<string, unknown> = { ...dto };
    if (dto.departure_time) patch.departure_time = new Date(dto.departure_time);
    return this.batches.update(id, patch as never);
  }

  @Delete(':id')
  @UseGuards(AdminJwtGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.batches.remove(id);
    return { ok: true };
  }
}
