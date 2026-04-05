import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
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
}
