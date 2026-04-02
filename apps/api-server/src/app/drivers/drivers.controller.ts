import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DriversService } from './drivers.service';

@Controller('drivers')
export class DriversController {
  constructor(private readonly drivers: DriversService) {}

  @Post('shifts/start')
  @UseGuards(JwtAuthGuard)
  startShift(
    @Req() req: Request & { user?: { sub: string } },
  ) {
    const driverId = req.user?.sub;
    if (!driverId) throw new UnauthorizedException();
    return this.drivers.startShift(driverId);
  }

  @Post('shifts/end')
  @UseGuards(JwtAuthGuard)
  endShift(@Req() req: Request & { user?: { sub: string } }) {
    const driverId = req.user?.sub;
    if (!driverId) throw new UnauthorizedException();
    return this.drivers.endShift(driverId);
  }

  @Get('shifts/current')
  @UseGuards(JwtAuthGuard)
  async currentShift(@Req() req: Request & { user?: { sub: string } }) {
    const driverId = req.user?.sub;
    if (!driverId) throw new UnauthorizedException();
    const shift = await this.drivers.getCurrentShift(driverId);
    return { shift };
  }

  @Get('shifts/summary')
  @UseGuards(JwtAuthGuard)
  shiftSummary(@Req() req: Request & { user?: { sub: string } }) {
    const driverId = req.user?.sub;
    if (!driverId) throw new UnauthorizedException();
    return this.drivers.getShiftSummary(driverId);
  }

  @Post('location')
  @UseGuards(JwtAuthGuard)
  postLocation(
    @Req() req: Request & { user?: { sub: string } },
    @Body() body: { lat: number; lng: number },
  ) {
    const driverId = req.user?.sub;
    if (!driverId) throw new UnauthorizedException();
    return this.drivers.postLocation(driverId, body.lat, body.lng);
  }

  @Post('chat')
  @UseGuards(JwtAuthGuard)
  postChat(
    @Req() req: Request & { user?: { sub: string } },
    @Body() body: { message: string },
  ) {
    const driverId = req.user?.sub;
    if (!driverId) throw new UnauthorizedException();
    return this.drivers.postChatMessage(driverId, body.message ?? '');
  }
}
