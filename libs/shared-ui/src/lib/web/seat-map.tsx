'use client';

import React, { useMemo } from 'react';
import { Button, Tooltip, Typography } from 'antd';

export type SeatCapacity = 9 | 12 | 19 | 22;

/** Ghế “VIP” (hàng trước) — giá cao hơn trong UI booking */
export function isVipSeat(seatId: string, capacity: SeatCapacity): boolean {
  if (capacity <= 12) return seatId.startsWith('A');
  return seatId === 'S1' || seatId === 'S2';
}

export function seatIdsForCapacity(capacity: SeatCapacity): string[] {
  if (capacity === 9)
    return ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'C3', 'D1', 'D2'];
  if (capacity === 12)
    return [
      'A1',
      'A2',
      'B1',
      'B2',
      'C1',
      'C2',
      'C3',
      'D1',
      'D2',
      'E1',
      'E2',
      'E3',
    ];
  return Array.from({ length: capacity }, (_, i) => `S${i + 1}`);
}

export function priceForSeat(
  seatId: string,
  baseVnd: number,
  capacity: SeatCapacity,
): number {
  return isVipSeat(seatId, capacity) ? baseVnd + 50000 : baseVnd;
}

export function SeatMap({
  capacity,
  basePriceVnd,
  selectedSeat,
  takenSeats,
  onSelect,
}: {
  capacity: SeatCapacity;
  basePriceVnd: number;
  selectedSeat: string | null;
  takenSeats: string[];
  onSelect: (seatId: string) => void;
}) {
  const seats = useMemo(() => seatIdsForCapacity(capacity), [capacity]);
  const takenSet = useMemo(() => new Set(takenSeats), [takenSeats]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <Typography.Title level={5}>Chọn ghế</Typography.Title>
      <Typography.Paragraph type="secondary" className="!mb-4 text-sm">
        Ghế VIP (hàng trước) có phụ phí. Ghế đỏ đã có người đặt.
      </Typography.Paragraph>

      <div className="mb-4 flex justify-center">
        <div className="rounded border border-dashed border-slate-300 bg-slate-100 px-8 py-2 text-center text-xs text-slate-500">
          Hướng lái xe
        </div>
      </div>

      <div className="max-w-full overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
        <div className="flex min-w-min flex-wrap justify-center gap-1.5 px-0.5 sm:gap-2 md:min-w-0">
        {seats.map((id) => {
          const taken = takenSet.has(id);
          const selected = selectedSeat === id;
          const price = priceForSeat(id, basePriceVnd, capacity);
          const vip = isVipSeat(id, capacity);

          const btn = (
            <Button
              type={selected ? 'primary' : 'default'}
              disabled={taken}
              size="small"
              className={
                taken
                  ? '!border-red-500 !bg-red-50 !text-red-600'
                  : vip
                    ? '!min-w-[52px]'
                    : '!min-w-[52px]'
              }
              onClick={() => !taken && onSelect(id)}
            >
              {id}
            </Button>
          );

          return (
            <Tooltip key={id} title={`${price.toLocaleString('vi-VN')} ₫`}>
              <span>{btn}</span>
            </Tooltip>
          );
        })}
        </div>
      </div>
    </div>
  );
}
