import {
  SEAT_TIERS,
  STOP_KINDS,
  type SeatTier,
  type StopKind,
  VEHICLE_STATUSES,
  type VehicleStatus,
} from '@limousine-workspace/shared-types';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ListQueryDto } from '../../common/http/pagination';

const CODE = /^[A-Z0-9_-]{2,32}$/;
const PLATE = /^\d{2}[A-Z]{1,2}-?\d{3}\.?\d{2}$/;
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

/* ---------- Vehicle types ---------- */

export class SeatCellInput {
  @ApiProperty() @IsString() @Matches(/^[A-Z]\d{1,2}$/) label!: string;
  @ApiProperty({ enum: SEAT_TIERS }) @IsIn(SEAT_TIERS) tier!: SeatTier;
}

export class CreateVehicleTypeDto {
  @ApiProperty({ example: 'LIMO9' }) @Matches(CODE) code!: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(128) name!: string;
  @ApiProperty({
    description: 'Hàng ghế; null = lối đi',
    type: 'array',
    items: { type: 'array' },
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  seat_layout!: (SeatCellInput | null)[][];
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  image_url?: string;
}
export class UpdateVehicleTypeDto extends PartialType(CreateVehicleTypeDto) {}

/* ---------- Vehicles ---------- */

export class CreateVehicleDto {
  @ApiProperty({ example: '29B-123.45' })
  @Matches(PLATE, { message: 'Biển số không hợp lệ (vd 29B-123.45)' })
  license_plate!: string;
  @ApiProperty() @IsUUID() vehicle_type_id!: string;
  @ApiPropertyOptional({ enum: VEHICLE_STATUSES })
  @IsOptional()
  @IsIn(VEHICLE_STATUSES)
  status?: VehicleStatus;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  brand?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  model?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1990)
  @Max(2100)
  year?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  color?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) odometer_km?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  registration_expires_on?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  insurance_expires_on?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  next_maintenance_on?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  image_url?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}
export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {}

export class VehicleListQuery extends ListQueryDto {
  @ApiPropertyOptional({ enum: VEHICLE_STATUSES })
  @IsOptional()
  @IsIn(VEHICLE_STATUSES)
  status?: VehicleStatus;
  @ApiPropertyOptional() @IsOptional() @IsUUID() vehicle_type_id?: string;
}

/* ---------- Routes & stops ---------- */

export class CreateRouteDto {
  @ApiProperty({ example: 'HNQN' }) @Matches(CODE) code!: string;
  @ApiProperty({ example: 'Hà Nội → Hạ Long' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name!: string;
  @ApiProperty() @IsString() @MaxLength(128) origin_name!: string;
  @ApiProperty() @IsString() @MaxLength(128) destination_name!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3000)
  distance_km?: number;
  @ApiProperty() @IsInt() @Min(10) @Max(48 * 60) duration_min!: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  image_url?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() is_active?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() sort_order?: number;
}
export class UpdateRouteDto extends PartialType(CreateRouteDto) {}

export class CreateStopDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(255) name!: string;
  @ApiProperty() @IsString() @MinLength(5) @MaxLength(500) address!: string;
  @ApiProperty() @IsLatitude() lat!: number;
  @ApiProperty() @IsLongitude() lng!: number;
  @ApiPropertyOptional({ enum: STOP_KINDS })
  @IsOptional()
  @IsIn(STOP_KINDS)
  kind?: StopKind;
  @ApiPropertyOptional() @IsOptional() @IsInt() sort_order?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() is_active?: boolean;
}
export class UpdateStopDto extends PartialType(CreateStopDto) {}

/* ---------- Time slots ---------- */

export class CreateTimeSlotDto {
  @ApiProperty() @IsUUID() route_id!: string;
  @ApiProperty({ example: '08:30' }) @Matches(HHMM) departure_time!: string;
  @ApiProperty({ example: [1, 2, 3, 4, 5] })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  days_of_week!: number[];
  @ApiProperty() @IsUUID() vehicle_type_id!: string;
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  planned_vehicles?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() valid_from?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() valid_to?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() is_active?: boolean;
}
export class UpdateTimeSlotDto extends PartialType(CreateTimeSlotDto) {}

/* ---------- Price rules ---------- */

export class CreatePriceRuleDto {
  @ApiProperty() @IsUUID() route_id!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() vehicle_type_id?: string;
  @ApiProperty({ example: 'Giá tiêu chuẩn' })
  @IsString()
  @MaxLength(128)
  name!: string;
  @ApiProperty() @IsInt() @Min(0) @Max(50_000_000) base_price_vnd!: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000_000)
  vip_surcharge_vnd?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() valid_from?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() valid_to?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  priority?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() is_active?: boolean;
}
export class UpdatePriceRuleDto extends PartialType(CreatePriceRuleDto) {}

export class RouteScopedQuery {
  @ApiPropertyOptional() @IsOptional() @IsUUID() route_id?: string;
}
