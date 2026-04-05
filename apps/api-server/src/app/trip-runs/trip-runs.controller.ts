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
import { AdminJwtGuard } from '../auth/admin-jwt.guard';
import { TripRunCreateDto, TripRunUpdateDto } from './dto/trip-run-mutate.dto';
import { TripRunsService } from './trip-runs.service';

@Controller('trip-runs')
export class TripRunsController {
  constructor(private readonly runs: TripRunsService) {}

  @Get()
  @UseGuards(AdminJwtGuard)
  list() {
    return this.runs.list();
  }

  @Get(':id')
  @UseGuards(AdminJwtGuard)
  one(@Param('id', ParseUUIDPipe) id: string) {
    return this.runs.findOne(id);
  }

  @Post()
  @UseGuards(AdminJwtGuard)
  create(@Body() dto: TripRunCreateDto) {
    return this.runs.create({
      trip_batch_id: dto.trip_batch_id,
      vehicle_id: dto.vehicle_id,
      driver_id: dto.driver_id,
      status: dto.status ?? 'PENDING',
    });
  }

  @Patch(':id')
  @UseGuards(AdminJwtGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TripRunUpdateDto,
  ) {
    return this.runs.update(id, dto as never);
  }

  @Delete(':id')
  @UseGuards(AdminJwtGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.runs.remove(id);
    return { ok: true };
  }
}
