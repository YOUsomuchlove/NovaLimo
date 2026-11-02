'use client';

import React from 'react';
import { Button } from 'antd';
import dayjs from 'dayjs';
import { formatTripTimeWindow } from './search-batch-demo';

export type SearchTripCardProps = {
  departureTime: string;
  mockPrice: number;
  capacity: number;
  seatsLeft: number;
  onSelect: () => void;
};

/** Thẻ một chuyến — bố cục mockup (giờ trái, giá + CTA phải). */
export function SearchTripCard({
  departureTime,
  mockPrice,
  capacity,
  seatsLeft,
  onSelect,
}: SearchTripCardProps) {
  const timeWindow = formatTripTimeWindow(dayjs(departureTime));
  const tier = capacity === 9 ? 'VIP' : 'Premium';

  return (
    <article className="flex flex-col gap-5 rounded-[18px] border border-white/80 bg-white px-5 py-5 shadow-[0_4px_24px_rgba(0,0,0,0.1)] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 sm:py-5">
      <div className="min-w-0 flex-1">
        <p className="text-[26px] font-black leading-none tracking-tight text-[#0a0e18] sm:text-[28px]">
          {timeWindow}
        </p>
        <p className="mt-2.5 text-[15px] font-bold text-[#0a0e18]">
          Limousine {capacity} chỗ {tier}
        </p>
        <p className="mt-1.5 text-[13px] font-medium text-[#6b7280]">
          Còn {seatsLeft} ghế trống
        </p>
      </div>
      <div className="flex shrink-0 flex-row items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center sm:pl-2">
        <p className="text-2xl font-black leading-none text-nova-gold sm:text-right sm:text-[26px]">
          {mockPrice.toLocaleString('vi-VN')}đ
        </p>
        <Button
          type="primary"
          onClick={onSelect}
          className="h-10 min-w-[132px] rounded-[11px] !border-0 !bg-nova-gold !px-4 !text-[13px] !font-black !text-nova-bg !shadow-[0_2px_12px_rgba(212,175,55,0.35)] hover:!bg-nova-gold-hover sm:h-[42px] sm:min-w-[148px] sm:!text-[14px]"
        >
          Chọn chuyến
        </Button>
      </div>
    </article>
  );
}
