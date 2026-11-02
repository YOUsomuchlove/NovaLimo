import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type { TripBatchStatus } from '@limousine-workspace/shared-types';

export class TripBatchCreateDto {
  @IsString()
  @MaxLength(512)
  route_name!: string;

  @IsDateString()
  departure_time!: string;

  @IsOptional()
  @IsEnum(['OPEN', 'CLUSTERED', 'COMPLETED'] as const)
  status?: TripBatchStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(500000000)
  list_price_vnd?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  vehicle_capacity?: number;
}

export class TripBatchUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(512)
  route_name?: string;

  @IsOptional()
  @IsDateString()
  departure_time?: string;

  @IsOptional()
  @IsEnum(['OPEN', 'CLUSTERED', 'COMPLETED'] as const)
  status?: TripBatchStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(500000000)
  list_price_vnd?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  vehicle_capacity?: number;
}
