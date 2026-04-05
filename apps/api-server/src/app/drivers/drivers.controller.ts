import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { DriverJwtGuard } from '../auth/driver-jwt.guard';
import { driverShiftToDto } from '../mappers/to-dto';
import { LocationDto } from './dto/location.dto';
import { DriversService } from './drivers.service';

type Authed = { user: { userId: string } };

@Controller('driver')
export class DriversController {
  constructor(private readonly drivers: DriversService) {}

  @Get('shifts/current')
  @UseGuards(DriverJwtGuard)
  @HttpCode(200)
  async currentShift(@Req() req: { user: { userId: string } }, @Res({ passthrough: true }) res: Response) {
    const s = await this.drivers.getCurrentShift(req.user.userId);
    if (!s) {
      res.status(204);
      return;
    }
    return driverShiftToDto(s);
  }

  @Post('shifts/start')
  @UseGuards(DriverJwtGuard)
  async startShift(@Req() req: Authed) {
    await this.drivers.startShift(req.user.userId);
    return { ok: true };
  }

  @Post('shifts/end')
  @UseGuards(DriverJwtGuard)
  async endShift(@Req() req: Authed) {
    await this.drivers.endShift(req.user.userId);
    return { ok: true };
  }

  @Post('location')
  @UseGuards(DriverJwtGuard)
  async location(@Req() req: Authed, @Body() body: LocationDto) {
    return this.drivers.postLocation(req.user.userId, body.lat, body.lng);
  }
}
