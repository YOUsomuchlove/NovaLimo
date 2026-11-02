import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../../common/auth/auth-user';
import { CurrentUser, Public, Staff } from '../../common/auth/decorators';
import { SettingsService } from './settings.service';

@ApiTags('admin · settings (routes, slots, pricing)')
@Controller()
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Staff('settings.manage')
  @Get('admin/settings')
  all() {
    return this.settings.all();
  }

  @Staff('settings.manage')
  @Put('admin/settings/:key')
  set(
    @Param('key') key: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: AuthUser,
  ) {
    return this.settings.set(key, body, user.sub);
  }

  /** Public, non-sensitive settings for the booking site (hotline, booking policy). */
  @Public()
  @Get('public/settings')
  async publicSettings() {
    return {
      company: await this.settings.get('company.profile'),
      booking: await this.settings.get('booking.policy'),
    };
  }
}
