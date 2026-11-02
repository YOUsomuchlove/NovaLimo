import {
  FINANCE_CATEGORIES,
  FINANCE_KINDS,
  TICKET_KINDS,
  TICKET_STATUSES,
  type CustomerDto,
  type FinanceCategory,
  type FinanceKind,
  type FinanceTransactionDto,
  type Paginated,
  type SupportTicketDto,
  type TicketKind,
  type TicketStatus,
} from '@limousine-workspace/shared-types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import type { Repository } from 'typeorm';
import { ticketCode } from '../../common/codes';
import { DomainError } from '../../common/http/exception.filter';
import { ListQueryDto, likeTerm, paginate } from '../../common/http/pagination';
import { vnDayRange } from '../../common/time';
import {
  CustomerEntity,
  FinanceTransactionEntity,
  SupportTicketEntity,
  UserEntity,
} from '../../database/entities';
import { VN_PHONE } from '../auth/auth.dto';

const PHONE = { message: 'Số điện thoại không hợp lệ' };

/* ---------------- DTOs ---------------- */

export class CustomerInput {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(255) full_name!: string;
  @ApiProperty() @Matches(VN_PHONE, PHONE) phone!: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(32, { each: true })
  tags?: string[];
}

export class UpdateCustomerInput extends PartialType(CustomerInput) {}

export class FinanceListQuery extends ListQueryDto {
  @ApiPropertyOptional({ enum: FINANCE_KINDS })
  @IsOptional()
  @IsIn(FINANCE_KINDS)
  kind?: FinanceKind;
  @ApiPropertyOptional({ enum: FINANCE_CATEGORIES })
  @IsOptional()
  @IsIn(FINANCE_CATEGORIES)
  category?: FinanceCategory;
  @ApiPropertyOptional() @IsOptional() @IsDateString() from?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() to?: string;
}

export class FinanceInput {
  @ApiProperty({ enum: FINANCE_KINDS }) @IsIn(FINANCE_KINDS) kind!: FinanceKind;
  @ApiProperty({ enum: FINANCE_CATEGORIES })
  @IsIn(FINANCE_CATEGORIES)
  category!: FinanceCategory;
  @ApiProperty() @IsInt() @Min(1) @Max(2_000_000_000) amount_vnd!: number;
  @ApiProperty() @IsDateString() occurred_at!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  memo?: string;
}

export class UpdateFinanceInput extends PartialType(FinanceInput) {}

export class ContactInput {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(255) name!: string;
  @ApiProperty() @Matches(VN_PHONE, PHONE) phone!: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiProperty() @IsString() @MinLength(3) @MaxLength(255) subject!: string;
  @ApiProperty() @IsString() @MinLength(10) @MaxLength(4000) message!: string;
}

export class TicketListQuery extends ListQueryDto {
  @ApiPropertyOptional({ enum: TICKET_KINDS })
  @IsOptional()
  @IsIn(TICKET_KINDS)
  kind?: TicketKind;
  @ApiPropertyOptional({ enum: TICKET_STATUSES })
  @IsOptional()
  @IsIn(TICKET_STATUSES)
  status?: TicketStatus;
}

export class TicketUpdate {
  @ApiPropertyOptional({ enum: TICKET_STATUSES })
  @IsOptional()
  @IsIn(TICKET_STATUSES)
  status?: TicketStatus;
  @ApiPropertyOptional() @IsOptional() @IsUUID() assignee_id?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  internal_note?: string;
}

/* ---------------- service ---------------- */

@Injectable()
export class BackofficeService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customers: Repository<CustomerEntity>,
    @InjectRepository(FinanceTransactionEntity)
    private readonly finance: Repository<FinanceTransactionEntity>,
    @InjectRepository(SupportTicketEntity)
    private readonly tickets: Repository<SupportTicketEntity>,
  ) {}

  /* ---------- customers (with booking stats) ---------- */

  async listCustomers(q: ListQueryDto): Promise<Paginated<CustomerDto>> {
    const qb = this.customers
      .createQueryBuilder('c')
      .leftJoin(
        'bookings',
        'b',
        "b.customer_id = c.id AND b.status NOT IN ('CANCELLED')",
      )
      .leftJoin('trip_batches', 'tb', 'tb.id = b.trip_batch_id')
      .select('c')
      .addSelect('COUNT(b.id)', 'booking_count')
      .addSelect(
        "COALESCE(SUM(b.total_vnd) FILTER (WHERE b.payment_status = 'PAID'), 0)",
        'total_spent',
      )
      .addSelect('MAX(tb.departure_at)', 'last_trip_at')
      .groupBy('c.id');
    if (q.q)
      qb.andWhere(
        '(c.full_name ILIKE :q OR c.phone ILIKE :q OR c.email ILIKE :q)',
        { q: likeTerm(q.q) },
      );
    const total = await qb.clone().getCount();
    const sortMap: Record<string, string> = {
      name: 'c.full_name',
      created_at: 'c.created_at',
      spent: 'total_spent',
      bookings: 'booking_count',
    };
    const key = q.sort?.replace(/^-/, '');
    qb.orderBy(
      sortMap[key ?? ''] ?? 'c.created_at',
      q.sort?.startsWith('-') || !key ? 'DESC' : 'ASC',
    );
    const { entities, raw } = await qb
      .offset((q.page - 1) * q.limit)
      .limit(q.limit)
      .getRawAndEntities();
    const items = entities.map((c, i) => this.toCustomer(c, raw[i]));
    return { items, total, page: q.page, limit: q.limit };
  }

  async getCustomer(id: string): Promise<CustomerDto> {
    const qb = this.customers
      .createQueryBuilder('c')
      .leftJoin(
        'bookings',
        'b',
        "b.customer_id = c.id AND b.status NOT IN ('CANCELLED')",
      )
      .leftJoin('trip_batches', 'tb', 'tb.id = b.trip_batch_id')
      .select('c')
      .addSelect('COUNT(b.id)', 'booking_count')
      .addSelect(
        "COALESCE(SUM(b.total_vnd) FILTER (WHERE b.payment_status = 'PAID'), 0)",
        'total_spent',
      )
      .addSelect('MAX(tb.departure_at)', 'last_trip_at')
      .where('c.id = :id', { id })
      .groupBy('c.id');
    const { entities, raw } = await qb.getRawAndEntities();
    if (!entities[0]) throw new NotFoundException('Không tìm thấy khách hàng');
    return this.toCustomer(entities[0], raw[0]);
  }

  async createCustomer(dto: CustomerInput): Promise<CustomerDto> {
    const c = await this.customers.save(this.customers.create(dto));
    return this.getCustomer(c.id);
  }

  async updateCustomer(
    id: string,
    dto: UpdateCustomerInput,
  ): Promise<CustomerDto> {
    const c = await this.customers.findOneBy({ id });
    if (!c) throw new NotFoundException('Không tìm thấy khách hàng');
    await this.customers.save(Object.assign(c, dto));
    return this.getCustomer(id);
  }

  async archiveCustomer(id: string): Promise<void> {
    const res = await this.customers.softDelete(id);
    if (!res.affected) throw new NotFoundException('Không tìm thấy khách hàng');
  }

  private toCustomer(
    c: CustomerEntity,
    raw: Record<string, unknown>,
  ): CustomerDto {
    return {
      id: c.id,
      full_name: c.full_name,
      phone: c.phone,
      email: c.email,
      note: c.note,
      tags: c.tags,
      booking_count: Number(raw.booking_count ?? 0),
      total_spent_vnd: Number(raw.total_spent ?? 0),
      last_trip_at: raw.last_trip_at
        ? new Date(raw.last_trip_at as string).toISOString()
        : null,
      created_at: c.created_at.toISOString(),
    };
  }

  /* ---------- finance ---------- */

  private financeQuery(q: FinanceListQuery) {
    const qb = this.finance
      .createQueryBuilder('f')
      .leftJoinAndMapOne(
        'f.creator',
        UserEntity,
        'u',
        'u.id = f.created_by_id',
      );
    if (q.kind) qb.andWhere('f.kind = :k', { k: q.kind });
    if (q.category) qb.andWhere('f.category = :c', { c: q.category });
    if (q.from)
      qb.andWhere('f.occurred_at >= :from', {
        from: vnDayRange(q.from.slice(0, 10)).from,
      });
    if (q.to)
      qb.andWhere('f.occurred_at < :to', {
        to: vnDayRange(q.to.slice(0, 10)).to,
      });
    if (q.q) qb.andWhere('f.memo ILIKE :q', { q: likeTerm(q.q) });
    return qb;
  }

  async listFinance(q: FinanceListQuery): Promise<
    Paginated<FinanceTransactionDto> & {
      summary: { income_vnd: number; expense_vnd: number; net_vnd: number };
    }
  > {
    const page = await paginate(
      this.financeQuery(q),
      q,
      (f) => this.toFinance(f),
      { occurred_at: 'f.occurred_at', amount: 'f.amount_vnd' },
      ['f.occurred_at', 'DESC'],
    );
    const sums = await this.financeQuery(q)
      .select(
        "COALESCE(SUM(f.amount_vnd) FILTER (WHERE f.kind = 'INCOME'), 0)",
        'income',
      )
      .addSelect(
        "COALESCE(SUM(f.amount_vnd) FILTER (WHERE f.kind = 'EXPENSE'), 0)",
        'expense',
      )
      .getRawOne<{ income: string; expense: string }>();
    const income = Number(sums?.income ?? 0);
    const expense = Number(sums?.expense ?? 0);
    return {
      ...page,
      summary: {
        income_vnd: income,
        expense_vnd: expense,
        net_vnd: income - expense,
      },
    };
  }

  async getFinance(id: string): Promise<FinanceTransactionDto> {
    const f = await this.financeQuery({ page: 1, limit: 1 } as FinanceListQuery)
      .andWhere('f.id = :id', { id })
      .getOne();
    if (!f) throw new NotFoundException('Không tìm thấy giao dịch');
    return this.toFinance(f);
  }

  async createFinance(
    dto: FinanceInput,
    userId: string,
  ): Promise<FinanceTransactionDto> {
    const f = await this.finance.save(
      this.finance.create({
        ...dto,
        occurred_at: new Date(dto.occurred_at),
        created_by_id: userId,
      }),
    );
    return this.getFinance(f.id);
  }

  async updateFinance(
    id: string,
    dto: UpdateFinanceInput,
  ): Promise<FinanceTransactionDto> {
    const f = await this.finance.findOneBy({ id });
    if (!f) throw new NotFoundException('Không tìm thấy giao dịch');
    if (f.reference_type)
      throw new DomainError(
        409,
        'AUTO_TXN',
        'Giao dịch tự động (vé, COD) không thể sửa tay',
      );
    Object.assign(
      f,
      dto,
      dto.occurred_at ? { occurred_at: new Date(dto.occurred_at) } : {},
    );
    await this.finance.save(f);
    return this.getFinance(id);
  }

  private toFinance(
    f: FinanceTransactionEntity & {
      creator?: { id: string; full_name: string };
    },
  ): FinanceTransactionDto {
    return {
      id: f.id,
      kind: f.kind,
      category: f.category,
      amount_vnd: f.amount_vnd,
      occurred_at: f.occurred_at.toISOString(),
      reference_type: f.reference_type,
      reference_id: f.reference_id,
      memo: f.memo,
      created_by: f.creator
        ? { id: f.creator.id, full_name: f.creator.full_name }
        : null,
      created_at: f.created_at.toISOString(),
    };
  }

  /* ---------- support tickets ---------- */

  async createContact(dto: ContactInput): Promise<{ code: string }> {
    const t = await this.tickets.save(
      this.tickets.create({ ...dto, code: ticketCode(), kind: 'CONTACT' }),
    );
    return { code: t.code };
  }

  async listTickets(q: TicketListQuery): Promise<Paginated<SupportTicketDto>> {
    const qb = this.tickets
      .createQueryBuilder('t')
      .leftJoinAndMapOne('t.assignee', UserEntity, 'u', 'u.id = t.assignee_id');
    if (q.kind) qb.andWhere('t.kind = :k', { k: q.kind });
    if (q.status) qb.andWhere('t.status = :s', { s: q.status });
    if (q.q)
      qb.andWhere(
        '(t.code ILIKE :q OR t.name ILIKE :q OR t.phone ILIKE :q OR t.subject ILIKE :q)',
        { q: likeTerm(q.q) },
      );
    return paginate(qb, q, (t) => this.toTicket(t));
  }

  async updateTicket(id: string, dto: TicketUpdate): Promise<SupportTicketDto> {
    const t = await this.tickets.findOneBy({ id });
    if (!t) throw new NotFoundException('Không tìm thấy yêu cầu');
    await this.tickets.save(Object.assign(t, dto));
    const out = await this.tickets
      .createQueryBuilder('t')
      .leftJoinAndMapOne('t.assignee', UserEntity, 'u', 'u.id = t.assignee_id')
      .where('t.id = :id', { id })
      .getOneOrFail();
    return this.toTicket(out);
  }

  private toTicket(
    t: SupportTicketEntity & { assignee?: { id: string; full_name: string } },
  ): SupportTicketDto {
    return {
      id: t.id,
      code: t.code,
      kind: t.kind,
      status: t.status,
      name: t.name,
      phone: t.phone,
      email: t.email,
      subject: t.subject,
      message: t.message,
      booking_id: t.booking_id,
      assignee: t.assignee
        ? { id: t.assignee.id, full_name: t.assignee.full_name }
        : null,
      internal_note: t.internal_note,
      created_at: t.created_at.toISOString(),
      updated_at: t.updated_at.toISOString(),
    };
  }
}
