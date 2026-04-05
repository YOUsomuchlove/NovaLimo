import type { BookingStatus, PaymentMethod, PaymentStatus } from '@limousine-workspace/shared-types';
import { IsEnum, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class PatchBookingDto {
  @IsOptional()
  @IsUUID()
  trip_run_id?: string | null;

  @IsOptional()
  @IsEnum(['WAITING', 'PICKED_UP', 'DROPPED_OFF', 'CANCELLED'] as const)
  status?: BookingStatus;

  @IsOptional()
  @IsEnum(['COD', 'MOMO', 'ZALOPAY', 'VNPAY'] as const)
  payment_method?: PaymentMethod | null;

  @IsOptional()
  @IsEnum(['PENDING', 'PAID', 'FAILED'] as const)
  payment_status?: PaymentStatus;

  @IsOptional()
  @IsNumber()
  pickup_order?: number | null;

  @IsOptional()
  @IsNumber()
  dropoff_order?: number | null;
}
