import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customers: Repository<CustomerEntity>,
  ) {}

  list() {
    return this.customers.find({ order: { id: 'DESC' }, take: 500 });
  }

  async findOne(id: string) {
    const c = await this.customers.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Customer not found');
    return c;
  }

  async create(data: Partial<CustomerEntity>) {
    return this.customers.save(this.customers.create(data));
  }

  async update(id: string, patch: Partial<CustomerEntity>) {
    const c = await this.customers.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Customer not found');
    Object.assign(c, patch);
    return this.customers.save(c);
  }

  async remove(id: string): Promise<void> {
    const r = await this.customers.delete(id);
    if (!r.affected) throw new NotFoundException('Customer not found');
  }
}
