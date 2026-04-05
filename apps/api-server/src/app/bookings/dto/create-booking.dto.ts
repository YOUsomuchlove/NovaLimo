import type { PaymentMethod } from '@limousine-workspace/shared-types';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class GeoDto {
  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;
}

export class CreateBookingDto {
  @IsUUID()
  trip_batch_id!: string;

  @IsString()
  @MaxLength(255)
  passenger_name!: string;

  @IsString()
  @MaxLength(32)
  passenger_phone!: string;

  @IsOptional()
  @IsString()
  booker_name?: string | null;

  @IsOptional()
  @IsString()
  booker_phone?: string | null;

  @IsString()
  pickup_address!: string;

  @ValidateNested()
  @Type(() => GeoDto)
  @IsObject()
  pickup_location!: GeoDto;

  @IsString()
  dropoff_address!: string;

  @ValidateNested()
  @Type(() => GeoDto)
  @IsObject()
  dropoff_location!: GeoDto;

  @IsOptional()
  @IsString()
  note?: string | null;

  @IsOptional()
  @IsString()
  seat_label?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unit_price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  total_amount?: number;

  @IsOptional()
  @IsEnum(['COD', 'MOMO', 'ZALOPAY', 'VNPAY'] as const)
  payment_method?: PaymentMethod | null;
}
