import type {
  PriceRuleDto,
  RouteDto,
  StopDto,
  TimeSlotDto,
  VehicleDto,
  VehicleTypeDto,
} from '@limousine-workspace/shared-types';
import {
  type PriceRuleEntity,
  type RouteEntity,
  type StopEntity,
  type TimeSlotEntity,
  type VehicleEntity,
  type VehicleTypeEntity,
  fromPoint,
} from '../../database/entities';

export const toVehicleTypeDto = (t: VehicleTypeEntity): VehicleTypeDto => ({
  id: t.id,
  code: t.code,
  name: t.name,
  capacity: t.capacity,
  seat_layout: t.seat_layout,
  description: t.description,
  image_url: t.image_url,
});

export const toVehicleDto = (v: VehicleEntity): VehicleDto => ({
  id: v.id,
  license_plate: v.license_plate,
  status: v.status,
  vehicle_type: {
    id: v.vehicle_type.id,
    code: v.vehicle_type.code,
    name: v.vehicle_type.name,
    capacity: v.vehicle_type.capacity,
  },
  brand: v.brand,
  model: v.model,
  year: v.year,
  color: v.color,
  odometer_km: v.odometer_km,
  registration_expires_on: v.registration_expires_on,
  insurance_expires_on: v.insurance_expires_on,
  next_maintenance_on: v.next_maintenance_on,
  image_url: v.image_url,
  note: v.note,
  created_at: v.created_at.toISOString(),
});

export const toStopDto = (s: StopEntity): StopDto => ({
  id: s.id,
  route_id: s.route_id,
  name: s.name,
  address: s.address,
  location: fromPoint(s.location) ?? { lat: 0, lng: 0 },
  kind: s.kind,
  sort_order: s.sort_order,
  is_active: s.is_active,
});

export const toRouteDto = (
  r: RouteEntity,
  extra: Partial<RouteDto> = {},
): RouteDto => ({
  id: r.id,
  code: r.code,
  name: r.name,
  origin_name: r.origin_name,
  destination_name: r.destination_name,
  distance_km: r.distance_km,
  duration_min: r.duration_min,
  description: r.description,
  image_url: r.image_url,
  is_active: r.is_active,
  sort_order: r.sort_order,
  ...extra,
});

export const toTimeSlotDto = (t: TimeSlotEntity): TimeSlotDto => ({
  id: t.id,
  route_id: t.route_id,
  departure_time: t.departure_time.slice(0, 5),
  days_of_week: t.days_of_week,
  vehicle_type_id: t.vehicle_type_id,
  planned_vehicles: t.planned_vehicles,
  valid_from: t.valid_from,
  valid_to: t.valid_to,
  is_active: t.is_active,
});

export const toPriceRuleDto = (p: PriceRuleEntity): PriceRuleDto => ({
  id: p.id,
  route_id: p.route_id,
  vehicle_type_id: p.vehicle_type_id,
  name: p.name,
  base_price_vnd: p.base_price_vnd,
  vip_surcharge_vnd: p.vip_surcharge_vnd,
  valid_from: p.valid_from,
  valid_to: p.valid_to,
  priority: p.priority,
  is_active: p.is_active,
});
