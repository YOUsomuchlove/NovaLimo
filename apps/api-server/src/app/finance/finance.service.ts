import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinanceTransactionEntity } from '../entities/finance-transaction.entity';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(FinanceTransactionEntity)
    private readonly tx: Repository<FinanceTransactionEntity>,
  ) {}

  list() {
    return this.tx.find({ order: { created_at: 'DESC' }, take: 500 });
  }

  async create(data: {
    kind: string;
    amount: number;
    reference_type?: string | null;
    reference_id?: string | null;
    memo?: string | null;
  }) {
    return this.tx.save(
      this.tx.create({
        ...data,
        created_at: new Date(),
      }),
    );
  }

  async findOne(id: string) {
    const row = await this.tx.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Transaction not found');
    return row;
  }
}
