'use client';

import React, { useMemo } from 'react';
import { Tooltip } from 'antd';
import {
  isVipSeat,
  priceForSeat,
  type SeatCapacity,
} from '@limousine-workspace/shared-ui/legacy';

export type SeatTileState = 'available' | 'sold' | 'selected';

function SeatChairIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M7 5h10a2 2 0 012 2v3H5V7a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M5 10h14v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8 18v2M16 18v2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SeatTile({
  id,
  state,
  priceVnd,
  vip,
  onToggle,
}: {
  id: string;
  state: SeatTileState;
  priceVnd: number;
  vip: boolean;
  onToggle: () => void;
}) {
  const tip =
    vip && state !== 'sold'
      ? `Ghế VIP — ${priceVnd.toLocaleString('vi-VN')}đ`
      : state !== 'sold'
        ? `Ghế ${vip ? 'VIP — ' : ''}${priceVnd.toLocaleString('vi-VN')}đ`
        : 'Đã bán';

  const base =
    'relative flex aspect-square w-full max-w-[88px] flex-col items-center justify-center rounded-xl border-2 text-[11px] font-black transition-transform sm:max-w-[96px] sm:rounded-[14px] sm:text-xs';

  const stateCls =
    state === 'sold'
      ? 'cursor-not-allowed border-[#c0392b] bg-[#e6b0aa] text-[#c0392b]'
      : state === 'selected'
        ? 'cursor-pointer border-transparent bg-[#d4ac0d] text-[#1a1200] shadow-[0_4px_14px_rgba(212,172,13,0.45)] ring-2 ring-[#d4ac0d]/50'
        : 'cursor-pointer border-[#d1d5db] bg-[#f2f2f2] text-[#111827] hover:scale-[1.02] hover:border-nova-gold/40';

  const btn = (
    <button
      type="button"
      disabled={state === 'sold'}
      onClick={onToggle}
      className={`${base} ${stateCls}`}
    >
      <SeatChairIcon className="mb-1 h-5 w-5 shrink-0 opacity-90 sm:h-6 sm:w-6" />
      <span className="absolute bottom-1.5 left-2 font-black tracking-tight sm:bottom-2 sm:left-2.5">
        {id}
      </span>
    </button>
  );

  return (
    <Tooltip
      title={<span className="font-bold text-[#0a0e18]">{tip}</span>}
      color="#fff"
      placement="top"
    >
      {btn}
    </Tooltip>
  );
}

export type BookingSeatCabMapProps = {
  capacity: 9 | 12;
  basePriceVnd: number;
  selectedSeats: string[];
  takenSeats: string[];
  onToggleSeat: (id: string) => void;
};

export function BookingSeatCabMap({
  capacity,
  basePriceVnd,
  selectedSeats,
  takenSeats,
  onToggleSeat,
}: BookingSeatCabMapProps) {
  const taken = useMemo(() => new Set(takenSeats), [takenSeats]);
  const selected = useMemo(() => new Set(selectedSeats), [selectedSeats]);
  const cap = capacity as SeatCapacity;

  const tile = (id: string) => {
    const sold = taken.has(id);
    const sel = selected.has(id);
    const st: SeatTileState = sold ? 'sold' : sel ? 'selected' : 'available';
    const price = priceForSeat(id, basePriceVnd, cap);
    const vip = isVipSeat(id, cap);
    return (
      <SeatTile
        key={id}
        id={id}
        state={st}
        priceVnd={price}
        vip={vip}
        onToggle={() => onToggleSeat(id)}
      />
    );
  };

  const innerCabin = (
    <div className="rounded-[16px] border border-[#e2e8f0] bg-[#f8f9fa] p-4 sm:rounded-[20px] sm:p-6 md:p-8">
      <p className="mb-4 text-left text-xs font-bold text-[#64748b] sm:text-sm">
        Khoang lái
      </p>

      {capacity === 9 ? (
        <div className="mx-auto max-w-md">
          <div
            className="grid items-center justify-items-center gap-x-2 gap-y-3 sm:gap-x-3 sm:gap-y-4"
            style={{
              gridTemplateColumns: 'minmax(0,1fr) 40px minmax(0,1fr)',
              gridTemplateRows: 'repeat(3, auto)',
            }}
          >
            <div style={{ gridColumn: 1, gridRow: 1 }}>{tile('A1')}</div>
            <div
              style={{ gridColumn: 2, gridRow: '1 / 4' }}
              className="flex h-full min-h-[120px] items-center justify-center self-stretch sm:min-h-[160px]"
            >
              <span
                className="text-[11px] font-black tracking-wide text-nova-gold sm:text-xs"
                style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                }}
              >
                Lối đi
              </span>
            </div>
            <div style={{ gridColumn: 3, gridRow: 1 }}>{tile('B1')}</div>
            <div style={{ gridColumn: 1, gridRow: 2 }}>{tile('A2')}</div>
            <div style={{ gridColumn: 3, gridRow: 2 }}>{tile('B2')}</div>
            <div style={{ gridColumn: 1, gridRow: 3 }}>{tile('A3')}</div>
            <div style={{ gridColumn: 3, gridRow: 3 }}>{tile('B3')}</div>
          </div>
          <div className="mt-4 flex justify-center gap-3 sm:mt-6 sm:gap-4">
            {tile('C1')}
            {tile('C2')}
            {tile('C3')}
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-lg">
          <div
            className="grid items-center justify-items-center gap-x-2 gap-y-3 sm:gap-x-3 sm:gap-y-4"
            style={{
              gridTemplateColumns: 'minmax(0,1fr) 40px minmax(0,1fr)',
              gridTemplateRows: 'repeat(4, auto)',
            }}
          >
            <div style={{ gridColumn: 1, gridRow: 1 }}>{tile('A1')}</div>
            <div
              style={{ gridColumn: 2, gridRow: '1 / 5' }}
              className="flex h-full min-h-[180px] items-center justify-center self-stretch sm:min-h-[220px]"
            >
              <span
                className="text-[11px] font-black tracking-wide text-nova-gold sm:text-xs"
                style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                }}
              >
                Lối đi
              </span>
            </div>
            <div style={{ gridColumn: 3, gridRow: 1 }}>{tile('B1')}</div>
            <div style={{ gridColumn: 1, gridRow: 2 }}>{tile('A2')}</div>
            <div style={{ gridColumn: 3, gridRow: 2 }}>{tile('B2')}</div>
            <div style={{ gridColumn: 1, gridRow: 3 }}>{tile('A3')}</div>
            <div style={{ gridColumn: 3, gridRow: 3 }}>{tile('B3')}</div>
            <div style={{ gridColumn: 1, gridRow: 4 }}>{tile('A4')}</div>
            <div style={{ gridColumn: 3, gridRow: 4 }}>{tile('B4')}</div>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-3 sm:mt-6 sm:gap-4">
            {tile('C1')}
            {tile('C2')}
            {tile('C3')}
            {tile('D1')}
          </div>
        </div>
      )}
    </div>
  );

  return innerCabin;
}
