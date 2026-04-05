import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { TripRunStatus } from '@limousine-workspace/shared-types';
import type { Request } from 'express';
import { DriverJwtGuard } from '../auth/driver-jwt.guard';
import { TripsService } from './trips.service';

const RUN_STATUSES: TripRunStatus[] = ['PENDING', 'IN_PROGRESS', 'FINISHED'];

type Authed = Request & { user: { userId: string } };

@Controller('trips')
export class TripsController {
  constructor(private readonly trips: TripsService) {}

  @Get('my-runs')
  @UseGuards(DriverJwtGuard)
  myRuns(@Req() req: Authed, @Query('status') raw: string) {
    if (!RUN_STATUSES.includes(raw as TripRunStatus)) {
      throw new BadRequestException('Query status must be PENDING, IN_PROGRESS, or FINISHED');
    }
    return this.trips.myRuns(req.user.userId, raw as TripRunStatus);
  }

  @Get('my-runs/:id')
  @UseGuards(DriverJwtGuard)
  myRunDetail(@Req() req: Authed, @Param('id', ParseUUIDPipe) id: string) {
    return this.trips.myRunDetail(req.user.userId, id);
  }
}
