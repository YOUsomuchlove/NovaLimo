import {
  TRIP_BATCH_STATUSES,
  TRIP_BATCH_TRANSITIONS,
  type Paginated,
  type TripBatchDto,
  type TripBatchStatus,
} from '@limousine-workspace/shared-types';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { type Repository } from 'typeorm';
import { DomainError } from '../../common/http/exception.filter';
import { ListQueryDto, paginate } from '../../common/http/pagination';
import { assertTransition } from '../../common/state';
import {
  addMinutes,
  vnDateString,
  vnDayRange,
  vnLocalToDate,
} from '../../common/time';
import {
  BookingSeatEntity,
  RouteEntity,
  TripBatchEntity,
  VehicleTypeEntity,
} from '../../database/entities';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { type Fare, PricingService } from '../catalog/pricing.service';
import { generateTripBatches } from '../schedule/batch-generator';
import { SeatAvailabilityService } from './seat-availability.service';
import { RealtimeEvents } from '@limousine-workspace/utils-core';

/* ---------------- DTOs ---------------- */

export class SearchTripsQuery {
  @ApiProperty() @IsUUID() route_id!: string;
  @ApiProperty({ example: '2026-11-03', description: 'Ngày đi (giờ Việt Nam)' })
  @IsDateString()
  date!: string;
  @ApiPropertyOptional({ description: 'Số ghế cần (lọc chuyến còn đủ chỗ)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  seats?: number;
}

export class BatchListQuery extends ListQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() route_id?: string;
  @ApiPropertyOptional({ description: 'Từ ngày (VN)' })
  @IsOptional()
  @IsDateString()
  from?: string;
  @ApiPropertyOptional({ description: 'Đến ngày (VN, bao gồm)' })
  @IsOptional()
  @IsDateString()
  to?: string;
  @ApiPropertyOptional({ enum: TRIP_BATCH_STATUSES })
  @IsOptional()
  @IsIn(TRIP_BATCH_STATUSES)
  status?: TripBatchStatus;
}

export class CreateBatchDto {
  @ApiProperty() @IsUUID() route_id!: string;
  @ApiProperty() @IsUUID() vehicle_type_id!: string;
  @ApiProperty({ example: '2026-11-03' }) @IsDateString() date!: string;
  @ApiProperty({ example: '08:30' }) @IsString() time!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  planned_vehicles?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}

export class UpdateBatchDto {
  @ApiPropertyOptional({ enum: TRIP_BATCH_STATUSES })
  @IsOptional()
  @IsIn(TRIP_BATCH_STATUSES)
  status?: TripBatchStatus;
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  planned_vehicles?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(24 * 60)
  sales_close_min?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}

export class GenerateBatchesDto {
  @ApiPropertyOptional({ default: 14 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  days?: number;
}

/* ---------------- service ---------------- */

@Injectable()
export class TripsService {
  private readonly logger = new Logger(TripsService.name);

  constructor(
    @InjectRepository(TripBatchEntity)
    private readonly batches: Repository<TripBatchEntity>,
    @InjectRepository(RouteEntity)
    private readonly routes: Repository<RouteEntity>,
    @InjectRepository(VehicleTypeEntity)
    private readonly types: Repository<VehicleTypeEntity>,
    @InjectRepository(BookingSeatEntity)
    private readonly seats: Repository<BookingSeatEntity>,
    private readonly pricing: PricingService,
    private readonly availability: SeatAvailabilityService,
    private readonly realtime: RealtimeGateway,
  ) {}

  /** Map batches → DTO with seat counts + fares in a constant number of queries. */
  async toDtos(rows: TripBatchEntity[]): Promise<TripBatchDto[]> {
    const sold = await this.availability.soldCounts(rows.map((b) => b.id));
    const fares = new Map<string, Fare | null>();
    for (const b of rows) {
      const key = `${b.route_id}|${b.vehicle_type_id}|${vnDateString(b.departure_at)}`;
      if (!fares.has(key))
        fares.set(
          key,
          await this.pricing.findFare(
            b.route_id,
            b.vehicle_type_id,
            vnDateString(b.departure_at),
          ),
        );
    }
    const now = Date.now();
    return rows.map((b) => {
      const fare =
        fares.get(
          `${b.route_id}|${b.vehicle_type_id}|${vnDateString(b.departure_at)}`,
        ) ?? null;
      const total = b.vehicle_type.capacity * b.planned_vehicles;
      const soldN = sold.get(b.id) ?? 0;
      return {
        id: b.id,
        code: b.code,
        route: {
          id: b.route.id,
          code: b.route.code,
          name: b.route.name,
          origin_name: b.route.origin_name,
          destination_name: b.route.destination_name,
          duration_min: b.route.duration_min,
        },
        departure_at: b.departure_at.toISOString(),
        arrival_eta: b.arrival_eta.toISOString(),
        vehicle_type: {
          id: b.vehicle_type.id,
          code: b.vehicle_type.code,
          name: b.vehicle_type.name,
          capacity: b.vehicle_type.capacity,
        },
        planned_vehicles: b.planned_vehicles,
        status: b.status,
        seats_total: total,
        seats_sold: soldN,
        seats_available: Math.max(0, total - soldN),
        price_vnd: fare?.base_price_vnd ?? 0,
        vip_surcharge_vnd: fare?.vip_surcharge_vnd ?? 0,
        bookable:
          b.status === 'OPEN' &&
          !!fare &&
          addMinutes(b.departure_at, -b.sales_close_min).getTime() > now &&
          total - soldN > 0,
        note: b.note,
      };
    });
  }

  private baseQuery() {
    return this.batches
      .createQueryBuilder('b')
      .innerJoinAndSelect('b.route', 'r')
      .innerJoinAndSelect('b.vehicle_type', 'vt');
  }

  /* ---------- public ---------- */

  async search(q: SearchTripsQuery): Promise<TripBatchDto[]> {
    const { from, to } = vnDayRange(q.date.slice(0, 10));
    const rows = await this.baseQuery()
      .where(
        'b.route_id = :route AND b.departure_at >= :from AND b.departure_at < :to',
        { route: q.route_id, from, to },
      )
      .andWhere("b.status IN ('OPEN', 'CLOSED', 'CLUSTERED', 'DISPATCHED')")
      .andWhere('r.is_active AND r.deleted_at IS NULL')
      .orderBy('b.departure_at', 'ASC')
      .getMany();
    const dtos = await this.toDtos(rows);
    return q.seats
      ? dtos.filter((d) => d.seats_available >= (q.seats ?? 1))
      : dtos;
  }

  async getPublic(id: string): Promise<TripBatchDto> {
    const b = await this.baseQuery().where('b.id = :id', { id }).getOne();
    if (!b || b.status === 'CANCELLED')
      throw new NotFoundException('Không tìm thấy chuyến');
    return (await this.toDtos([b]))[0];
  }

  /* ---------- admin ---------- */

  async list(q: BatchListQuery): Promise<Paginated<TripBatchDto>> {
    const qb = this.baseQuery();
    if (q.route_id) qb.andWhere('b.route_id = :route', { route: q.route_id });
    if (q.status) qb.andWhere('b.status = :status', { status: q.status });
    if (q.from)
      qb.andWhere('b.departure_at >= :from', {
        from: vnDayRange(q.from.slice(0, 10)).from,
      });
    if (q.to)
      qb.andWhere('b.departure_at < :to', {
        to: vnDayRange(q.to.slice(0, 10)).to,
      });
    if (q.q)
      qb.andWhere('(b.code ILIKE :q OR r.name ILIKE :q)', { q: `%${q.q}%` });
    const page = await paginate(
      qb,
      q,
      (b) => b,
      { departure_at: 'b.departure_at', code: 'b.code' },
      ['b.departure_at', 'ASC'],
    );
    return { ...page, items: await this.toDtos(page.items) };
  }

  async create(dto: CreateBatchDto): Promise<TripBatchDto> {
    const route = await this.routes.findOneBy({ id: dto.route_id });
    if (!route) throw new NotFoundException('Không tìm thấy tuyến');
    if (!(await this.types.existsBy({ id: dto.vehicle_type_id })))
      throw new NotFoundException('Không tìm thấy loại xe');
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(dto.time))
      throw new DomainError(400, 'BAD_TIME', 'Giờ khởi hành không hợp lệ');
    const departure = vnLocalToDate(dto.date.slice(0, 10), dto.time);
    if (departure <= new Date())
      throw new DomainError(400, 'IN_PAST', 'Giờ khởi hành phải ở tương lai');
    const b = await this.batches.save(
      this.batches.create({
        code: `${route.code}-${dto.date.slice(2, 10).replace(/-/g, '')}-${dto.time.replace(':', '')}-X`,
        route_id: route.id,
        vehicle_type_id: dto.vehicle_type_id,
        departure_at: departure,
        arrival_eta: addMinutes(departure, route.duration_min),
        planned_vehicles: dto.planned_vehicles ?? 1,
        note: dto.note ?? null,
      }),
    );
    return this.get(b.id);
  }

  async get(id: string): Promise<TripBatchDto> {
    const b = await this.baseQuery().where('b.id = :id', { id }).getOne();
    if (!b) throw new NotFoundException('Không tìm thấy lô chuyến');
    return (await this.toDtos([b]))[0];
  }

  async update(id: string, dto: UpdateBatchDto): Promise<TripBatchDto> {
    const b = await this.batches.findOne({
      where: { id },
      relations: { vehicle_type: true },
    });
    if (!b) throw new NotFoundException('Không tìm thấy lô chuyến');
    if (dto.status && dto.status !== b.status) {
      assertTransition(
        TRIP_BATCH_TRANSITIONS,
        b.status,
        dto.status,
        'lô chuyến',
      );
      if (dto.status === 'CANCELLED') {
        const active = await this.seats.countBy({
          trip_batch_id: id,
          is_active: true,
        });
        if (active > 0)
          throw new DomainError(
            409,
            'HAS_BOOKINGS',
            `Còn ${active} ghế đã bán — hãy hủy/đổi vé trước`,
          );
      }
    }
    if (
      dto.planned_vehicles !== undefined &&
      dto.planned_vehicles < b.planned_vehicles
    ) {
      const maxPerLabel = await this.seats
        .createQueryBuilder('s')
        .select('COUNT(*)', 'n')
        .where({ trip_batch_id: id, is_active: true })
        .groupBy('s.seat_label')
        .orderBy('n', 'DESC')
        .limit(1)
        .getRawOne<{ n: string }>();
      if (Number(maxPerLabel?.n ?? 0) > dto.planned_vehicles) {
        throw new DomainError(
          409,
          'TOO_FEW_VEHICLES',
          'Số xe dự kiến ít hơn số ghế đã bán cho một vị trí',
        );
      }
    }
    await this.batches.save(Object.assign(b, dto));
    this.realtime.toOps(RealtimeEvents.tripBatchUpdated, {
      id,
      status: b.status,
    });
    void this.availability.broadcast(id);
    return this.get(id);
  }

  async generate(days = 14): Promise<{ created: number }> {
    const created = await generateTripBatches(this.batches.manager, { days });
    return { created };
  }

  /** Nightly: keep two weeks of departures on sale. */
  @Cron('0 15 1 * * *', {
    timeZone: 'Asia/Ho_Chi_Minh',
    name: 'generate-trip-batches',
  })
  async nightlyGenerate() {
    try {
      const { created } = await this.generate(14);
      this.logger.log(`Generated ${created} trip batches`);
    } catch (e) {
      this.logger.error(e, 'Trip batch generation failed');
    }
  }
}
