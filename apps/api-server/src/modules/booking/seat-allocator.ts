import type { SeatTier } from '@limousine-workspace/shared-types';
import type { EntityManager } from 'typeorm';
import { DomainError } from '../../common/http/exception.filter';
import { addMinutes } from '../../common/time';
import {
  BookingSeatEntity,
  SeatHoldEntity,
  type TripBatchEntity,
} from '../../database/entities';

export interface AllocatedSeat {
  seat_label: string;
  seat_unit: number;
  tier: SeatTier;
}

/**
 * Serialises all seat changes of one trip batch for the rest of the transaction.
 * Cheap (no table locks) and prevents two customers from being given the same seat unit.
 */
export async function lockBatch(
  m: EntityManager,
  batchId: string,
): Promise<void> {
  await m.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [
    batchId,
  ]);
}

/** Is the batch on sale right now? */
export function assertBookable(
  batch: TripBatchEntity,
  opts: { staff?: boolean } = {},
): void {
  if (batch.status === 'CANCELLED' || batch.status === 'COMPLETED') {
    throw new DomainError(
      409,
      'TRIP_CLOSED',
      'Chuyến đã đóng, vui lòng chọn chuyến khác',
    );
  }
  if (!opts.staff) {
    if (batch.status !== 'OPEN')
      throw new DomainError(
        409,
        'TRIP_CLOSED',
        'Chuyến đã ngừng nhận đặt vé online',
      );
    if (addMinutes(batch.departure_at, -batch.sales_close_min) <= new Date()) {
      throw new DomainError(
        409,
        'SALES_CLOSED',
        'Đã hết thời gian đặt vé online cho chuyến này',
      );
    }
  } else if (batch.departure_at <= new Date()) {
    throw new DomainError(409, 'TRIP_DEPARTED', 'Chuyến đã khởi hành');
  }
}

/**
 * Picks a free unit (1..planned_vehicles) for each requested label. Must run inside a transaction
 * that already holds `lockBatch`. Holds owned by `ownHoldToken` don't count as taken.
 */
export async function allocateSeats(
  m: EntityManager,
  batch: TripBatchEntity,
  labels: string[],
  ownHoldToken?: string,
): Promise<AllocatedSeat[]> {
  if (new Set(labels).size !== labels.length)
    throw new DomainError(400, 'DUPLICATE_SEAT', 'Mỗi ghế chỉ chọn một lần');
  const tiers = new Map(
    batch.vehicle_type.seat_layout
      .flat()
      .flatMap((c) => (c ? [[c.label, c.tier] as const] : [])),
  );
  const unknown = labels.filter((l) => !tiers.has(l));
  if (unknown.length)
    throw new DomainError(
      400,
      'UNKNOWN_SEAT',
      `Ghế không tồn tại: ${unknown.join(', ')}`,
    );

  await m
    .createQueryBuilder()
    .delete()
    .from(SeatHoldEntity)
    .where('trip_batch_id = :id AND expires_at <= now()', { id: batch.id })
    .execute();

  const sold = await m.find(BookingSeatEntity, {
    where: { trip_batch_id: batch.id, is_active: true },
    select: { seat_label: true, seat_unit: true },
  });
  const holds = await m.find(SeatHoldEntity, {
    where: { trip_batch_id: batch.id },
  });
  const used = new Set([
    ...sold.map((s) => `${s.seat_label}#${s.seat_unit}`),
    ...holds
      .filter((h) => h.hold_token !== ownHoldToken)
      .map((h) => `${h.seat_label}#${h.seat_unit}`),
  ]);

  const taken: string[] = [];
  const out: AllocatedSeat[] = [];
  for (const label of labels) {
    let unit = 0;
    for (let u = 1; u <= batch.planned_vehicles; u++) {
      if (!used.has(`${label}#${u}`)) {
        unit = u;
        break;
      }
    }
    if (!unit) taken.push(label);
    else
      out.push({
        seat_label: label,
        seat_unit: unit,
        tier: tiers.get(label) ?? 'STANDARD',
      });
  }
  if (taken.length) {
    throw new DomainError(
      409,
      'SEAT_TAKEN',
      `Ghế ${taken.join(', ')} vừa có người đặt, vui lòng chọn ghế khác`,
      { seats: taken },
    );
  }
  return out;
}
