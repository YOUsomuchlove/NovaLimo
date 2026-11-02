import {
  PERMISSIONS,
  USER_STATUSES,
  type Permission,
  type UserStatus,
} from '@limousine-workspace/shared-types';
import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ListQueryDto } from '../../common/http/pagination';
import { VN_PHONE } from '../auth/auth.dto';

const PASSWORD = /(?=.*[A-Za-z])(?=.*\d)/;

export class PeopleListQuery extends ListQueryDto {
  @ApiPropertyOptional({ enum: USER_STATUSES })
  @IsOptional()
  @IsIn(USER_STATUSES)
  status?: UserStatus;
  @ApiPropertyOptional() @IsOptional() @IsUUID() role_id?: string;
}

/* ---------- staff ---------- */

export class CreateStaffDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(255) full_name!: string;
  @ApiProperty()
  @Matches(VN_PHONE, { message: 'Số điện thoại không hợp lệ' })
  phone!: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiProperty({ description: '≥ 8 ký tự, có chữ và số' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(PASSWORD, { message: 'Mật khẩu cần có cả chữ và số' })
  password!: string;
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  role_ids!: string[];
}

export class UpdateStaffDto extends PartialType(
  OmitType(CreateStaffDto, ['password'] as const),
) {
  @ApiPropertyOptional({ enum: USER_STATUSES })
  @IsOptional()
  @IsIn(USER_STATUSES)
  status?: UserStatus;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar_url?: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(PASSWORD, { message: 'Mật khẩu cần có cả chữ và số' })
  new_password!: string;
}

/* ---------- drivers ---------- */

export class DriverProfileInput {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  license_number?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(8)
  license_class?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  license_expires_on?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() date_of_birth?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  emergency_contact?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() default_vehicle_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() hired_on?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}

export class CreateDriverDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(255) full_name!: string;
  @ApiProperty()
  @Matches(VN_PHONE, { message: 'Số điện thoại không hợp lệ' })
  phone!: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(PASSWORD, { message: 'Mật khẩu cần có cả chữ và số' })
  password!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar_url?: string;
  @ApiPropertyOptional({ type: DriverProfileInput })
  @IsOptional()
  @ValidateNested()
  @Type(() => DriverProfileInput)
  profile?: DriverProfileInput;
}

export class UpdateDriverDto extends PartialType(
  OmitType(CreateDriverDto, ['password'] as const),
) {
  @ApiPropertyOptional({ enum: USER_STATUSES })
  @IsOptional()
  @IsIn(USER_STATUSES)
  status?: UserStatus;
}

/* ---------- roles ---------- */

export class CreateRoleDto {
  @ApiProperty({ example: 'dispatcher_night' })
  @Matches(/^[a-z][a-z0-9_]{2,63}$/)
  slug!: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(255) name!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
  @ApiProperty({ enum: PERMISSIONS, isArray: true })
  @IsArray()
  @ArrayUnique()
  @IsIn(PERMISSIONS, { each: true })
  permissions!: Permission[];
}

export class UpdateRoleDto extends PartialType(
  OmitType(CreateRoleDto, ['slug'] as const),
) {}

export class AuditListQuery extends ListQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() actor_id?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  resource?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  resource_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() from?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() to?: string;
}
