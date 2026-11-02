import {
  CARGO_PAYERS,
  CARGO_SIZES,
  CARGO_STATUSES,
  CARGO_TRANSITIONS,
  type CargoDto,
  type CargoPayer,
  type CargoQuoteDto,
  type CargoSize,
  type CargoStatus,
  type CodSettlementDto,
  type Paginated,
} from '@limousine-workspace/shared-types';
import { RealtimeEvents } from '@limousine-workspace/utils-core';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { In, type Repository } from 'typeorm';
import { waybillCode } from '../../common/codes';
import { DomainError } from '../../common/http/exception.filter';
import { ListQueryDto, likeTerm, paginate } from '../../common/http/pagination';
import { assertTransition } from '../../common/state';
import {
  type CargoEntity as CargoRow,
  CargoEntity,
  CodSettlementEntity,
  FinanceTransactionEntity,
  RouteEntity,
  TripBatchEntity,
  TripRunEntity,
  fromPoint,
  toPoint,
} from '../../database/entities';
import { VN_PHONE } from '../auth/auth.dto';
import { PlaceDto } from '../booking/booking.dto';
import { NotifyService } from '../notify/notify.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { SettingsService } from '../settings/settings.service';

const PHONE = { message: 'Số điện thoại không hợp lệ' };

/* ---------------- DTOs ---------------- */

export class CargoQuoteInput {
  @ApiProperty() @IsUUID() route_id!: string;
  @ApiProperty({ enum: CARGO_SIZES }) @IsIn(CARGO_SIZES) size!: CargoSize;
  @ApiProperty() @IsNumber() @Min(0.1) @Max(200) weight_kg!: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() is_fragile?: boolean;
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(200_000_000)
  declared_value_vnd?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50_000_000)
  cod_amount_vnd?: number;
}

export class PartyDto extends PlaceDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(255) name!: string;
  @ApiProperty() @Matches(VN_PHONE, PHONE) phone!: string;
}

export class CreateCargoDto extends CargoQuoteInput {
  @ApiProperty({ type: PartyDto })
  @ValidateNested()
  @Type(() => PartyDto)
  sender!: PartyDto;
  @ApiProperty({ type: PartyDto })
  @ValidateNested()
  @Type(() => PartyDto)
  receiver!: PartyDto;
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  description!: string;
  @ApiPropertyOptional({ enum: CARGO_PAYERS })
  @IsOptional()
  @IsIn(CARGO_PAYERS)
  fee_payer?: CargoPayer;
  @ApiPropertyOptional({ description: 'Gửi theo chuyến cụ thể' })
  @IsOptional()
  @IsUUID()
  trip_batch_id?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

export class TrackCargoQuery {
  @ApiProperty({ example: 'CG-4HX82N' })
  @Matches(/^CG-[0-9A-Z]{6}$/i)
  code!: string;
  @ApiProperty() @Matches(VN_PHONE, PHONE) phone!: string;
}

export class CargoListQuery extends ListQueryDto {
  @ApiPropertyOptional({ enum: CARGO_STATUSES })
  @IsOptional()
  @IsIn(CARGO_STATUSES)
  status?: CargoStatus;
  @ApiPropertyOptional() @IsOptional() @IsUUID() route_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() trip_batch_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() trip_run_id?: string;
  @ApiPropertyOptional({ description: 'Chỉ đơn COD chưa đối soát' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1)
  cod_pending?: number;
}

export class UpdateCargoDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() trip_batch_id?: string | null;
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID()
  trip_run_id?: string | null;
  @ApiPropertyOptional({ enum: CARGO_STATUSES })
  @IsOptional()
  @IsIn(CARGO_STATUSES)
  status?: CargoStatus;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

export class CargoProofDto {
  @ApiPropertyOptional({ description: 'Ảnh xác nhận (URL từ /uploads/proofs)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  proof_photo_url?: string;
  @ApiPropertyOptional({ description: 'Đã thu COD' })
  @IsOptional()
  @IsBoolean()
  cod_collected?: boolean;
}

export class SettleCodDto {
  @ApiProperty() @IsUUID() driver_id!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

/* ---------------- service ---------------- */

@Injectable()
export class CargoService {
  constructor(
    @InjectRepository(CargoEntity)
    private readonly cargos: Repository<CargoEntity>,
    @InjectRepository(CodSettlementEntity)
    private readonly settlements: Repository<CodSettlementEntity>,
    @InjectRepository(RouteEntity)
    private readonly routes: Repository<RouteEntity>,
    @InjectRepository(TripBatchEntity)
    private readonly batches: Repository<TripBatchEntity>,
    @InjectRepository(TripRunEntity)
    private readonly runs: Repository<TripRunEntity>,
    private readonly settings: SettingsService,
    private readonly notify: NotifyService,
    private readonly realtime: RealtimeGateway,
  ) {}

  toDto(c: CargoRow): CargoDto {
    const iso = (d: Date | null) => d?.toISOString() ?? null;
    return {
      id: c.id,
      waybill_code: c.waybill_code,
      status: c.status,
      route: { id: c.route.id, code: c.route.code, name: c.route.name },
      trip_batch_id: c.trip_batch_id,
      trip_run_id: c.trip_run_id,
      sender: {
        name: c.sender_name,
        phone: c.sender_phone,
        address: c.pickup_address,
        location: fromPoint(c.pickup_point) ?? { lat: 0, lng: 0 },
      },
      receiver: {
        name: c.receiver_name,
        phone: c.receiver_phone,
        address: c.dropoff_address,
        location: fromPoint(c.dropoff_point) ?? { lat: 0, lng: 0 },
      },
      description: c.description,
      size: c.size,
      weight_kg: c.weight_kg,
      is_fragile: c.is_fragile,
      declared_value_vnd: c.declared_value_vnd,
      fee_vnd: c.fee_vnd,
      fee_payer: c.fee_payer,
      cod_amount_vnd: c.cod_amount_vnd,
      cod_collected_at: iso(c.cod_collected_at),
      cod_settlement_id: c.cod_settlement_id,
      picked_up_at: iso(c.picked_up_at),
      delivered_at: iso(c.delivered_at),
      proof_photo_url: c.proof_photo_url,
      note: c.note,
      created_at: c.created_at.toISOString(),
    };
  }

  /** Fee from Admin › Cấu hình (cargo.pricing + cod.policy). */
  async quote(q: CargoQuoteInput): Promise<CargoQuoteDto> {
    if (!(await this.routes.existsBy({ id: q.route_id, is_active: true })))
      throw new NotFoundException('Tuyến không hoạt động');
    const p = await this.settings.get('cargo.pricing');
    const cod = await this.settings.get('cod.policy');
    if ((q.cod_amount_vnd ?? 0) > cod.max_cod_vnd)
      throw new DomainError(
        400,
        'COD_TOO_HIGH',
        `COD tối đa ${cod.max_cod_vnd.toLocaleString('vi-VN')} ₫`,
      );
    const lines: { label: string; amount_vnd: number }[] = [
      { label: `Cước gói ${q.size}`, amount_vnd: p.base_fee_vnd[q.size] },
    ];
    const over = Math.max(0, Math.ceil(q.weight_kg - p.included_kg[q.size]));
    if (over)
      lines.push({
        label: `Vượt ${over} kg`,
        amount_vnd: over * p.per_kg_over_vnd,
      });
    if (q.is_fragile)
      lines.push({ label: 'Hàng dễ vỡ', amount_vnd: p.fragile_surcharge_vnd });
    if (q.declared_value_vnd)
      lines.push({
        label: 'Bảo hiểm hàng hóa',
        amount_vnd:
          Math.round((q.declared_value_vnd * p.insurance_pct) / 100 / 1000) *
          1000,
      });
    if (q.cod_amount_vnd)
      lines.push({
        label: 'Phí thu hộ COD',
        amount_vnd: Math.max(
          cod.min_cod_fee_vnd,
          Math.round((q.cod_amount_vnd * cod.cod_fee_pct) / 100 / 1000) * 1000,
        ),
      });
    return {
      fee_vnd: lines.reduce((s, l) => s + l.amount_vnd, 0),
      breakdown: lines,
    };
  }

  async create(dto: CreateCargoDto, createdBy?: string): Promise<CargoDto> {
    const { fee_vnd } = await this.quote(dto);
    if (dto.trip_batch_id) {
      const b = await this.batches.findOneBy({
        id: dto.trip_batch_id,
        route_id: dto.route_id,
      });
      if (!b || ['COMPLETED', 'CANCELLED'].includes(b.status))
        throw new DomainError(
          400,
          'BAD_TRIP',
          'Chuyến không hợp lệ cho tuyến này',
        );
    }
    let code = waybillCode();
    while (await this.cargos.existsBy({ waybill_code: code }))
      code = waybillCode();
    const saved = await this.cargos.save(
      this.cargos.create({
        waybill_code: code,
        route_id: dto.route_id,
        trip_batch_id: dto.trip_batch_id ?? null,
        sender_name: dto.sender.name,
        sender_phone: dto.sender.phone,
        pickup_address: dto.sender.address,
        pickup_point: toPoint(dto.sender.lat, dto.sender.lng),
        receiver_name: dto.receiver.name,
        receiver_phone: dto.receiver.phone,
        dropoff_address: dto.receiver.address,
        dropoff_point: toPoint(dto.receiver.lat, dto.receiver.lng),
        description: dto.description,
        size: dto.size,
        weight_kg: dto.weight_kg,
        is_fragile: dto.is_fragile ?? false,
        declared_value_vnd: dto.declared_value_vnd ?? 0,
        cod_amount_vnd: dto.cod_amount_vnd ?? 0,
        fee_vnd,
        fee_payer: dto.fee_payer ?? 'SENDER',
        note: dto.note ?? null,
        created_by_id: createdBy ?? null,
      }),
    );
    void this.notify.sms(dto.sender.phone, 'cargo_created', {
      waybill: code,
      link: `novalimo.vn/hang/${code}`,
    });
    return this.get(saved.id);
  }

  async track(code: string, phone: string): Promise<CargoDto> {
    const c = await this.cargos.findOne({
      where: { waybill_code: code.toUpperCase() },
      relations: { route: true },
    });
    if (!c || (c.sender_phone !== phone && c.receiver_phone !== phone))
      throw new NotFoundException(
        'Không tìm thấy vận đơn với mã và số điện thoại này',
      );
    return this.toDto(c);
  }

  async get(id: string): Promise<CargoDto> {
    const c = await this.cargos.findOne({
      where: { id },
      relations: { route: true },
    });
    if (!c) throw new NotFoundException('Không tìm thấy vận đơn');
    return this.toDto(c);
  }

  async list(q: CargoListQuery): Promise<Paginated<CargoDto>> {
    const qb = this.cargos
      .createQueryBuilder('c')
      .innerJoinAndSelect('c.route', 'r');
    if (q.status) qb.andWhere('c.status = :s', { s: q.status });
    if (q.route_id) qb.andWhere('c.route_id = :r', { r: q.route_id });
    if (q.trip_batch_id)
      qb.andWhere('c.trip_batch_id = :b', { b: q.trip_batch_id });
    if (q.trip_run_id)
      qb.andWhere('c.trip_run_id = :run', { run: q.trip_run_id });
    if (q.cod_pending)
      qb.andWhere(
        'c.cod_amount_vnd > 0 AND c.cod_collected_at IS NOT NULL AND c.cod_settlement_id IS NULL',
      );
    if (q.q)
      qb.andWhere(
        '(c.waybill_code ILIKE :q OR c.sender_phone ILIKE :q OR c.receiver_phone ILIKE :q OR c.sender_name ILIKE :q OR c.receiver_name ILIKE :q)',
        { q: likeTerm(q.q) },
      );
    return paginate(qb, q, (c) => this.toDto(c), {
      created_at: 'c.created_at',
      fee: 'c.fee_vnd',
      status: 'c.status',
    });
  }

  async update(id: string, dto: UpdateCargoDto): Promise<CargoDto> {
    const c = await this.cargos.findOneBy({ id });
    if (!c) throw new NotFoundException('Không tìm thấy vận đơn');
    if (dto.status)
      assertTransition(CARGO_TRANSITIONS, c.status, dto.status, 'vận đơn');
    if (dto.trip_run_id) {
      const run = await this.runs.findOne({
        where: { id: dto.trip_run_id },
        relations: { trip_batch: true },
      });
      if (!run || run.trip_batch.route_id !== c.route_id)
        throw new DomainError(
          400,
          'BAD_RUN',
          'Chuyến không cùng tuyến với vận đơn',
        );
      if (['FINISHED', 'CANCELLED'].includes(run.status))
        throw new DomainError(409, 'RUN_LOCKED', 'Chuyến đã kết thúc');
      dto.trip_batch_id = run.trip_batch_id;
    }
    Object.assign(c, dto);
    await this.cargos.save(c);
    return this.get(id);
  }

  /* ---------- driver ---------- */

  async driverTasks(driverId: string): Promise<CargoDto[]> {
    const rows = await this.cargos
      .createQueryBuilder('c')
      .innerJoinAndSelect('c.route', 'r')
      .innerJoin('c.trip_run', 'run')
      .where(
        "run.driver_id = :d AND run.status IN ('DISPATCHED', 'IN_PROGRESS') AND c.status NOT IN ('DELIVERED', 'CANCELLED', 'RETURNED')",
        { d: driverId },
      )
      .orderBy('c.created_at', 'ASC')
      .getMany();
    return rows.map((c) => this.toDto(c));
  }

  /** Scan / look up a waybill the driver is carrying. */
  async driverScan(driverId: string, code: string): Promise<CargoDto> {
    const c = await this.cargos.findOne({
      where: { waybill_code: code.toUpperCase() },
      relations: { route: true, trip_run: true },
    });
    if (!c) throw new NotFoundException('Không tìm thấy vận đơn');
    if (c.trip_run?.driver_id !== driverId)
      throw new ForbiddenException({
        code: 'NOT_YOUR_CARGO',
        message: 'Vận đơn không thuộc chuyến của bạn',
      });
    return this.toDto(c);
  }

  async driverAction(
    driverId: string,
    id: string,
    action: 'pickup' | 'deliver' | 'return',
    dto: CargoProofDto,
  ): Promise<CargoDto> {
    const c = await this.cargos.findOne({
      where: { id },
      relations: { trip_run: true },
    });
    if (!c || c.trip_run?.driver_id !== driverId)
      throw new NotFoundException('Không tìm thấy vận đơn');
    if (c.trip_run.status !== 'IN_PROGRESS')
      throw new DomainError(409, 'RUN_NOT_STARTED', 'Hãy bắt đầu chuyến trước');
    const to: CargoStatus =
      action === 'pickup'
        ? 'PICKED_UP'
        : action === 'deliver'
          ? 'DELIVERED'
          : 'RETURNED';
    assertTransition(CARGO_TRANSITIONS, c.status, to, 'vận đơn');
    if (to === 'DELIVERED' && c.cod_amount_vnd > 0 && !dto.cod_collected) {
      throw new DomainError(
        400,
        'COD_REQUIRED',
        `Cần thu COD ${c.cod_amount_vnd.toLocaleString('vi-VN')} ₫ trước khi giao`,
      );
    }
    const now = new Date();
    Object.assign(c, {
      status: to,
      picked_up_at: to === 'PICKED_UP' ? now : c.picked_up_at,
      delivered_at: to === 'DELIVERED' ? now : c.delivered_at,
      cod_collected_at:
        to === 'DELIVERED' && c.cod_amount_vnd > 0 ? now : c.cod_collected_at,
      proof_photo_url: dto.proof_photo_url ?? c.proof_photo_url,
    });
    await this.cargos.save(c);
    this.realtime.toOps(RealtimeEvents.tripRunUpdated, { id: c.trip_run_id });
    return this.get(id);
  }

  /* ---------- COD reconciliation ---------- */

  /** Outstanding COD per driver (collected but not yet settled). */
  async codOutstanding() {
    return this.cargos.query(
      `SELECT r.driver_id, u.full_name AS driver_name, COUNT(*)::int AS cargo_count, SUM(c.cod_amount_vnd)::int AS amount_vnd,
              MIN(c.cod_collected_at) AS oldest_collected_at
         FROM cargos c JOIN trip_runs r ON r.id = c.trip_run_id JOIN users u ON u.id = r.driver_id
        WHERE c.cod_amount_vnd > 0 AND c.cod_collected_at IS NOT NULL AND c.cod_settlement_id IS NULL
        GROUP BY r.driver_id, u.full_name ORDER BY amount_vnd DESC`,
    );
  }

  /** Accountant confirms the driver handed over all collected COD cash. */
  async settle(dto: SettleCodDto, userId: string): Promise<CodSettlementDto> {
    const id = await this.cargos.manager.transaction(async (m) => {
      const rows = await m
        .createQueryBuilder(CargoEntity, 'c')
        .innerJoin('c.trip_run', 'r')
        .where(
          'r.driver_id = :d AND c.cod_amount_vnd > 0 AND c.cod_collected_at IS NOT NULL AND c.cod_settlement_id IS NULL',
          { d: dto.driver_id },
        )
        .setLock('pessimistic_write', undefined, ['c'])
        .getMany();
      if (!rows.length)
        throw new DomainError(
          409,
          'NOTHING_TO_SETTLE',
          'Tài xế không có COD cần đối soát',
        );
      const amount = rows.reduce((s, c) => s + c.cod_amount_vnd, 0);
      const settlement = await m.save(
        m.create(CodSettlementEntity, {
          driver_id: dto.driver_id,
          amount_vnd: amount,
          cargo_count: rows.length,
          status: 'CONFIRMED',
          confirmed_by_id: userId,
          confirmed_at: new Date(),
          note: dto.note ?? null,
        }),
      );
      await m.update(
        CargoEntity,
        { id: In(rows.map((r) => r.id)) },
        { cod_settlement_id: settlement.id },
      );
      await m.insert(FinanceTransactionEntity, {
        kind: 'INCOME',
        category: 'COD',
        amount_vnd: amount,
        occurred_at: new Date(),
        reference_type: 'cod_settlement',
        reference_id: settlement.id,
        memo: `Đối soát COD ${rows.length} đơn`,
        created_by_id: userId,
      });
      return settlement.id;
    });
    return (await this.listSettlements()).find(
      (s) => s.id === id,
    ) as CodSettlementDto;
  }

  async listSettlements(): Promise<CodSettlementDto[]> {
    const rows = await this.settlements.find({
      relations: { driver: true },
      order: { created_at: 'DESC' },
      take: 200,
    });
    return rows.map((s) => ({
      id: s.id,
      driver: { id: s.driver.id, full_name: s.driver.full_name },
      amount_vnd: s.amount_vnd,
      cargo_count: s.cargo_count,
      status: s.status,
      confirmed_at: s.confirmed_at?.toISOString() ?? null,
      note: s.note,
      created_at: s.created_at.toISOString(),
    }));
  }
}
