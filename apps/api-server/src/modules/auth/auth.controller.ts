import type { AuthTokens, Me } from '@limousine-workspace/shared-types';
import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import type { AuthUser } from '../../common/auth/auth-user';
import {
  Authenticated,
  CurrentUser,
  Public,
} from '../../common/auth/decorators';
import { ChangePasswordDto, LoginDto, RefreshDto } from './auth.dto';
import { AuthService } from './auth.service';

const client = (req: Request) => ({
  ip: req.ip,
  userAgent: req.headers['user-agent'],
});

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** Admin console login (staff accounts). */
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('staff/login')
  @HttpCode(200)
  staffLogin(@Body() dto: LoginDto, @Req() req: Request): Promise<AuthTokens> {
    return this.auth.login('STAFF', dto.phone, dto.password, client(req));
  }

  /** Driver app login. */
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('driver/login')
  @HttpCode(200)
  driverLogin(@Body() dto: LoginDto, @Req() req: Request): Promise<AuthTokens> {
    return this.auth.login('DRIVER', dto.phone, dto.password, client(req));
  }

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() dto: RefreshDto, @Req() req: Request): Promise<AuthTokens> {
    return this.auth.refresh(dto.refresh_token, client(req));
  }

  @Public()
  @Post('logout')
  @HttpCode(204)
  async logout(@Body() dto: RefreshDto): Promise<void> {
    await this.auth.logout(dto.refresh_token);
  }

  @Authenticated()
  @Get('me')
  me(@CurrentUser() user: AuthUser): Promise<Me> {
    return this.auth.me(user.sub);
  }

  @Authenticated()
  @Post('change-password')
  @HttpCode(204)
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    await this.auth.changePassword(
      user,
      dto.current_password,
      dto.new_password,
    );
  }
}
