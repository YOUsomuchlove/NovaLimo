'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Typography } from 'antd';
import dayjs from 'dayjs';
import type { TripBatch } from '@limousine-workspace/shared-types/legacy';
import { formatRouteDash } from '../../lib/route-parse';
import { formatTripTimeWindow } from './search-batch-demo';

export type SearchSelectionSummaryProps = {
  batch: TripBatch;
  mockPrice: number;
  capacity: number;
  seatsLeft: number;
  onConfirmNavigate?: () => void;
};

export function SearchSelectionSummary({
  batch,
  mockPrice,
  capacity,
  seatsLeft,
  onConfirmNavigate,
}: SearchSelectionSummaryProps) {
  const routeLine = formatRouteDash(batch.route_name);
  const timeWindow = formatTripTimeWindow(dayjs(batch.departure_time));

  return (
    <div className="flex h-full min-h-0 flex-col border-l-[4px] border-l-nova-gold bg-[#0a0e18] text-nova-text shadow-[-12px_0_32px_rgba(0,0,0,0.35)]">
      <div className="px-6 pb-2 pt-8">
        <Typography.Title
          level={4}
          className="!mb-1 !mt-0 !text-xl !font-black !tracking-tight !text-white"
        >
          Chọn chuyến
        </Typography.Title>
        <p className="text-[13px] font-semibold text-nova-muted">{routeLine}</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-3">
        <p className="text-2xl font-black leading-tight text-nova-gold">
          {timeWindow}
        </p>
        <p className="mt-4 text-[15px] font-extrabold text-white">
          Limousine {capacity} chỗ {capacity === 9 ? 'VIP' : 'Premium'}
        </p>
        <p className="mt-2 text-[13px] font-semibold text-nova-muted">
          Tuyến: {routeLine}
        </p>
        <p className="mt-4 text-[13px] font-bold text-[#E8E8EA]">
          Còn {seatsLeft} ghế trống
        </p>
        <p className="mt-6 text-[28px] font-black leading-none text-nova-gold">
          {mockPrice.toLocaleString('vi-VN')}đ
        </p>
      </div>
      <div className="mx-6 border-t border-[#2a3144]" />
      <div className="px-6 pb-8 pt-5">
        <Link
          href={`/booking/${batch.id}?capacity=${capacity}&price=${mockPrice}`}
          onClick={onConfirmNavigate}
          className="block"
        >
          <Button
            type="primary"
            block
            size="large"
            className="h-[52px] rounded-[14px] !border-0 !bg-nova-gold !text-[15px] !font-black !text-nova-bg !shadow-[0_4px_20px_rgba(212,175,55,0.35)] hover:!bg-nova-gold-hover"
          >
            Xác nhận đặt vé
          </Button>
        </Link>
      </div>
    </div>
  );
}
