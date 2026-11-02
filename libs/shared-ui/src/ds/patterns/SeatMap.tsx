'use client';

import type { SeatTier } from '@limousine-workspace/shared-types';
import { formatVnd } from '@limousine-workspace/utils-core';
import { Armchair, Crown, Lock } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '../utils/cn';

export interface SeatCell {
  label: string;
  tier?: SeatTier;
}

/** A vehicle's seat plan. `null` cells are aisle/empty space. Comes from `vehicle_types.seat_layout` on the API. */
export interface SeatLayout {
  id: string;
  name: string;
  rows: (SeatCell | null)[][];
}

const s = (label: string, tier: SeatTier = 'STANDARD'): SeatCell => ({
  label,
  tier,
});

/** Sample layouts (design-system page, tests). Real layouts come from `vehicle_types.seat_layout`. */
export const SEAT_LAYOUTS = {
  limousine9: {
    id: 'limousine9',
    name: 'Limousine 9 chỗ',
    rows: [
      [s('A1', 'VIP'), null, s('A2', 'VIP')],
      [s('B1', 'VIP'), null, s('B2', 'VIP')],
      [s('C1'), s('C2'), s('C3')],
      [s('D1'), null, s('D2')],
    ],
  },
  limousine12: {
    id: 'limousine12',
    name: 'Limousine 12 chỗ',
    rows: [
      [s('A1', 'VIP'), null, s('A2', 'VIP')],
      [s('B1', 'VIP'), null, s('B2', 'VIP')],
      [s('C1'), s('C2'), s('C3')],
      [s('D1'), null, s('D2')],
      [s('E1'), s('E2'), s('E3')],
    ],
  },
} satisfies Record<string, SeatLayout>;

export type SeatAvailability = 'free' | 'taken' | 'held';

export interface SeatMapProps {
  layout: SeatLayout;
  selected: string[];
  onToggle: (label: string) => void;
  /** Seats sold / held by someone else */
  taken?: string[];
  held?: string[];
  maxSelectable?: number;
  /** Price lookup for tooltip + aria label (server-calculated) */
  priceOf?: (cell: SeatCell) => number | undefined;
  disabled?: boolean;
  className?: string;
}

export function SeatMap({
  layout,
  selected,
  onToggle,
  taken = [],
  held = [],
  maxSelectable,
  priceOf,
  disabled,
  className,
}: SeatMapProps) {
  const takenSet = useMemo(() => new Set(taken), [taken]);
  const heldSet = useMemo(() => new Set(held), [held]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const limitReached =
    maxSelectable !== undefined && selected.length >= maxSelectable;
  const cols = Math.max(...layout.rows.map((r) => r.length));

  return (
    <div
      className={cn(
        'relative mx-auto w-fit rounded-[36px] border border-border-default bg-gradient-to-b from-surface-2 to-surface-1 p-5 pt-4 shadow-e2',
        className,
      )}
    >
      {/* front of the vehicle */}
      <div className="mb-4 flex items-center justify-between px-1">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-fg-muted">
          Đầu xe
        </span>
        <span
          className="flex size-10 items-center justify-center rounded-full border-2 border-border-strong text-fg-muted"
          title="Tài xế"
          aria-label="Vị trí tài xế"
        >
          <span className="size-3 rounded-full border-2 border-current" />
        </span>
      </div>

      <div
        className="grid gap-2.5"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        role="group"
        aria-label={layout.name}
      >
        {layout.rows.flatMap((row, ri) =>
          row.map((cell, ci) => {
            if (!cell)
              return (
                <span key={`${ri}-${ci}`} aria-hidden className="size-14" />
              );
            const state: SeatAvailability = takenSet.has(cell.label)
              ? 'taken'
              : heldSet.has(cell.label)
                ? 'held'
                : 'free';
            const isSelected = selectedSet.has(cell.label);
            const unavailable = state !== 'free';
            const blocked =
              disabled || unavailable || (!isSelected && limitReached);
            const price = priceOf?.(cell);
            const vip = cell.tier === 'VIP';
            const aria = [
              `Ghế ${cell.label}`,
              vip ? 'VIP' : null,
              price !== undefined ? formatVnd(price) : null,
              state === 'taken'
                ? 'đã bán'
                : state === 'held'
                  ? 'đang được giữ'
                  : isSelected
                    ? 'đang chọn'
                    : 'còn trống',
            ]
              .filter(Boolean)
              .join(', ');

            return (
              <button
                key={cell.label}
                type="button"
                aria-pressed={isSelected}
                aria-label={aria}
                title={aria}
                disabled={blocked}
                onClick={() => onToggle(cell.label)}
                className={cn(
                  'group relative flex size-14 flex-col items-center justify-center gap-0.5 rounded-control border text-xs font-semibold',
                  'transition-[background-color,border-color,color,transform,box-shadow] duration-150 ease-nova',
                  state === 'free' &&
                    !isSelected &&
                    'border-border-strong bg-surface-3 text-fg-secondary hover:-translate-y-0.5 hover:border-brand hover:text-fg',
                  state === 'free' && !isSelected && vip && 'border-brand/50',
                  isSelected &&
                    'border-brand bg-brand text-on-brand shadow-brand',
                  state === 'taken' &&
                    'cursor-not-allowed border-border-subtle bg-surface-2 text-fg-disabled',
                  state === 'held' &&
                    'nl-hatch cursor-not-allowed border-warning-border text-warning-fg',
                  blocked &&
                    state === 'free' &&
                    !isSelected &&
                    'opacity-50 hover:translate-y-0',
                )}
              >
                {state === 'taken' ? (
                  <Lock className="size-4" strokeWidth={2} />
                ) : (
                  <Armchair
                    className="size-4"
                    strokeWidth={isSelected ? 2.25 : 1.75}
                  />
                )}
                <span>{cell.label}</span>
                {vip && state === 'free' && (
                  <Crown
                    className={cn(
                      'absolute -right-1 -top-1 size-3.5 rounded-full p-0.5',
                      isSelected
                        ? 'bg-on-brand text-brand'
                        : 'bg-brand text-on-brand',
                    )}
                    strokeWidth={2.5}
                  />
                )}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}

export function SeatLegend({
  className,
  showVip = true,
}: {
  className?: string;
  showVip?: boolean;
}) {
  const item = (swatch: string, label: string) => (
    <li className="flex items-center gap-2">
      <span className={cn('size-4 rounded-[5px] border', swatch)} />
      {label}
    </li>
  );
  return (
    <ul
      className={cn(
        'flex flex-wrap items-center gap-x-5 gap-y-2 text-ui text-fg-muted',
        className,
      )}
    >
      {item('border-border-strong bg-surface-3', 'Còn trống')}
      {item('border-brand bg-brand', 'Đang chọn')}
      {item('border-border-subtle bg-surface-2', 'Đã bán')}
      {item('nl-hatch border-warning-border', 'Đang giữ chỗ')}
      {showVip && (
        <li className="flex items-center gap-2">
          <Crown
            className="size-4 rounded-full bg-brand p-0.5 text-on-brand"
            strokeWidth={2.5}
          />{' '}
          Ghế VIP
        </li>
      )}
    </ul>
  );
}
