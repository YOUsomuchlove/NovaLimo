import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { User } from '@limousine-workspace/shared-types';
import { UserEntity } from '../entities/user.entity';
import { userToDomain } from '../mappers/to-domain';

export type UpsertUserInput = {
  full_name: string;
  phone: string;
  role: User['role'];
  status: User['status'];
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  async list(): Promise<User[]> {
    const rows = await this.users.find({ order: { full_name: 'ASC' } });
    return rows.map(userToDomain);
  }

  async create(body: UpsertUserInput): Promise<User> {
    const e = this.users.create({
      full_name: body.full_name.trim(),
      phone: body.phone.trim(),
      role: body.role,
      status: body.status,
      password_hash: null,
    });
    const saved = await this.users.save(e);
    return userToDomain(saved);
  }

  async update(id: string, body: Partial<UpsertUserInput>): Promise<User> {
    const e = await this.users.findOne({ where: { id } });
    if (!e) throw new NotFoundException('user not found');
    if (body.full_name !== undefined) e.full_name = body.full_name.trim();
    if (body.phone !== undefined) e.phone = body.phone.trim();
    if (body.role !== undefined) e.role = body.role;
    if (body.status !== undefined) e.status = body.status;
    const saved = await this.users.save(e);
    return userToDomain(saved);
  }
}
