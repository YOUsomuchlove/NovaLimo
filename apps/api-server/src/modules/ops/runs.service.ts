import {
  TRIP_RUN_STATUSES,
  TRIP_RUN_TRANSITIONS,
  type DriverRunDetailDto,
  type DriverStopDto,
  type Paginated,
  type TripRunDto,
  type TripRunStatus,
} from '@limousine-workspace/shared-types';
import { RealtimeEvents } from '@limousine-workspace/utils-core';
import { planDispatchClusters } from '@limousine-workspace/utils-map';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { type EntityManager, In, Not, type Repository } from 'typeorm';
import { randomCode } from '../../common/codes';
import { DomainError } from '../../common/http/exception.filter';
import { ListQueryDto, paginate } from '../../common/http/pagination';
import { assertTransition } from '../../common/state';
import { addMinutes, vnDayRange } from '../../common/time';
import {
  BookingEntity,
  BookingSeatEntity,
  CargoEntity,
  TripBatchEntity,
  TripRunEntity,
  UserEntity,
  VehicleEntity,
  fromPoint,
} from '../../database/entities';
import { NotifyService } from '../notify/notify.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

/* ---------------- DTOs ---------------- */

export class RunListQuery extends ListQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() trip_batch_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() driver_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() vehicle_id?: string;
  @ApiPropertyOptional({ enum: TRIP_RUN_STATUSES })
  @IsOptional()
  @IsIn(TRIP_RUN_STATUSES)
  status?: TripRunStatus;
  @ApiPropertyOptional({ description: 'Ngày khởi hành (VN)' })
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class CreateRunDto {
  @ApiProperty() @IsUUID() trip_batch_id!: string;
  @ApiProperty() @IsUUID() vehicle_id!: string;
  @ApiProperty() @IsUUID() driver_id!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}

export class UpdateRunDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() vehicle_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() driver_id?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}

export class AssignBookingsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(100)
  @IsUUID('4', { each: true })
  booking_ids!: string[];
  @ApiProperty({ nullable: true, description: 'null = trả về hàng chờ' })
  @IsOptional()
  @IsUUID()
  trip_run_id!: string | null;
  @ApiPropertyOptional({
    description: 'Bỏ qua cảnh báo vượt sức chứa / trùng ghế',
  })
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}

export class OrderStopsDto {
  @ApiProperty({ type: [String], description: 'booking ids theo thứ tự đón' })
  @IsArray()
  @IsUUID('4', { each: true })
  pickup!: string[];
  @ApiProperty({ type: [String], description: 'booking ids theo thứ tự trả' })
  @IsArray()
  @IsUUID('4', { each: true })
  dropoff!: string[];
}

const ACTIVE_BOOKING = [
  'CONFIRMED',
  'PICKED_UP',
  'DROPPED_OFF',
  'NO_SHOW',
  'PENDING_PAYMENT',
] as const;

/* ---------------- service ---------------- */

@Injectable()
export class RunsService {
  constructor(
    @InjectRepository(TripRunEntity)
    private readonly runs: Repository<TripRunEntity>,
    @InjectRepository(TripBatchEntity)
    private readonly batches: Repository<TripBatchEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookings: Repository<BookingEntity>,
    @InjectRepository(CargoEntity)
    private readonly cargos: Repository<CargoEntity>,
    @InjectRepository(VehicleEntity)
    private readonly vehicles: Repository<VehicleEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly realtime: RealtimeGateway,
    private readonly notify: NotifyService,
  ) {}

  /* ---------- mapping ---------- */

  async toDtos(rows: TripRunEntity[]): Promise<TripRunDto[]> {
    if (!rows.length) return [];
    const ids = rows.map((r) => r.id);
    const pax = await this.bookings.manager
      .getRepository(BookingSeatEntity)
      .createQueryBuilder('s')
      .innerJoin('s.booking', 'b')
      .select('b.trip_run_id', 'id')
      .addSelect('COUNT(*)', 'n')
      .where('b.trip_run_id IN (:...ids) AND s.is_active', { ids })
      .groupBy('b.trip_run_id')
      .getRawMany<{ id: string; n: string }>();
    const cargo = await this.cargos
      .createQueryBuilder('c')
      .select('c.trip_run_id', 'id')
      .addSelect('COUNT(*)', 'n')
      .where("c.trip_run_id IN (:...ids) AND c.status <> 'CANCELLED'", { ids })
      .groupBy('c.trip_run_id')
      .getRawMany<{ id: string; n: string }>();
    const paxBy = new Map(pax.map((r) => [r.id, Number(r.n)]));
    const cargoBy = new Map(cargo.map((r) => [r.id, Number(r.n)]));
    return rows.map((r) => ({
      id: r.id,
      code: r.code,
      trip_batch_id: r.trip_batch_id,
      status: r.status,
      vehicle: {
        id: r.vehicle.id,
        license_plate: r.vehicle.license_plate,
        capacity: r.vehicle.vehicle_type?.capacity ?? 0,
      },
      driver: {
        id: r.driver.id,
        full_name: r.driver.full_name,
        phone: r.driver.phone,
        avatar_url: r.driver.avatar_url,
      },
      passenger_count: paxBy.get(r.id) ?? 0,
      cargo_count: cargoBy.get(r.id) ?? 0,
      dispatched_at: r.dispatched_at?.toISOString() ?? null,
      started_at: r.started_at?.toISOString() ?? null,
      finished_at: r.finished_at?.toISOString() ?? null,
      planned_distance_km: r.planned_distance_km,
    }));
  }

  private runQuery(m: EntityManager = this.runs.manager) {
    return m
      .createQueryBuilder(TripRunEntity, 'run')
      .innerJoinAndSelect('run.vehicle', 'v')
      .innerJoinAndSelect('v.vehicle_type', 'vt')
      .innerJoinAndSelect('run.driver', 'd')
      .innerJoinAndSelect('run.trip_batch', 'tb')
      .innerJoinAndSelect('tb.route', 'r');
  }

  async findOr404(id: string, m?: EntityManager): Promise<TripRunEntity> {
    const run = await this.runQuery(m).where('run.id = :id', { id }).getOne();
    if (!run) throw new NotFoundException('Không tìm thấy chuyến chạy');
    return run;
  }

  /** Run + ordered pickup/drop-off stops (bookings and cargo) — manifest, driver app, monitor. */
  async detail(id: string): Promise<DriverRunDetailDto> {
    const run = await this.findOr404(id);
    const [dto] = await this.toDtos([run]);
    const bookings = await this.bookings.find({
      where: { trip_run_id: id, status: In([...ACTIVE_BOOKING]) },
      relations: { seats: true },
      order: { pickup_order: 'ASC' },
    });
    const cargos = await this.cargos.find({
      where: { trip_run_id: id, status: Not('CANCELLED') },
    });
    const big = 10_000;
    const stops: DriverStopDto[] = [
      ...bookings.map((b) => ({
        ref_id: b.id,
        ref_type: 'BOOKING' as const,
        kind: 'PICKUP' as const,
        order: b.pickup_order,
        name: b.contact_name,
        phone: b.contact_phone,
        address: b.pickup_address,
        location: fromPoint(b.pickup_point) ?? { lat: 0, lng: 0 },
        seats: (b.seats ?? [])
          .filter((s) => s.is_active)
          .map((s) => s.seat_label)
          .sort(),
        status: b.status,
        note: b.note,
      })),
      ...cargos.map((c) => ({
        ref_id: c.id,
        ref_type: 'CARGO' as const,
        kind: 'PICKUP' as const,
        order: null,
        name: c.sender_name,
        phone: c.sender_phone,
        address: c.pickup_address,
        location: fromPoint(c.pickup_point) ?? { lat: 0, lng: 0 },
        seats: [],
        status: c.status,
        note: c.description,
      })),
      ...bookings.map((b) => ({
        ref_id: b.id,
        ref_type: 'BOOKING' as const,
        kind: 'DROPOFF' as const,
        order: b.dropoff_order === null ? null : big + b.dropoff_order,
        name: b.contact_name,
        phone: b.contact_phone,
        address: b.dropoff_address,
        location: fromPoint(b.dropoff_point) ?? { lat: 0, lng: 0 },
        seats: (b.seats ?? [])
          .filter((s) => s.is_active)
          .map((s) => s.seat_label)
          .sort(),
        status: b.status,
        note: null,
      })),
      ...cargos.map((c) => ({
        ref_id: c.id,
        ref_type: 'CARGO' as const,
        kind: 'DROPOFF' as const,
        order: null,
        name: c.receiver_name,
        phone: c.receiver_phone,
        address: c.dropoff_address,
        location: fromPoint(c.dropoff_point) ?? { lat: 0, lng: 0 },
        seats: [],
        status: c.status,
        note: c.description,
        cod_amount_vnd: c.cod_amount_vnd,
      })),
    ];
    // Pickups first (by order, unordered last), then drop-offs.
    const rank = (s: DriverStopDto) =>
      (s.kind === 'PICKUP' ? 0 : 2 * big) + (s.order ?? big - 1);
    stops.sort((a, b) => rank(a) - rank(b));
    for (const s of stops)
      if (s.order !== null && s.order >= big) s.order -= big;

    return {
      ...dto,
      trip: {
        id: run.trip_batch.id,
        code: run.trip_batch.code,
        route: {
          id: run.trip_batch.route.id,
          code: run.trip_batch.route.code,
          name: run.trip_batch.route.name,
          origin_name: run.trip_batch.route.origin_name,
          destination_name: run.trip_batch.route.destination_name,
          duration_min: run.trip_batch.route.duration_min,
        },
        departure_at: run.trip_batch.departure_at.toISOString(),
        arrival_eta: run.trip_batch.arrival_eta.toISOString(),
      },
      stops,
    };
  }

  /* ---------- admin CRUD ---------- */

  async list(q: RunListQuery): Promise<Paginated<TripRunDto>> {
    const qb = this.runQuery();
    if (q.trip_batch_id)
      qb.andWhere('run.trip_batch_id = :tb', { tb: q.trip_batch_id });
    if (q.driver_id) qb.andWhere('run.driver_id = :d', { d: q.driver_id });
    if (q.vehicle_id) qb.andWhere('run.vehicle_id = :v', { v: q.vehicle_id });
    if (q.status) qb.andWhere('run.status = :s', { s: q.status });
    if (q.date) {
      const { from, to } = vnDayRange(q.date.slice(0, 10));
      qb.andWhere('tb.departure_at >= :from AND tb.departure_at < :to', {
        from,
        to,
      });
    }
    if (q.q)
      qb.andWhere(
        '(run.code ILIKE :q OR v.license_plate ILIKE :q OR d.full_name ILIKE :q)',
        { q: `%${q.q}%` },
      );
    const page = await paginate(
      qb,
      q,
      (r) => r,
      { departure_at: 'tb.departure_at', code: 'run.code' },
      ['tb.departure_at', 'ASC'],
    );
    return { ...page, items: await this.toDtos(page.items) };
  }

  async create(dto: CreateRunDto): Promise<TripRunDto> {
    const batch = await this.batches.findOneBy({ id: dto.trip_batch_id });
    if (!batch) throw new NotFoundException('Không tìm thấy lô chuyến');
    if (['COMPLETED', 'CANCELLED'].includes(batch.status))
      throw new DomainError(409, 'BATCH_CLOSED', 'Lô chuyến đã đóng');
    await this.assertResources(batch, dto.vehicle_id, dto.driver_id);
    const run = await this.runs.save(
      this.runs.create({
        ...dto,
        code: `R-${batch.code.split('-').slice(0, 3).join('')}-${randomCode(3)}`,
      }),
    );
    return this.emit(run.id);
  }

  async update(id: string, dto: UpdateRunDto): Promise<TripRunDto> {
    const run = await this.findOr404(id);
    if (!['PENDING', 'DISPATCHED'].includes(run.status))
      throw new DomainError(
        409,
        'RUN_LOCKED',
        'Chuyến đã chạy, không thể đổi xe/tài xế',
      );
    if (dto.vehicle_id || dto.driver_id) {
      await this.assertResources(
        run.trip_batch,
        dto.vehicle_id ?? run.vehicle_id,
        dto.driver_id ?? run.driver_id,
        run.id,
      );
    }
    const previousDriver = run.driver_id;
    await this.runs.update(id, {
      vehicle_id: dto.vehicle_id ?? run.vehicle_id,
      driver_id: dto.driver_id ?? run.driver_id,
      note: dto.note ?? run.note,
    });
    if (
      dto.driver_id &&
      dto.driver_id !== previousDriver &&
      run.status === 'DISPATCHED'
    ) {
      this.realtime.toDriver(previousDriver, RealtimeEvents.tripRunUpdated, {
        id,
        status: 'CANCELLED',
      });
      void this.notify.inApp(
        dto.driver_id,
        'run_assigned',
        'Bạn có chuyến mới',
        `Chuyến ${run.code} · ${run.trip_batch.route.name}`,
        { run_id: id },
      );
    }
    return this.emit(id);
  }

  async remove(id: string): Promise<void> {
    const run = await this.findOr404(id);
    if (run.status !== 'PENDING')
      throw new DomainError(
        409,
        'RUN_LOCKED',
        'Chỉ xóa được chuyến chưa xuất lệnh',
      );
    await this.runs.manager.transaction(async (m) => {
      await m.update(
        BookingEntity,
        { trip_run_id: id },
        { trip_run_id: null, pickup_order: null, dropoff_order: null },
      );
      await m.update(CargoEntity, { trip_run_id: id }, { trip_run_id: null });
      await m.delete(TripRunEntity, id);
    });
    this.realtime.toOps(RealtimeEvents.tripRunUpdated, { id, deleted: true });
  }

  /** Staff status changes: dispatch (send order to driver), back to pending, cancel. */
  async setStatus(id: string, status: TripRunStatus): Promise<TripRunDto> {
    const run = await this.findOr404(id);
    assertTransition(TRIP_RUN_TRANSITIONS, run.status, status, 'chuyến chạy');
    if (status === 'DISPATCHED') {
      const n = await this.bookings.countBy({
        trip_run_id: id,
        status: In(['CONFIRMED', 'PENDING_PAYMENT']),
      });
      const c = await this.cargos.countBy({
        trip_run_id: id,
        status: 'CREATED',
      });
      if (n + c === 0)
        throw new DomainError(
          409,
          'EMPTY_RUN',
          'Chuyến chưa có khách hoặc hàng',
        );
      await this.runs.update(id, { status, dispatched_at: new Date() });
      void this.notify.inApp(
        run.driver_id,
        'run_dispatched',
        'Lệnh chạy mới',
        `${run.trip_batch.route.name} · ${run.code}`,
        { run_id: id },
      );
    } else if (status === 'CANCELLED') {
      await this.runs.manager.transaction(async (m) => {
        await m.update(
          BookingEntity,
          { trip_run_id: id },
          { trip_run_id: null, pickup_order: null, dropoff_order: null },
        );
        await m.update(CargoEntity, { trip_run_id: id }, { trip_run_id: null });
        await m.update(TripRunEntity, id, { status });
      });
    } else {
      await this.runs.update(id, { status });
    }
    return this.emit(id);
  }

  /* ---------- manual dispatch ---------- */

  /** Move bookings between runs of the same batch (or back to the queue), with capacity checks. */
  async assign(dto: AssignBookingsDto): Promise<{ warnings: string[] }> {
    return this.runs.manager.transaction(async (m) => {
      const bookings = await m.find(BookingEntity, {
        where: { id: In(dto.booking_ids) },
        relations: { seats: true },
      });
      if (bookings.length !== dto.booking_ids.length)
        throw new NotFoundException('Có vé không tồn tại');
      if (
        bookings.some(
          (b) => !['CONFIRMED', 'PENDING_PAYMENT'].includes(b.status),
        )
      ) {
        throw new DomainError(
          409,
          'BOOKING_LOCKED',
          'Chỉ xếp được vé chưa đón khách',
        );
      }
      const warnings: string[] = [];
      if (dto.trip_run_id) {
        const run = await this.findOr404(dto.trip_run_id, m);
        if (!['PENDING', 'DISPATCHED'].includes(run.status))
          throw new DomainError(409, 'RUN_LOCKED', 'Chuyến đã chạy');
        if (bookings.some((b) => b.trip_batch_id !== run.trip_batch_id))
          throw new DomainError(
            400,
            'BATCH_MISMATCH',
            'Vé và chuyến phải cùng lô chuyến',
          );

        const existing = await m.find(BookingEntity, {
          where: {
            trip_run_id: run.id,
            id: Not(In(dto.booking_ids)),
            status: In(['CONFIRMED', 'PENDING_PAYMENT', 'PICKED_UP']),
          },
          relations: { seats: true },
        });
        const seatsOf = (list: BookingEntity[]) =>
          list.flatMap((b) =>
            (b.seats ?? []).filter((s) => s.is_active).map((s) => s.seat_label),
          );
        const all = [...seatsOf(existing), ...seatsOf(bookings)];
        const capacity = run.vehicle.vehicle_type.capacity;
        if (all.length > capacity)
          warnings.push(`Vượt sức chứa: ${all.length}/${capacity} ghế`);
        const dupes = [...new Set(all.filter((l, i) => all.indexOf(l) !== i))];
        if (dupes.length)
          warnings.push(`Trùng vị trí ghế trên cùng xe: ${dupes.join(', ')}`);
        if (warnings.length && !dto.force)
          throw new DomainError(409, 'CAPACITY_WARNING', warnings.join('; '), {
            warnings,
          });

        const maxPickup = Math.max(
          0,
          ...existing.map((b) => b.pickup_order ?? 0),
        );
        const maxDrop = Math.max(
          0,
          ...existing.map((b) => b.dropoff_order ?? 0),
        );
        for (const [i, b] of bookings.entries()) {
          await m.update(BookingEntity, b.id, {
            trip_run_id: run.id,
            pickup_order: maxPickup + i + 1,
            dropoff_order: maxDrop + i + 1,
          });
        }
        if (run.status === 'DISPATCHED')
          void this.notify.inApp(
            run.driver_id,
            'run_changed',
            'Chuyến được cập nhật',
            `Thêm ${bookings.length} khách vào ${run.code}`,
            { run_id: run.id },
          );
      } else {
        await m.update(
          BookingEntity,
          { id: In(dto.booking_ids) },
          { trip_run_id: null, pickup_order: null, dropoff_order: null },
        );
      }
      const touchedRuns = new Set(
        [dto.trip_run_id, ...bookings.map((b) => b.trip_run_id)].filter(
          Boolean,
        ) as string[],
      );
      for (const runId of touchedRuns)
        this.realtime.toOps(RealtimeEvents.tripRunUpdated, { id: runId });
      return { warnings };
    });
  }

  async reorder(id: string, dto: OrderStopsDto): Promise<DriverRunDetailDto> {
    const run = await this.findOr404(id);
    if (run.status === 'FINISHED' || run.status === 'CANCELLED')
      throw new DomainError(409, 'RUN_LOCKED', 'Chuyến đã kết thúc');
    const onRun = new Set(
      (
        await this.bookings.find({
          where: { trip_run_id: id },
          select: { id: true },
        })
      ).map((b) => b.id),
    );
    if ([...dto.pickup, ...dto.dropoff].some((b) => !onRun.has(b)))
      throw new DomainError(400, 'NOT_ON_RUN', 'Có vé không thuộc chuyến này');
    await this.runs.manager.transaction(async (m) => {
      for (const [i, b] of dto.pickup.entries())
        await m.update(BookingEntity, b, { pickup_order: i + 1 });
      for (const [i, b] of dto.dropoff.entries())
        await m.update(BookingEntity, b, { dropoff_order: i + 1 });
    });
    this.realtime.toOpsAndDriver(run.driver_id, RealtimeEvents.tripRunUpdated, {
      id,
    });
    return this.detail(id);
  }

  /** Everything the dispatch board needs for one batch in a single call. */
  async board(batchId: string) {
    const batch = await this.batches.findOne({
      where: { id: batchId },
      relations: { route: true, vehicle_type: true },
    });
    if (!batch) throw new NotFoundException('Không tìm thấy lô chuyến');
    const runs = await this.runQuery()
      .where('run.trip_batch_id = :id', { id: batchId })
      .andWhere("run.status <> 'CANCELLED'")
      .orderBy('run.code')
      .getMany();
    const bookings = await this.bookings.find({
      where: {
        trip_batch_id: batchId,
        status: In([
          'PENDING_PAYMENT',
          'CONFIRMED',
          'PICKED_UP',
          'DROPPED_OFF',
        ]),
      },
      relations: { seats: true },
      order: { pickup_order: 'ASC', created_at: 'ASC' },
    });
    const mapBooking = (b: BookingEntity) => ({
      id: b.id,
      code: b.code,
      status: b.status,
      payment_status: b.payment_status,
      trip_run_id: b.trip_run_id,
      contact_name: b.contact_name,
      contact_phone: b.contact_phone,
      pickup_address: b.pickup_address,
      pickup: fromPoint(b.pickup_point),
      dropoff_address: b.dropoff_address,
      dropoff: fromPoint(b.dropoff_point),
      pickup_order: b.pickup_order,
      dropoff_order: b.dropoff_order,
      seats: (b.seats ?? [])
        .filter((s) => s.is_active)
        .map((s) => s.seat_label)
        .sort(),
      note: b.note,
    });
    return {
      batch: {
        id: batch.id,
        code: batch.code,
        status: batch.status,
        departure_at: batch.departure_at.toISOString(),
        route: batch.route.name,
        capacity_per_vehicle: batch.vehicle_type.capacity,
        planned_vehicles: batch.planned_vehicles,
      },
      runs: await this.toDtos(runs),
      bookings: bookings.map(mapBooking),
    };
  }

  /**
   * Smart Dispatch (PostGIS coordinates + CVRP clustering + 2-opt TSP stop ordering).
   * Auto-provisions PENDING runs if the batch has none yet and available fleet/drivers exist.
   */
  async autoPlan(batchId: string) {
    const batch = await this.batches.findOne({
      where: { id: batchId },
      relations: { route: true, vehicle_type: true },
    });
    if (!batch) throw new NotFoundException('Không tìm thấy lô chuyến');
    if (['COMPLETED', 'CANCELLED'].includes(batch.status)) {
      throw new DomainError(409, 'BATCH_CLOSED', 'Lô chuyến đã đóng');
    }

    let runs = await this.runQuery()
      .where('run.trip_batch_id = :id', { id: batchId })
      .andWhere("run.status IN ('PENDING', 'DISPATCHED')")
      .orderBy('run.code')
      .getMany();

    if (runs.length === 0) {
      const vehicles = await this.vehicles.find({
        where: { status: In(['AVAILABLE', 'IN_USE']) },
        relations: { vehicle_type: true },
        order: { created_at: 'ASC' },
      });
      // Prefer vehicles matching the batch's vehicle_type_id first
      vehicles.sort(
        (a, b) =>
          (a.vehicle_type_id === batch.vehicle_type_id ? 0 : 1) -
          (b.vehicle_type_id === batch.vehicle_type_id ? 0 : 1),
      );
      const drivers = await this.users.find({
        where: { kind: 'DRIVER', status: 'ACTIVE' },
        order: { created_at: 'ASC' },
      });

      const targetCount = Math.max(1, batch.planned_vehicles);
      let created = 0;
      for (const v of vehicles) {
        if (created >= targetCount) break;
        for (const d of drivers) {
          try {
            await this.assertResources(batch, v.id, d.id);
            await this.runs.save(
              this.runs.create({
                trip_batch_id: batch.id,
                vehicle_id: v.id,
                driver_id: d.id,
                code: `R-${batch.code.split('-').slice(0, 3).join('')}-${randomCode(3)}`,
              }),
            );
            created++;
            break;
          } catch {
            // Skip clashing vehicle or driver
          }
        }
      }

      runs = await this.runQuery()
        .where('run.trip_batch_id = :id', { id: batchId })
        .andWhere("run.status IN ('PENDING', 'DISPATCHED')")
        .orderBy('run.code')
        .getMany();
    }

    const bookings = await this.bookings.find({
      where: {
        trip_batch_id: batchId,
        status: In(['PENDING_PAYMENT', 'CONFIRMED']),
      },
      relations: { seats: true },
      order: { created_at: 'ASC' },
    });

    const plan = planDispatchClusters(
      bookings.map((b) => ({
        id: b.id,
        seats: (b.seats ?? [])
          .filter((s) => s.is_active)
          .map((s) => s.seat_label),
        pickup: fromPoint(b.pickup_point),
        dropoff: fromPoint(b.dropoff_point),
      })),
      runs.map((r) => ({
        id: r.id,
        capacity:
          r.vehicle.vehicle_type?.capacity ?? batch.vehicle_type.capacity,
      })),
    );

    await this.runs.manager.transaction(async (m) => {
      for (const pr of plan.runs) {
        await m.update(TripRunEntity, pr.run_id, {
          planned_distance_km: pr.planned_distance_km,
        });
        const dropIndex = new Map(
          pr.dropoff_order.map((id, idx) => [id, idx + 1]),
        );
        for (const [idx, bookingId] of pr.pickup_order.entries()) {
          await m.update(BookingEntity, bookingId, {
            trip_run_id: pr.run_id,
            pickup_order: idx + 1,
            dropoff_order: dropIndex.get(bookingId) ?? idx + 1,
          });
        }
      }
      if (plan.unassigned.length > 0) {
        await m.update(
          BookingEntity,
          { id: In(plan.unassigned.map((u) => u.booking_id)) },
          { trip_run_id: null, pickup_order: null, dropoff_order: null },
        );
      }
      if (
        batch.status === 'OPEN' &&
        plan.runs.some((r) => r.booking_ids.length > 0)
      ) {
        await m.update(TripBatchEntity, batch.id, { status: 'CLUSTERED' });
      }
    });

    for (const r of runs) {
      this.realtime.toOps(RealtimeEvents.tripRunUpdated, { id: r.id });
    }

    return {
      board: await this.board(batchId),
      unassigned: plan.unassigned,
      runs_planned: plan.runs.length,
    };
  }

  /* ---------- helpers ---------- */

  /** Vehicle & driver must be usable and not double-booked around this departure. */
  private async assertResources(
    batch: TripBatchEntity,
    vehicleId: string,
    driverId: string,
    exceptRunId?: string,
  ) {
    const vehicle = await this.vehicles.findOneBy({ id: vehicleId });
    if (!vehicle) throw new NotFoundException('Không tìm thấy xe');
    if (vehicle.status === 'MAINTENANCE' || vehicle.status === 'INACTIVE')
      throw new DomainError(
        409,
        'VEHICLE_UNAVAILABLE',
        `Xe ${vehicle.license_plate} đang bảo dưỡng / ngừng hoạt động`,
      );
    const driver = await this.users.findOneBy({ id: driverId, kind: 'DRIVER' });
    if (!driver || driver.status !== 'ACTIVE')
      throw new DomainError(
        409,
        'DRIVER_UNAVAILABLE',
        'Tài xế không hợp lệ hoặc đã bị khóa',
      );

    const from = addMinutes(batch.departure_at, -60);
    const to = addMinutes(batch.arrival_eta, 60);
    const clash = await this.runs
      .createQueryBuilder('run')
      .innerJoin('run.trip_batch', 'tb')
      .where("run.status IN ('PENDING', 'DISPATCHED', 'IN_PROGRESS')")
      .andWhere('(run.vehicle_id = :v OR run.driver_id = :d)', {
        v: vehicleId,
        d: driverId,
      })
      .andWhere('tb.departure_at < :to AND tb.arrival_eta > :from', {
        from,
        to,
      })
      .andWhere(exceptRunId ? 'run.id <> :except' : '1=1', {
        except: exceptRunId,
      })
      .getOne();
    if (clash) {
      const who =
        clash.vehicle_id === vehicleId
          ? `Xe ${vehicle.license_plate}`
          : `Tài xế ${driver.full_name}`;
      throw new DomainError(
        409,
        'SCHEDULE_CLASH',
        `${who} đã có chuyến ${clash.code} trùng giờ`,
      );
    }
  }

  async emit(id: string): Promise<TripRunDto> {
    const [dto] = await this.toDtos([await this.findOr404(id)]);
    this.realtime.toOpsAndDriver(
      dto.driver.id,
      RealtimeEvents.tripRunUpdated,
      dto,
    );
    return dto;
  }
}
