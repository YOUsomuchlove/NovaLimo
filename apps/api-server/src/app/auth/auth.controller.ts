import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login/admin')
  async loginAdmin(@Body() dto: LoginDto) {
    const user = await this.auth.validateLogin(dto.phone, dto.password, 'ADMIN');
    return { access_token: this.auth.signAccessToken(user) };
  }

  @Post('login/driver')
  async loginDriver(@Body() dto: LoginDto) {
    const user = await this.auth.validateLogin(dto.phone, dto.password, 'DRIVER');
    return { access_token: this.auth.signAccessToken(user) };
  }
}
