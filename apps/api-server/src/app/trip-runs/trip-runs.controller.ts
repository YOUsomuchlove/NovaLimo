import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { TripRun, TripRunStatus } from '@limousine-workspace/shared-types';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TripRunsService, type TripRunDetail } from './trip-runs.service';

@Controller('trip-runs')
export class TripRunsController {
  constructor(private readonly tripRuns: TripRunsService) {}

  @Get()
  list(@Query('trip_batch_id') trip_batch_id?: string): Promise<TripRun[]> {
    return this.tripRuns.list(trip_batch_id);
  }

  @Get(':id')
  detail(@Param('id') id: string): Promise<TripRunDetail> {
    return this.tripRuns.getById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  patchStatus(
    @Req() req: Request & { user?: { sub: string } },
    @Param('id') id: string,
    @Body() body: { status: TripRunStatus },
  ): Promise<TripRun> {
    const driverId = req.user?.sub;
    if (!driverId) throw new UnauthorizedException();
    return this.tripRuns.patchStatusByDriver(id, driverId, body.status);
  }
}
