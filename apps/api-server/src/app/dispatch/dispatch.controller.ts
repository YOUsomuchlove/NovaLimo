import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsOptional, IsUUID } from 'class-validator';
import { AdminJwtGuard } from '../auth/admin-jwt.guard';
import { DispatchService } from './dispatch.service';

class AssignBookingDto {
  @IsUUID()
  booking_id!: string;

  @IsOptional()
  @IsUUID()
  trip_run_id!: string | null;
}

@Controller('dispatch')
export class DispatchController {
  constructor(private readonly dispatch: DispatchService) {}

  @Post('assign-booking')
  @UseGuards(AdminJwtGuard)
  assign(@Body() dto: AssignBookingDto) {
    return this.dispatch.assignBooking(dto.booking_id, dto.trip_run_id ?? null);
  }
}
