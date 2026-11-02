import type {
  DriverIncomeDto,
  DriverRunDetailDto,
  ShiftDto,
  ShiftSummaryDto,
  TripRunDto,
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
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { In, IsNull, type Repository } from 'typeorm';
import { DomainError } from '../../common/http/exception.filter';
import { vnDateString } from '../../common/time';
import {
  BookingEntity,
  CargoEntity,
  DriverLocationEntity,
  DriverShiftEntity,
  PushTokenEntity,
  TripBatchEntity,
  TripRunEntity,
  UserEntity,
  VehicleEntity,
  toPoint,
} from '../../database/entities';
import { BookingService } from '../booking/booking.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { RunsService } from './runs.service';

/* ---------------- DTOs ---------------- */

export class DriverRunsQuery {
  @ApiPropertyOptional({
    enum: ['upcoming', 'active', 'done'],
    default: 'upcoming',
  })
  @IsOptional()
  @IsIn(['upcoming', 'active', 'done'])
  scope: 'upcoming' | 'active' | 'done' = 'upcoming';
}

export class PointDto {
  @ApiProperty() @IsLatitude() lat!: number;
  @ApiProperty() @IsLongitude() lng!: number;
}

export class LocationPointDto extends PointDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  speed_kmh?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(360)
  heading?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) accuracy_m?: number;
  @ApiProperty() @IsDateString() recorded_at!: string;
}

export class LocationBatchDto {
  @ApiProperty({
    type: [LocationPointDto],
    description: 'Hàng đợi offline được gửi theo lô',
  })
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => LocationPointDto)
  points!: LocationPointDto[];
}

export class StartShiftDto {
  @ApiPropertyOptional({ type: PointDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PointDto)
  location?: PointDto;
}

export class EndShiftDto {
  @ApiPropertyOptional({ type: PointDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PointDto)
  location?: PointDto;
  @ApiProperty({
    example: {
      vehicle_clean: true,
      fuel_checked: true,
      cash_handed_over: true,
    },
  })
  @IsObject()
  checklist!: Record<string, boolean>;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

export class BookingActionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class PushTokenDto {
  @ApiProperty() @IsString() @MaxLength(255) token!: string;
  @ApiProperty({ enum: ['ios', 'android'] })
  @IsIn(['ios', 'android'])
  platform!: string;
}

export class IncomeQuery {
  @ApiPropertyOptional({ example: '2026-11' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/)
  month?: string;
}

const REQUIRED_CHECKLIST = [
  'vehicle_clean',
  'fuel_checked',
  'cash_handed_over',
];

/* ---------------- service ---------------- */

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(TripRunEntity)
    private readonly runs: Repository<TripRunEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookings: Repository<BookingEntity>,
    @InjectRepository(CargoEntity)
    private readonly cargos: Repository<CargoEntity>,
    @InjectRepository(DriverShiftEntity)
    private readonly shifts: Repository<DriverShiftEntity>,
    @InjectRepository(DriverLocationEntity)
    private readonly locations: Repository<DriverLocationEntity>,
    @InjectRepository(PushTokenEntity)
    private readonly pushTokens: Repository<PushTokenEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly runsService: RunsService,
    private readonly bookingService: BookingService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async me(driverId: string) {
    const u = await this.users.findOne({
      where: { id: driverId },
      relations: {
        driver_profile: { default_vehicle: { vehicle_type: true } },
      },
    });
    if (!u) throw new NotFoundException();
    const shift = await this.currentShift(driverId);
    const v = u.driver_profile?.default_vehicle;
    return {
      id: u.id,
      full_name: u.full_name,
      phone: u.phone,
      avatar_url: u.avatar_url,
      license_number: u.driver_profile?.license_number ?? null,
      license_expires_on: u.driver_profile?.license_expires_on ?? null,
      vehicle: v
        ? {
            id: v.id,
            license_plate: v.license_plate,
            type: v.vehicle_type?.name ?? null,
          }
        : null,
      shift,
    };
  }

  /* ---------- runs ---------- */

  async myRuns(
    driverId: string,
    scope: DriverRunsQuery['scope'],
  ): Promise<TripRunDto[]> {
    const statuses = {
      upcoming: ['DISPATCHED'],
      active: ['IN_PROGRESS'],
      done: ['FINISHED'],
    }[scope];
    const rows = await this.runs
      .createQueryBuilder('run')
      .innerJoinAndSelect('run.vehicle', 'v')
      .innerJoinAndSelect('v.vehicle_type', 'vt')
      .innerJoinAndSelect('run.driver', 'd')
      .innerJoinAndSelect('run.trip_batch', 'tb')
      .where('run.driver_id = :driverId AND run.status IN (:...statuses)', {
        driverId,
        statuses,
      })
      .orderBy('tb.departure_at', scope === 'done' ? 'DESC' : 'ASC')
      .take(scope === 'done' ? 30 : 20)
      .getMany();
    return this.runsService.toDtos(rows);
  }

  async runDetail(
    driverId: string,
    runId: string,
  ): Promise<DriverRunDetailDto> {
    await this.ownRun(driverId, runId);
    return this.runsService.detail(runId);
  }

  async startRun(driverId: string, runId: string): Promise<DriverRunDetailDto> {
    const run = await this.ownRun(driverId, runId);
    if (run.status !== 'DISPATCHED')
      throw new DomainError(
        409,
        'INVALID_TRANSITION',
        'Chỉ bắt đầu được chuyến đã xuất lệnh',
      );
    if (!(await this.currentShift(driverId)))
      throw new DomainError(409, 'NO_SHIFT', 'Hãy bắt đầu ca làm việc trước');
    const other = await this.runs.findOneBy({
      driver_id: driverId,
      status: 'IN_PROGRESS',
    });
    if (other)
      throw new DomainError(
        409,
        'RUN_ACTIVE',
        `Bạn đang chạy chuyến ${other.code}`,
      );
    await this.runs.manager.transaction(async (m) => {
      await m.update(TripRunEntity, runId, {
        status: 'IN_PROGRESS',
        started_at: new Date(),
      });
      await m.update(VehicleEntity, run.vehicle_id, { status: 'IN_USE' });
    });
    await this.runsService.emit(runId);
    return this.runsService.detail(runId);
  }

  async finishRun(
    driverId: string,
    runId: string,
  ): Promise<DriverRunDetailDto> {
    const run = await this.ownRun(driverId, runId);
    if (run.status !== 'IN_PROGRESS')
      throw new DomainError(409, 'INVALID_TRANSITION', 'Chuyến chưa bắt đầu');
    const onBoard = await this.bookings.countBy({
      trip_run_id: runId,
      status: 'PICKED_UP',
    });
    if (onBoard)
      throw new DomainError(
        409,
        'PASSENGERS_ON_BOARD',
        `Còn ${onBoard} vé chưa xác nhận trả khách`,
      );
    const cargoOnBoard = await this.cargos.countBy({
      trip_run_id: runId,
      status: In(['PICKED_UP', 'IN_TRANSIT']),
    });
    if (cargoOnBoard)
      throw new DomainError(
        409,
        'CARGO_ON_BOARD',
        `Còn ${cargoOnBoard} kiện hàng chưa giao`,
      );
    await this.runs.manager.transaction(async (m) => {
      // Passengers never picked up are marked no-show.
      await m.update(
        BookingEntity,
        { trip_run_id: runId, status: 'CONFIRMED' },
        { status: 'NO_SHOW' },
      );
      await m.update(TripRunEntity, runId, {
        status: 'FINISHED',
        finished_at: new Date(),
      });
      await m.update(VehicleEntity, run.vehicle_id, { status: 'AVAILABLE' });
      const open = await m.countBy(TripRunEntity, {
        trip_batch_id: run.trip_batch_id,
        status: In(['PENDING', 'DISPATCHED', 'IN_PROGRESS']),
      });
      if (!open)
        await m.update(TripBatchEntity, run.trip_batch_id, {
          status: 'COMPLETED',
        });
    });
    await this.runsService.emit(runId);
    return this.runsService.detail(runId);
  }

  /** Pickup / drop-off / no-show of a passenger on the driver's active run. */
  async bookingAction(
    driverId: string,
    bookingId: string,
    action: 'pickup' | 'dropoff' | 'no-show',
    reason?: string,
  ) {
    const b = await this.bookings.findOneBy({ id: bookingId });
    if (!b?.trip_run_id) throw new NotFoundException('Không tìm thấy vé');
    const run = await this.ownRun(driverId, b.trip_run_id);
    if (run.status !== 'IN_PROGRESS')
      throw new DomainError(409, 'RUN_NOT_STARTED', 'Hãy bắt đầu chuyến trước');
    const status = (
      {
        pickup: 'PICKED_UP',
        dropoff: 'DROPPED_OFF',
        'no-show': 'NO_SHOW',
      } as const
    )[action];
    const dto = await this.bookingService.changeStatus(
      bookingId,
      status,
      reason,
    );
    this.realtime.toOpsAndDriver(driverId, RealtimeEvents.tripRunUpdated, {
      id: run.id,
    });
    return dto;
  }

  /* ---------- shifts & location ---------- */

  async currentShift(driverId: string): Promise<ShiftDto | null> {
    const s = await this.shifts.findOne({
      where: { driver_id: driverId, ended_at: IsNull() },
      order: { started_at: 'DESC' },
    });
    return s
      ? { id: s.id, started_at: s.started_at.toISOString(), ended_at: null }
      : null;
  }

  async startShift(driverId: string, dto: StartShiftDto): Promise<ShiftDto> {
    const open = await this.currentShift(driverId);
    if (open) return open;
    const s = await this.shifts.save(
      this.shifts.create({
        driver_id: driverId,
        started_at: new Date(),
        start_point: dto.location
          ? toPoint(dto.location.lat, dto.location.lng)
          : null,
      }),
    );
    this.realtime.toOps(RealtimeEvents.shiftChanged, {
      driver_id: driverId,
      on_shift: true,
    });
    return { id: s.id, started_at: s.started_at.toISOString(), ended_at: null };
  }

  async endShift(driverId: string, dto: EndShiftDto): Promise<ShiftSummaryDto> {
    const s = await this.shifts.findOne({
      where: { driver_id: driverId, ended_at: IsNull() },
    });
    if (!s) throw new DomainError(409, 'NO_SHIFT', 'Bạn chưa bắt đầu ca');
    const missing = REQUIRED_CHECKLIST.filter((k) => !dto.checklist[k]);
    if (missing.length)
      throw new DomainError(
        400,
        'CHECKLIST_INCOMPLETE',
        'Hãy hoàn thành checklist cuối ca',
        { missing },
      );
    if (
      await this.runs.existsBy({ driver_id: driverId, status: 'IN_PROGRESS' })
    ) {
      throw new DomainError(
        409,
        'RUN_ACTIVE',
        'Hãy kết thúc chuyến đang chạy trước khi kết ca',
      );
    }
    await this.shifts.update(s.id, {
      ended_at: new Date(),
      end_point: dto.location
        ? toPoint(dto.location.lat, dto.location.lng)
        : null,
      end_checklist: dto.checklist,
      end_note: dto.note ?? null,
    });
    this.realtime.toOps(RealtimeEvents.shiftChanged, {
      driver_id: driverId,
      on_shift: false,
    });
    return this.shiftSummary(driverId, s.id);
  }

  async shiftSummary(
    driverId: string,
    shiftId?: string,
  ): Promise<ShiftSummaryDto> {
    const s = shiftId
      ? await this.shifts.findOneBy({ id: shiftId, driver_id: driverId })
      : await this.shifts.findOne({
          where: { driver_id: driverId },
          order: { started_at: 'DESC' },
        });
    if (!s)
      return {
        shift: null,
        runs_finished: 0,
        passengers_dropped: 0,
        cargos_delivered: 0,
        cod_collected_vnd: 0,
        distance_km: 0,
      };
    const from = s.started_at;
    const to = s.ended_at ?? new Date();
    const runs = await this.runs
      .createQueryBuilder('r')
      .where('r.driver_id = :d AND r.finished_at BETWEEN :from AND :to', {
        d: driverId,
        from,
        to,
      })
      .getCount();
    const pax = await this.bookings
      .createQueryBuilder('b')
      .innerJoin('b.trip_run', 'r')
      .innerJoin('b.seats', 's', 's.is_active')
      .select('COUNT(s.id)', 'n')
      .where(
        "r.driver_id = :d AND b.status = 'DROPPED_OFF' AND b.dropped_off_at BETWEEN :from AND :to",
        { d: driverId, from, to },
      )
      .getRawOne<{ n: string }>();
    const cargo = await this.cargos
      .createQueryBuilder('c')
      .innerJoin('c.trip_run', 'r')
      .select('COUNT(*)', 'n')
      .addSelect(
        'COALESCE(SUM(c.cod_amount_vnd) FILTER (WHERE c.cod_collected_at IS NOT NULL), 0)',
        'cod',
      )
      .where(
        "r.driver_id = :d AND c.status = 'DELIVERED' AND c.delivered_at BETWEEN :from AND :to",
        { d: driverId, from, to },
      )
      .getRawOne<{ n: string; cod: string }>();
    const dist = await this.locations.query(
      `SELECT COALESCE(SUM(ST_Distance(point, prev)), 0) / 1000 AS km FROM (
         SELECT point, LAG(point) OVER (ORDER BY recorded_at) AS prev
         FROM driver_locations WHERE driver_id = $1 AND recorded_at BETWEEN $2 AND $3
       ) t WHERE prev IS NOT NULL`,
      [driverId, from, to],
    );
    return {
      shift: {
        id: s.id,
        started_at: s.started_at.toISOString(),
        ended_at: s.ended_at?.toISOString() ?? null,
      },
      runs_finished: runs,
      passengers_dropped: Number(pax?.n ?? 0),
      cargos_delivered: Number(cargo?.n ?? 0),
      cod_collected_vnd: Number(cargo?.cod ?? 0),
      distance_km: Math.round(Number(dist[0]?.km ?? 0) * 10) / 10,
    };
  }

  /** Batched GPS points (offline queue). Latest point is pushed to the ops room. */
  async recordLocations(
    driverId: string,
    dto: LocationBatchDto,
  ): Promise<{ accepted: number }> {
    if (!dto.points.length) return { accepted: 0 };
    const active = await this.runs.findOneBy({
      driver_id: driverId,
      status: 'IN_PROGRESS',
    });
    const now = Date.now();
    const rows = dto.points
      .filter(
        (p) =>
          Math.abs(now - new Date(p.recorded_at).getTime()) < 24 * 3_600_000,
      )
      .map((p) => ({
        driver_id: driverId,
        trip_run_id: active?.id ?? null,
        point: toPoint(p.lat, p.lng),
        speed_kmh: p.speed_kmh ?? null,
        heading: p.heading ?? null,
        accuracy_m: p.accuracy_m ?? null,
        recorded_at: new Date(p.recorded_at),
      }));
    if (rows.length) await this.locations.insert(rows);
    const last = dto.points.reduce((a, b) =>
      a.recorded_at > b.recorded_at ? a : b,
    );
    this.realtime.driverLocation({
      driver_id: driverId,
      trip_run_id: active?.id ?? null,
      lat: last.lat,
      lng: last.lng,
      speed_kmh: last.speed_kmh ?? null,
      heading: last.heading ?? null,
      recorded_at: last.recorded_at,
    });
    return { accepted: rows.length };
  }

  async registerPushToken(driverId: string, dto: PushTokenDto): Promise<void> {
    await this.pushTokens.upsert(
      { user_id: driverId, token: dto.token, platform: dto.platform },
      ['token'],
    );
  }

  async income(
    driverId: string,
    month = vnDateString().slice(0, 7),
  ): Promise<DriverIncomeDto> {
    const rows = await this.runs.query(
      `SELECT to_char(r.finished_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD') AS date,
              COUNT(DISTINCT r.id)::int AS runs,
              COUNT(s.id) FILTER (WHERE b.status = 'DROPPED_OFF')::int AS passengers
         FROM trip_runs r
         LEFT JOIN bookings b ON b.trip_run_id = r.id
         LEFT JOIN booking_seats s ON s.booking_id = b.id AND s.is_active
        WHERE r.driver_id = $1 AND r.status = 'FINISHED'
          AND to_char(r.finished_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM') = $2
        GROUP BY 1 ORDER BY 1`,
      [driverId, month],
    );
    const cargos = await this.cargos
      .createQueryBuilder('c')
      .innerJoin('c.trip_run', 'r')
      .where(
        "r.driver_id = :d AND c.status = 'DELIVERED' AND to_char(c.delivered_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM') = :month",
        { d: driverId, month },
      )
      .getCount();
    const days = rows as { date: string; runs: number; passengers: number }[];
    const runs = days.reduce((s, d) => s + d.runs, 0);
    const passengers = days.reduce((s, d) => s + d.passengers, 0);
    // Placeholder rate until salary rules are configured in Admin (phase 4).
    return {
      month,
      runs,
      passengers,
      cargos,
      estimated_income_vnd: runs * 300_000 + passengers * 10_000,
      days,
    };
  }

  /* ---------- helpers ---------- */

  private async ownRun(
    driverId: string,
    runId: string,
  ): Promise<TripRunEntity> {
    const run = await this.runs.findOneBy({ id: runId });
    if (!run) throw new NotFoundException('Không tìm thấy chuyến');
    if (run.driver_id !== driverId)
      throw new ForbiddenException({
        code: 'NOT_YOUR_RUN',
        message: 'Chuyến không thuộc về bạn',
      });
    if (run.status === 'PENDING' || run.status === 'CANCELLED')
      throw new NotFoundException('Chuyến chưa được xuất lệnh');
    return run;
  }
}
