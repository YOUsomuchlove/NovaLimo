import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { UserEntity, UserRoleDb } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly jwt: JwtService,
  ) {}

  async validateLogin(
    phone: string,
    password: string,
    role: UserRoleDb,
  ): Promise<UserEntity> {
    const user = await this.users.findOne({ where: { phone, role } });
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!bcrypt.compareSync(password, user.password_hash)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  signAccessToken(user: UserEntity): string {
    return this.jwt.sign({
      sub: user.id,
      role: user.role,
    });
  }
}
