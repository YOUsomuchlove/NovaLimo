import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Booking } from '@limousine-workspace/shared-types';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BookingsService, type CreateBookingInput } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get('taken-seats')
  takenSeats(
    @Query('trip_batch_id') trip_batch_id: string,
  ): Promise<string[]> {
    return this.bookings.findOccupiedSeatLabels(trip_batch_id ?? '');
  }

  @Get()
  list(
    @Query('passenger_phone') passenger_phone?: string,
    @Query('trip_batch_id') trip_batch_id?: string,
    @Query('status') status?: string,
  ): Promise<Booking[]> {
    if (passenger_phone?.trim()) {
      return this.bookings.findByPassengerPhone(passenger_phone);
    }
    return this.bookings.listAdmin({
      trip_batch_id: trip_batch_id,
      status: status as Booking['status'] | undefined,
    });
  }

  @Post()
  create(@Body() body: CreateBookingInput): Promise<Booking> {
    return this.bookings.create(body);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  patchStatusByDriver(
    @Req() req: Request & { user?: { sub: string } },
    @Param('id') id: string,
    @Body() body: { status: Booking['status'] },
  ): Promise<Booking> {
    const driverId = req.user?.sub;
    if (!driverId) throw new UnauthorizedException();
    return this.bookings.patchStatusByDriver(id, driverId, body.status);
  }
}
