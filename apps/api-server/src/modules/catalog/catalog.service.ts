import type {
  Paginated,
  PriceRuleDto,
  RouteDto,
  StopDto,
  TimeSlotDto,
  VehicleDto,
  VehicleTypeDto,
} from '@limousine-workspace/shared-types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { DomainError } from '../../common/http/exception.filter';
import { likeTerm, paginate } from '../../common/http/pagination';
import { vnDateString } from '../../common/time';
import {
  PriceRuleEntity,
  RouteEntity,
  type SeatLayoutJson,
  StopEntity,
  TimeSlotEntity,
  VehicleEntity,
  VehicleTypeEntity,
  toPoint,
} from '../../database/entities';
import type {
  CreatePriceRuleDto,
  CreateRouteDto,
  CreateStopDto,
  CreateTimeSlotDto,
  CreateVehicleDto,
  CreateVehicleTypeDto,
  UpdatePriceRuleDto,
  UpdateRouteDto,
  UpdateStopDto,
  UpdateTimeSlotDto,
  UpdateVehicleDto,
  UpdateVehicleTypeDto,
  VehicleListQuery,
} from './catalog.dto';
import {
  toPriceRuleDto,
  toRouteDto,
  toStopDto,
  toTimeSlotDto,
  toVehicleDto,
  toVehicleTypeDto,
} from './catalog.mappers';
import { PricingService } from './pricing.service';

const normalizePlate = (p: string) => {
  const m = /^(\d{2}[A-Z]{1,2})-?(\d{3})\.?(\d{2})$/.exec(
    p.toUpperCase().replace(/\s/g, ''),
  );
  return m ? `${m[1]}-${m[2]}.${m[3]}` : p.toUpperCase();
};

function validateLayout(layout: unknown): {
  layout: SeatLayoutJson;
  capacity: number;
} {
  if (!Array.isArray(layout) || !layout.every(Array.isArray))
    throw new DomainError(400, 'BAD_LAYOUT', 'Sơ đồ ghế không hợp lệ');
  const labels = new Set<string>();
  for (const row of layout as unknown[][]) {
    for (const cell of row) {
      if (cell === null) continue;
      const c = cell as { label?: unknown; tier?: unknown };
      if (
        typeof c.label !== 'string' ||
        !/^[A-Z]\d{1,2}$/.test(c.label) ||
        (c.tier !== 'STANDARD' && c.tier !== 'VIP')
      ) {
        throw new DomainError(
          400,
          'BAD_LAYOUT',
          'Ghế phải có nhãn dạng A1 và hạng STANDARD/VIP',
        );
      }
      if (labels.has(c.label))
        throw new DomainError(
          400,
          'BAD_LAYOUT',
          `Nhãn ghế ${c.label} bị trùng`,
        );
      labels.add(c.label);
    }
  }
  if (labels.size === 0)
    throw new DomainError(400, 'BAD_LAYOUT', 'Sơ đồ phải có ít nhất 1 ghế');
  return { layout: layout as SeatLayoutJson, capacity: labels.size };
}

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(VehicleTypeEntity)
    private readonly types: Repository<VehicleTypeEntity>,
    @InjectRepository(VehicleEntity)
    private readonly vehicles: Repository<VehicleEntity>,
    @InjectRepository(RouteEntity)
    private readonly routes: Repository<RouteEntity>,
    @InjectRepository(StopEntity)
    private readonly stops: Repository<StopEntity>,
    @InjectRepository(TimeSlotEntity)
    private readonly slots: Repository<TimeSlotEntity>,
    @InjectRepository(PriceRuleEntity)
    private readonly prices: Repository<PriceRuleEntity>,
    private readonly pricing: PricingService,
  ) {}

  /* ---------------- vehicle types ---------------- */

  async listVehicleTypes(): Promise<VehicleTypeDto[]> {
    return (await this.types.find({ order: { capacity: 'ASC' } })).map(
      toVehicleTypeDto,
    );
  }

  async createVehicleType(dto: CreateVehicleTypeDto): Promise<VehicleTypeDto> {
    const { layout, capacity } = validateLayout(dto.seat_layout);
    return toVehicleTypeDto(
      await this.types.save(
        this.types.create({ ...dto, seat_layout: layout, capacity }),
      ),
    );
  }

  async updateVehicleType(
    id: string,
    dto: UpdateVehicleTypeDto,
  ): Promise<VehicleTypeDto> {
    const t = await this.types.findOneBy({ id });
    if (!t) throw new NotFoundException('Không tìm thấy loại xe');
    Object.assign(t, dto);
    if (dto.seat_layout)
      Object.assign(
        t,
        (({ layout, capacity }) => ({ seat_layout: layout, capacity }))(
          validateLayout(dto.seat_layout),
        ),
      );
    return toVehicleTypeDto(await this.types.save(t));
  }

  /* ---------------- vehicles ---------------- */

  async listVehicles(q: VehicleListQuery): Promise<Paginated<VehicleDto>> {
    const qb = this.vehicles
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.vehicle_type', 't');
    if (q.status) qb.andWhere('v.status = :status', { status: q.status });
    if (q.vehicle_type_id)
      qb.andWhere('v.vehicle_type_id = :vt', { vt: q.vehicle_type_id });
    if (q.q)
      qb.andWhere(
        '(v.license_plate ILIKE :q OR v.brand ILIKE :q OR v.model ILIKE :q)',
        { q: likeTerm(q.q) },
      );
    return paginate(qb, q, toVehicleDto, {
      plate: 'v.license_plate',
      status: 'v.status',
      created_at: 'v.created_at',
      odometer: 'v.odometer_km',
    });
  }

  async getVehicle(id: string): Promise<VehicleDto> {
    return toVehicleDto(await this.vehicleOr404(id));
  }

  async createVehicle(dto: CreateVehicleDto): Promise<VehicleDto> {
    await this.typeOr404(dto.vehicle_type_id);
    const v = await this.vehicles.save(
      this.vehicles.create({
        ...dto,
        license_plate: normalizePlate(dto.license_plate),
      }),
    );
    return this.getVehicle(v.id);
  }

  async updateVehicle(id: string, dto: UpdateVehicleDto): Promise<VehicleDto> {
    const v = await this.vehicleOr404(id);
    if (dto.vehicle_type_id) await this.typeOr404(dto.vehicle_type_id);
    Object.assign(
      v,
      dto,
      dto.license_plate
        ? { license_plate: normalizePlate(dto.license_plate) }
        : {},
    );
    if (dto.vehicle_type_id)
      v.vehicle_type = await this.typeOr404(dto.vehicle_type_id);
    await this.vehicles.save(v);
    return this.getVehicle(id);
  }

  async archiveVehicle(id: string): Promise<void> {
    const v = await this.vehicleOr404(id);
    if (v.status === 'IN_USE')
      throw new DomainError(
        409,
        'VEHICLE_IN_USE',
        'Xe đang chạy, không thể lưu trữ',
      );
    await this.vehicles.softDelete(id);
  }

  /* ---------------- routes & stops ---------------- */

  async listRoutes(
    opts: {
      activeOnly?: boolean;
      withStops?: boolean;
      withPrices?: boolean;
    } = {},
  ): Promise<RouteDto[]> {
    const routes = await this.routes.find({
      where: opts.activeOnly ? { is_active: true } : {},
      order: { sort_order: 'ASC', name: 'ASC' },
    });
    const stops = opts.withStops
      ? await this.stops.find({
          where: opts.activeOnly ? { is_active: true } : {},
          order: { sort_order: 'ASC' },
        })
      : [];
    const prices = opts.withPrices
      ? await this.pricing.fromPrices(vnDateString())
      : new Map<string, { base: number; vip: number }>();
    return routes.map((r) =>
      toRouteDto(r, {
        ...(opts.withStops
          ? { stops: stops.filter((s) => s.route_id === r.id).map(toStopDto) }
          : {}),
        ...(opts.withPrices
          ? {
              from_price_vnd: prices.get(r.id)?.base ?? null,
              vip_surcharge_vnd: prices.get(r.id)?.vip ?? null,
            }
          : {}),
      }),
    );
  }

  async getRoute(id: string, activeOnly = false): Promise<RouteDto> {
    const r = await this.routes.findOneBy({ id });
    if (!r || (activeOnly && !r.is_active))
      throw new NotFoundException('Không tìm thấy tuyến');
    const stops = await this.stops.find({
      where: { route_id: id, ...(activeOnly ? { is_active: true } : {}) },
      order: { sort_order: 'ASC' },
    });
    return toRouteDto(r, { stops: stops.map(toStopDto) });
  }

  async createRoute(dto: CreateRouteDto): Promise<RouteDto> {
    return toRouteDto(await this.routes.save(this.routes.create(dto)), {
      stops: [],
    });
  }

  async updateRoute(id: string, dto: UpdateRouteDto): Promise<RouteDto> {
    const r = await this.routes.findOneBy({ id });
    if (!r) throw new NotFoundException('Không tìm thấy tuyến');
    await this.routes.save(Object.assign(r, dto));
    return this.getRoute(id);
  }

  async archiveRoute(id: string): Promise<void> {
    if (!(await this.routes.existsBy({ id })))
      throw new NotFoundException('Không tìm thấy tuyến');
    await this.routes.update(id, { is_active: false });
    await this.routes.softDelete(id);
  }

  async createStop(routeId: string, dto: CreateStopDto): Promise<StopDto> {
    if (!(await this.routes.existsBy({ id: routeId })))
      throw new NotFoundException('Không tìm thấy tuyến');
    const { lat, lng, ...rest } = dto;
    return toStopDto(
      await this.stops.save(
        this.stops.create({
          ...rest,
          route_id: routeId,
          location: toPoint(lat, lng),
        }),
      ),
    );
  }

  async updateStop(id: string, dto: UpdateStopDto): Promise<StopDto> {
    const s = await this.stops.findOneBy({ id });
    if (!s) throw new NotFoundException('Không tìm thấy điểm dừng');
    const { lat, lng, ...rest } = dto;
    Object.assign(s, rest);
    if (lat !== undefined && lng !== undefined) s.location = toPoint(lat, lng);
    return toStopDto(await this.stops.save(s));
  }

  async deleteStop(id: string): Promise<void> {
    const res = await this.stops.softDelete(id);
    if (!res.affected) throw new NotFoundException('Không tìm thấy điểm dừng');
  }

  /* ---------------- time slots ---------------- */

  async listTimeSlots(routeId?: string): Promise<TimeSlotDto[]> {
    return (
      await this.slots.find({
        where: routeId ? { route_id: routeId } : {},
        order: { departure_time: 'ASC' },
      })
    ).map(toTimeSlotDto);
  }

  async createTimeSlot(dto: CreateTimeSlotDto): Promise<TimeSlotDto> {
    await this.typeOr404(dto.vehicle_type_id);
    if (!(await this.routes.existsBy({ id: dto.route_id })))
      throw new NotFoundException('Không tìm thấy tuyến');
    const days = [...new Set(dto.days_of_week)].sort();
    return toTimeSlotDto(
      await this.slots.save(
        this.slots.create({
          ...dto,
          days_of_week: days,
          departure_time: `${dto.departure_time}:00`,
        }),
      ),
    );
  }

  async updateTimeSlot(
    id: string,
    dto: UpdateTimeSlotDto,
  ): Promise<TimeSlotDto> {
    const s = await this.slots.findOneBy({ id });
    if (!s) throw new NotFoundException('Không tìm thấy khung giờ');
    Object.assign(s, dto);
    if (dto.departure_time) s.departure_time = `${dto.departure_time}:00`;
    if (dto.days_of_week)
      s.days_of_week = [...new Set(dto.days_of_week)].sort();
    return toTimeSlotDto(await this.slots.save(s));
  }

  async deleteTimeSlot(id: string): Promise<void> {
    const res = await this.slots.softDelete(id);
    if (!res.affected) throw new NotFoundException('Không tìm thấy khung giờ');
  }

  /* ---------------- price rules ---------------- */

  async listPriceRules(routeId?: string): Promise<PriceRuleDto[]> {
    return (
      await this.prices.find({
        where: routeId ? { route_id: routeId } : {},
        order: { priority: 'DESC', created_at: 'ASC' },
      })
    ).map(toPriceRuleDto);
  }

  async createPriceRule(dto: CreatePriceRuleDto): Promise<PriceRuleDto> {
    return toPriceRuleDto(await this.prices.save(this.prices.create(dto)));
  }

  async updatePriceRule(
    id: string,
    dto: UpdatePriceRuleDto,
  ): Promise<PriceRuleDto> {
    const p = await this.prices.findOneBy({ id });
    if (!p) throw new NotFoundException('Không tìm thấy bảng giá');
    return toPriceRuleDto(await this.prices.save(Object.assign(p, dto)));
  }

  async deletePriceRule(id: string): Promise<void> {
    const res = await this.prices.softDelete(id);
    if (!res.affected) throw new NotFoundException('Không tìm thấy bảng giá');
  }

  /* ---------------- helpers ---------------- */

  private async typeOr404(id: string) {
    const t = await this.types.findOneBy({ id });
    if (!t) throw new NotFoundException('Không tìm thấy loại xe');
    return t;
  }

  private async vehicleOr404(id: string) {
    const v = await this.vehicles.findOne({
      where: { id },
      relations: { vehicle_type: true },
    });
    if (!v) throw new NotFoundException('Không tìm thấy xe');
    return v;
  }
}
