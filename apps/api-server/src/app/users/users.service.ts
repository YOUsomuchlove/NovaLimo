import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  list() {
    return this.users.find({ order: { id: 'ASC' }, take: 500 }).then((rows) =>
      rows.map((row) => {
        const { password_hash: _omit, ...u } = row;
        void _omit;
        return u;
      }),
    );
  }

  async findOne(id: string) {
    const u = await this.users.findOne({ where: { id } });
    if (!u) throw new NotFoundException('User not found');
    const { password_hash: _omit, ...rest } = u;
    void _omit;
    return rest;
  }
}
