import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { IsNumber, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { AdminJwtGuard } from '../auth/admin-jwt.guard';
import { FinanceService } from './finance.service';

class CreateFinanceTxDto {
  @IsString()
  @MaxLength(64)
  kind!: string;

  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  reference_type?: string | null;

  @IsOptional()
  @IsUUID()
  reference_id?: string | null;

  @IsOptional()
  @IsString()
  memo?: string | null;
}

@Controller('finance')
export class FinanceController {
  constructor(private readonly finance: FinanceService) {}

  @Get('transactions')
  @UseGuards(AdminJwtGuard)
  list() {
    return this.finance.list();
  }

  @Get('transactions/:id')
  @UseGuards(AdminJwtGuard)
  one(@Param('id', ParseUUIDPipe) id: string) {
    return this.finance.findOne(id);
  }

  @Post('transactions')
  @UseGuards(AdminJwtGuard)
  create(@Body() dto: CreateFinanceTxDto) {
    return this.finance.create(dto);
  }
}
