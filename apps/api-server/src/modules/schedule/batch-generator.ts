import type { EntityManager } from 'typeorm';
import { TimeSlotEntity, TripBatchEntity } from '../../database/entities';
import {
  addDays,
  addMinutes,
  vnDateString,
  vnDayOfWeek,
  vnLocalToDate,
} from '../../common/time';

/**
 * Creates the missing trip batches for every active time slot over the next `days` days.
 * Idempotent: (time_slot_id, departure_at) is unique, existing batches are left untouched.
 */
export async function generateTripBatches(
  manager: EntityManager,
  opts: { days: number; fromDate?: string; now?: Date },
): Promise<number> {
  const now = opts.now ?? new Date();
  const from = opts.fromDate ?? vnDateString(now);
  const slots = await manager.find(TimeSlotEntity, {
    where: { is_active: true },
    relations: { route: true },
  });

  const rows: Partial<TripBatchEntity>[] = [];
  for (let i = 0; i < opts.days; i++) {
    const date = addDays(from, i);
    const dow = vnDayOfWeek(date);
    for (const slot of slots) {
      if (!slot.route?.is_active || slot.route.deleted_at) continue;
      if (!slot.days_of_week.includes(dow)) continue;
      if (slot.valid_from && date < slot.valid_from) continue;
      if (slot.valid_to && date > slot.valid_to) continue;
      const hhmm = slot.departure_time.slice(0, 5);
      const departure = vnLocalToDate(date, hhmm);
      if (departure <= now) continue;
      rows.push({
        code: `${slot.route.code}-${date.slice(2).replace(/-/g, '')}-${hhmm.replace(':', '')}`,
        route_id: slot.route_id,
        time_slot_id: slot.id,
        departure_at: departure,
        arrival_eta: addMinutes(departure, slot.route.duration_min),
        vehicle_type_id: slot.vehicle_type_id,
        planned_vehicles: slot.planned_vehicles,
      });
    }
  }
  if (rows.length === 0) return 0;
  const res = await manager
    .createQueryBuilder()
    .insert()
    .into(TripBatchEntity)
    .values(rows)
    .orIgnore()
    .returning('id')
    .execute();
  return res.identifiers.filter(Boolean).length;
}
