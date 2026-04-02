import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login/driver')
  loginDriver(
    @Body() body: { phone: string; password?: string },
  ): Promise<{ access_token: string }> {
    return this.auth.loginByDriverPhone(body.phone, body.password);
  }
}
