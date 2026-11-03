import type { SeatTier } from '@limousine-workspace/shared-types';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { DomainError } from '../../common/http/exception.filter';
import { PriceRuleEntity } from '../../database/entities';

export interface Fare {
  base_price_vnd: number;
  vip_surcharge_vnd: number;
  rule_id: string;
}

/**
 * Server-side fares — the ONLY place ticket prices come from (clients never send prices).
 * Highest-priority active rule matching route + (vehicle type | any) + date wins;
 * a vehicle-type specific rule beats a generic one at equal priority.
 */
@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(PriceRuleEntity)
    private readonly rules: Repository<PriceRuleEntity>,
  ) {}

  async fareFor(
    routeId: string,
    vehicleTypeId: string,
    date: string,
  ): Promise<Fare> {
    const fare = await this.findFare(routeId, vehicleTypeId, date);
    if (!fare)
      throw new DomainError(409, 'NO_PRICE', 'Tuyến chưa được cấu hình giá vé');
    return fare;
  }

  async findFare(
    routeId: string,
    vehicleTypeId: string,
    date: string,
  ): Promise<Fare | null> {
    const rule = await this.rules
      .createQueryBuilder('p')
      .where('p.route_id = :routeId AND p.is_active', { routeId })
      .andWhere(
        '(p.vehicle_type_id IS NULL OR p.vehicle_type_id = :vehicleTypeId)',
        { vehicleTypeId },
      )
      .andWhere('(p.valid_from IS NULL OR p.valid_from <= :date)', { date })
      .andWhere('(p.valid_to IS NULL OR p.valid_to >= :date)', { date })
      .orderBy('p.priority', 'DESC')
      .addOrderBy('p.vehicle_type_id IS NULL', 'ASC')
      .getOne();
    return rule
      ? {
          base_price_vnd: rule.base_price_vnd,
          vip_surcharge_vnd: rule.vip_surcharge_vnd,
          rule_id: rule.id,
        }
      : null;
  }

  /** Lowest current base fare (and its VIP surcharge) per route — public listing. */
  async fromPrices(
    date: string,
  ): Promise<Map<string, { base: number; vip: number }>> {
    const rows = await this.rules
      .createQueryBuilder('p')
      .select('DISTINCT ON (p.route_id) p.route_id', 'route_id')
      .addSelect('p.base_price_vnd', 'base')
      .addSelect('p.vip_surcharge_vnd', 'vip')
      .where('p.is_active')
      .andWhere('(p.valid_from IS NULL OR p.valid_from <= :date)', { date })
      .andWhere('(p.valid_to IS NULL OR p.valid_to >= :date)', { date })
      .orderBy('p.route_id')
      .addOrderBy('p.base_price_vnd', 'ASC')
      .getRawMany<{ route_id: string; base: number; vip: number }>();
    return new Map(
      rows.map((r) => [
        r.route_id,
        { base: Number(r.base), vip: Number(r.vip) },
      ]),
    );
  }
}

export const seatPrice = (
  fare: Pick<Fare, 'base_price_vnd' | 'vip_surcharge_vnd'>,
  tier: SeatTier,
) => fare.base_price_vnd + (tier === 'VIP' ? fare.vip_surcharge_vnd : 0);
