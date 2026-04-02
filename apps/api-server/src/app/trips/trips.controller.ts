import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Cargo, TripRunStatus } from '@limousine-workspace/shared-types';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TripsService, type MyRun } from './trips.service';

@Controller('trips')
export class TripsController {
  constructor(private readonly trips: TripsService) {}

  @Get('my-runs')
  @UseGuards(JwtAuthGuard)
  myRuns(
    @Req() req: Request & { user?: { sub: string } },
    @Query('driver_id') driverIdQuery?: string,
    @Query('status') status?: TripRunStatus,
  ): Promise<MyRun[]> {
    const driverId = req.user?.sub ?? driverIdQuery;
    return this.trips.myRuns(driverId, status);
  }

  @Get('my-runs/:runId/cargos')
  @UseGuards(JwtAuthGuard)
  cargosForMyRun(
    @Req() req: Request & { user?: { sub: string } },
    @Param('runId') runId: string,
  ): Promise<Cargo[]> {
    const driverId = req.user?.sub;
    if (!driverId) throw new UnauthorizedException();
    return this.trips.cargosForRun(runId, driverId);
  }
}
