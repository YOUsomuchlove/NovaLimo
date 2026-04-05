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
import { AdminJwtGuard } from '../auth/admin-jwt.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PatchBookingDto } from './dto/patch-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get('taken-seats')
  takenSeats(@Query('trip_batch_id', ParseUUIDPipe) trip_batch_id: string) {
    return this.bookings.takenSeats(trip_batch_id);
  }

  @Get('all')
  @UseGuards(AdminJwtGuard)
  listAdmin() {
    return this.bookings.listAdmin();
  }

  @Get()
  listByPhone(@Query('passenger_phone') phone: string) {
    if (!phone?.trim()) return [];
    return this.bookings.listByPhone(phone.trim());
  }

  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookings.create(dto);
  }

  @Get(':id')
  @UseGuards(AdminJwtGuard)
  one(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookings.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminJwtGuard)
  patch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PatchBookingDto,
  ) {
    return this.bookings.updateAdmin(id, {
      trip_run_id: dto.trip_run_id,
      status: dto.status,
      payment_method: dto.payment_method,
      payment_status: dto.payment_status,
      pickup_order: dto.pickup_order,
      dropoff_order: dto.dropoff_order,
    });
  }

  @Delete(':id')
  @UseGuards(AdminJwtGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.bookings.remove(id);
    return { ok: true };
  }
}
