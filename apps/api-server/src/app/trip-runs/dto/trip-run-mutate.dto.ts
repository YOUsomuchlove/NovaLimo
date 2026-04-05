import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import type { TripRunStatus } from '@limousine-workspace/shared-types';

export class TripRunCreateDto {
  @IsUUID()
  trip_batch_id!: string;

  @IsUUID()
  vehicle_id!: string;

  @IsUUID()
  driver_id!: string;

  @IsOptional()
  @IsEnum(['PENDING', 'IN_PROGRESS', 'FINISHED'] as const)
  status?: TripRunStatus;
}

export class TripRunUpdateDto {
  @IsOptional()
  @IsUUID()
  vehicle_id?: string;

  @IsOptional()
  @IsUUID()
  driver_id?: string;

  @IsOptional()
  @IsEnum(['PENDING', 'IN_PROGRESS', 'FINISHED'] as const)
  status?: TripRunStatus;
}
