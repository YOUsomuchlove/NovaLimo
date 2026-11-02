import {
  BOOKING_SOURCES,
  BOOKING_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  type BookingSource,
  type BookingStatus,
  type PaymentMethod,
  type PaymentStatus,
} from '@limousine-workspace/shared-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
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
  ValidateNested,
} from 'class-validator';
import { ListQueryDto } from '../../common/http/pagination';
import { VN_PHONE } from '../auth/auth.dto';

const SEAT = /^[A-Z]\d{1,2}$/;
const PHONE_MSG = { message: 'Số điện thoại không hợp lệ' };

export class CreateHoldDto {
  @ApiProperty() @IsUUID() trip_batch_id!: string;
  @ApiProperty({ example: ['A1', 'A2'] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  @Matches(SEAT, { each: true })
  seat_labels!: string[];
  @ApiPropertyOptional({ description: 'Token cũ để thay thế giữ chỗ trước đó' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  hold_token?: string;
}

export class PlaceDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() stop_id?: string;
  @ApiProperty() @IsString() @MinLength(5) @MaxLength(500) address!: string;
  @ApiProperty() @IsLatitude() lat!: number;
  @ApiProperty() @IsLongitude() lng!: number;
}

export class PassengerDto {
  @ApiProperty({ example: 'A1' }) @Matches(SEAT) seat_label!: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(255) name!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Matches(VN_PHONE, PHONE_MSG)
  phone?: string;
}

export class CreateBookingDto {
  @ApiProperty() @IsUUID() trip_batch_id!: string;
  @ApiProperty() @IsString() @MaxLength(64) hold_token!: string;
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  contact_name!: string;
  @ApiProperty() @Matches(VN_PHONE, PHONE_MSG) contact_phone!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  contact_email?: string;
  @ApiProperty({ type: PlaceDto })
  @ValidateNested()
  @Type(() => PlaceDto)
  pickup!: PlaceDto;
  @ApiProperty({ type: PlaceDto })
  @ValidateNested()
  @Type(() => PlaceDto)
  dropoff!: PlaceDto;
  @ApiProperty({ type: [PassengerDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers!: PassengerDto[];
  @ApiProperty({ enum: PAYMENT_METHODS })
  @IsIn(PAYMENT_METHODS)
  payment_method!: PaymentMethod;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

/** Call-center / admin booking: no hold needed, seats are allocated under lock. */
export class AdminCreateBookingDto {
  @ApiProperty() @IsUUID() trip_batch_id!: string;
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  contact_name!: string;
  @ApiProperty() @Matches(VN_PHONE, PHONE_MSG) contact_phone!: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() contact_email?: string;
  @ApiProperty({ type: PlaceDto })
  @ValidateNested()
  @Type(() => PlaceDto)
  pickup!: PlaceDto;
  @ApiProperty({ type: PlaceDto })
  @ValidateNested()
  @Type(() => PlaceDto)
  dropoff!: PlaceDto;
  @ApiProperty({ type: [PassengerDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers!: PassengerDto[];
  @ApiProperty({ enum: PAYMENT_METHODS })
  @IsIn(PAYMENT_METHODS)
  payment_method!: PaymentMethod;
  @ApiPropertyOptional({ enum: ['CALL_CENTER', 'ADMIN'] })
  @IsOptional()
  @IsIn(['CALL_CENTER', 'ADMIN'])
  source?: BookingSource;
  @ApiPropertyOptional({ description: 'Giảm giá (VND)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  discount_vnd?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

export class LookupBookingQuery {
  @ApiProperty({ example: 'NL-7K3M9Q' })
  @Matches(/^NL-[0-9A-Z]{6}$/i)
  code!: string;
  @ApiProperty() @Matches(VN_PHONE, PHONE_MSG) phone!: string;
}

export class RequestOtpDto {
  @ApiProperty() @Matches(VN_PHONE, PHONE_MSG) phone!: string;
}

export class VerifyOtpDto {
  @ApiProperty() @Matches(VN_PHONE, PHONE_MSG) phone!: string;
  @ApiProperty() @Matches(/^\d{6}$/) code!: string;
}

export class CancelBookingDto {
  @ApiProperty() @Matches(VN_PHONE, PHONE_MSG) phone!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class BookingListQuery extends ListQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() trip_batch_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() trip_run_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() route_id?: string;
  @ApiPropertyOptional({ enum: BOOKING_STATUSES })
  @IsOptional()
  @IsIn(BOOKING_STATUSES)
  status?: BookingStatus;
  @ApiPropertyOptional({ enum: PAYMENT_STATUSES })
  @IsOptional()
  @IsIn(PAYMENT_STATUSES)
  payment_status?: PaymentStatus;
  @ApiPropertyOptional({ enum: BOOKING_SOURCES })
  @IsOptional()
  @IsIn(BOOKING_SOURCES)
  source?: BookingSource;
  @ApiPropertyOptional({ description: 'Ngày khởi hành từ (VN)' })
  @IsOptional()
  @IsDateString()
  from?: string;
  @ApiPropertyOptional({ description: 'Ngày khởi hành đến (VN)' })
  @IsOptional()
  @IsDateString()
  to?: string;
  @ApiPropertyOptional({ description: 'Chỉ vé chưa xếp xe' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1)
  unassigned?: number;
}

export class UpdateBookingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  contact_name?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Matches(VN_PHONE, PHONE_MSG)
  contact_phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() contact_email?: string;
  @ApiPropertyOptional({ type: PlaceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PlaceDto)
  pickup?: PlaceDto;
  @ApiPropertyOptional({ type: PlaceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PlaceDto)
  dropoff?: PlaceDto;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

export class ChangeBookingStatusDto {
  @ApiProperty({ enum: BOOKING_STATUSES })
  @IsIn(BOOKING_STATUSES)
  status!: BookingStatus;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class RecordPaymentDto {
  @ApiProperty({ enum: PAYMENT_METHODS })
  @IsIn(PAYMENT_METHODS)
  method!: PaymentMethod;
  @ApiPropertyOptional({ description: 'Mã giao dịch ngân hàng / ghi chú' })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  provider_txn_id?: string;
}
