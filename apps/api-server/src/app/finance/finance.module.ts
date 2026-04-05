import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceTransactionEntity } from '../entities/finance-transaction.entity';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';

@Module({
  imports: [TypeOrmModule.forFeature([FinanceTransactionEntity])],
  controllers: [FinanceController],
  providers: [FinanceService],
})
export class FinanceModule {}
