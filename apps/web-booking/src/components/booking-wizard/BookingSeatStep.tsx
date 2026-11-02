'use client';

import React from 'react';
import { Button } from 'antd';
import { priceForSeat, type SeatCapacity } from '@limousine-workspace/shared-ui';
import { BookingSeatCabMap } from './booking-seat-cab-map';

export type BookingSeatStepProps = {
  capacity: 9 | 12;
  baseFromUrl: number;
  selectedSeats: string[];
  takenSeats: string[];
  onToggleSeat: (id: string) => void;
  onCapacityChange: (next: 9 | 12) => void;
  onContinue: () => void;
};

function seatSortKey(id: string): number {
  const m = id.match(/^([A-Z])(\d+)$/);
  if (!m) return 9999;
  const row = m[1].charCodeAt(0) - 65;
  const n = Number(m[2]);
  return row * 100 + n;
}

function LegendItem({
  colorClass,
  label,
}: {
  colorClass: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`size-4 shrink-0 rounded-md border sm:size-[18px] ${colorClass}`}
        aria-hidden
      />
      <span className="text-[13px] font-semibold text-white/90 sm:text-sm">
        {label}
      </span>
    </div>
  );
}

export function BookingSeatStep({
  capacity,
  baseFromUrl,
  selectedSeats,
  takenSeats,
  onToggleSeat,
  onCapacityChange,
  onContinue,
}: BookingSeatStepProps) {
  const cap = capacity as SeatCapacity;
  const total = selectedSeats.reduce(
    (s, id) => s + priceForSeat(id, baseFromUrl, cap),
    0,
  );
  const sortedLabels = [...selectedSeats].sort(
    (a, b) => seatSortKey(a) - seatSortKey(b),
  );
  const summaryLine = sortedLabels.join(' • ');

  const title =
    capacity === 9 ? 'Limousine 9 chỗ VIP' : 'Limousine 12 chỗ Premium';
  const sub =
    capacity === 9
      ? 'Nhìn từ trên xuống • Lối đi giữa'
      : 'Nhìn từ trên xuống • Khoang rộng rãi';

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6 lg:gap-10">
          <LegendItem
            colorClass="border border-[#d1d5db] bg-white"
            label="Ghế trống"
          />
          <LegendItem
            colorClass="border-0 bg-[#d4ac0d]"
            label="Đang chọn"
          />
          <LegendItem
            colorClass="border border-[#c0392b] bg-[#e6b0aa]"
            label="Đã bán"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <span className="text-[13px] font-bold text-white/80 sm:text-sm">
            Chọn dòng xe:
          </span>
          <div className="inline-flex rounded-full border border-white/15 bg-[#0f1524] p-1 shadow-inner">
            <button
              type="button"
              onClick={() => onCapacityChange(9)}
              className={`rounded-full px-4 py-2 text-xs font-black transition-colors sm:px-5 sm:text-sm ${
                capacity === 9
                  ? 'bg-nova-gold text-nova-bg shadow-[0_2px_12px_rgba(212,175,55,0.35)]'
                  : 'text-white/85 hover:text-white'
              }`}
            >
              9 chỗ
            </button>
            <button
              type="button"
              onClick={() => onCapacityChange(12)}
              className={`rounded-full px-4 py-2 text-xs font-black transition-colors sm:px-5 sm:text-sm ${
                capacity === 12
                  ? 'bg-nova-gold text-nova-bg shadow-[0_2px_12px_rgba(212,175,55,0.35)]'
                  : 'text-white/85 hover:text-white'
              }`}
            >
              12 chỗ
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white p-4 shadow-[0_16px_48px_rgba(0,0,0,0.28)] sm:rounded-[28px] sm:p-6 md:p-8">
        <h3 className="text-lg font-black text-[#0a0e18] sm:text-xl">{title}</h3>
        <p className="mt-1 text-[13px] font-semibold text-[#64748b] sm:text-sm">
          {sub}
        </p>
        <div className="mt-5 sm:mt-6">
          <BookingSeatCabMap
            capacity={capacity}
            basePriceVnd={baseFromUrl}
            selectedSeats={selectedSeats}
            takenSeats={takenSeats}
            onToggleSeat={onToggleSeat}
          />
        </div>
      </div>

      <div className="rounded-[18px] border border-[#1c2436] bg-[#0a0e18] px-4 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.35)] sm:px-6 sm:py-5 lg:flex lg:items-center lg:justify-between lg:gap-6">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-[13px] font-bold text-white sm:text-sm">
            Ghế đã chọn:{' '}
            {selectedSeats.length > 0 ? (
              <>
                <span className="text-nova-gold">{summaryLine}</span>
                <span className="text-nova-gold">
                  {' '}
                  ({selectedSeats.length} ghế)
                </span>
              </>
            ) : (
              <span className="font-semibold text-white/45">
                Chưa chọn ghế
              </span>
            )}
          </p>
          <p className="text-base font-black text-nova-gold sm:text-lg">
            Tạm tính:{' '}
            <span className="text-lg sm:text-xl">
              {total.toLocaleString('vi-VN')}đ
            </span>
          </p>
          <p className="text-[11px] font-medium leading-relaxed text-white/45 sm:text-xs">
            (Click &apos;Tiếp tục&apos; để chuyển sang bước Nhập thông tin / Thanh
            toán)
          </p>
        </div>
        <div className="mt-4 shrink-0 lg:mt-0">
          <Button
            type="primary"
            size="large"
            disabled={selectedSeats.length === 0}
            onClick={onContinue}
            className="h-12 min-w-[160px] rounded-[12px] !border-0 !bg-[#e5c158] !px-6 !text-sm !font-black !text-[#0a0e18] !shadow-[0_4px_20px_rgba(229,193,88,0.4)] hover:!bg-[#d4af37] sm:h-[52px] sm:min-w-[200px] sm:!text-[15px]"
          >
            Tiếp tục <span className="ml-1 inline-block">→</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
