import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly jwt: JwtService,
  ) {}

  async loginByDriverPhone(
    phone: string,
    password?: string,
  ): Promise<{ access_token: string }> {
    const user = await this.users.findOne({
      where: { phone, role: 'DRIVER', status: 'ACTIVE' },
    });
    if (!user) throw new UnauthorizedException('Driver not found');
    if (user.password_hash) {
      if (
        !password ||
        !(await bcrypt.compare(password, user.password_hash))
      ) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }
    const access_token = await this.jwt.signAsync({
      sub: user.id,
      role: user.role,
    });
    return { access_token };
  }
}
