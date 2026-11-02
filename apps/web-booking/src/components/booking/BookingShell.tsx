'use client';

import {
  Badge,
  Card,
  Money,
  Stepper,
  cn,
} from '@limousine-workspace/shared-ui';
import {
  formatDuration,
  formatTime,
  formatWeekdayDate,
} from '@limousine-workspace/utils-core';
import { Bus, Clock, Crown, MapPin, Timer } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Container } from '../site/Section';
import { useBooking, useHoldCountdown } from './BookingContext';

const STEPS = [
  { title: 'Chọn ghế' },
  { title: 'Thông tin' },
  { title: 'Thanh toán' },
  { title: 'Hoàn tất' },
];

function stepOf(pathname: string) {
  if (pathname.endsWith('/checkout')) return 2;
  if (pathname.endsWith('/info')) return 1;
  return 0;
}

export function HoldTimer({ className }: { className?: string }) {
  const { draft } = useBooking();
  const left = useHoldCountdown(
    draft.hold_token ? draft.hold_expires_at : undefined,
  );
  if (left === null) return null;
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-control border px-3 py-2 text-sm',
        left <= 60
          ? 'border-danger-border bg-danger-bg text-danger-fg'
          : 'border-warning-border bg-warning-bg text-warning-fg',
        className,
      )}
      role="timer"
      aria-live={left <= 60 ? 'assertive' : 'off'}
    >
      <Timer className="size-4" />
      {left > 0 ? (
        <span>
          Ghế được giữ cho bạn trong{' '}
          <strong className="tabular-nums">
            {mm}:{ss}
          </strong>
        </span>
      ) : (
        <span>Hết thời gian giữ ghế — vui lòng chọn lại</span>
      )}
    </div>
  );
}

function TripSummary() {
  const { trip, draft, live } = useBooking();
  const seats = live?.seats ?? draft.seats;
  const prices = live?.prices ?? draft.seat_prices ?? {};
  const total = seats.reduce((s, l) => s + (prices[l] ?? trip.price_vnd), 0);
  return (
    <Card variant="elevated" className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-muted">
          Chuyến của bạn
        </p>
        <p className="mt-2 text-lg font-semibold text-fg">
          {trip.route.origin_name} <span className="text-brand-fg">→</span>{' '}
          {trip.route.destination_name}
        </p>
        <p className="mt-1 text-sm capitalize text-fg-secondary">
          {formatWeekdayDate(trip.departure_at)}
        </p>
      </div>
      <ul className="flex flex-col gap-2.5 text-sm text-fg-secondary">
        <li className="flex items-center gap-2.5">
          <Clock className="size-4 text-fg-muted" />
          <span className="tabular-nums">
            {formatTime(trip.departure_at)} → {formatTime(trip.arrival_eta)}
          </span>
          <span className="text-fg-muted">
            · {formatDuration(trip.route.duration_min)}
          </span>
        </li>
        <li className="flex items-center gap-2.5">
          <Bus className="size-4 text-fg-muted" /> {trip.vehicle_type.name}
        </li>
        {draft.pickup?.address && (
          <li className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 size-4 shrink-0 text-brand-fg" />{' '}
            <span className="line-clamp-2">Đón: {draft.pickup.address}</span>
          </li>
        )}
        {draft.dropoff?.address && (
          <li className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 size-4 shrink-0 text-fg-muted" />{' '}
            <span className="line-clamp-2">Trả: {draft.dropoff.address}</span>
          </li>
        )}
      </ul>
      <div className="border-t border-border-subtle pt-4">
        {seats.length ? (
          <ul className="flex flex-col gap-2">
            {[...seats].sort().map((l) => (
              <li key={l} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-fg-secondary">
                  <Badge
                    tone={
                      (prices[l] ?? 0) > trip.price_vnd ? 'brand' : 'neutral'
                    }
                    size="sm"
                    icon={
                      (prices[l] ?? 0) > trip.price_vnd ? (
                        <Crown className="size-3" />
                      ) : undefined
                    }
                  >
                    {l}
                  </Badge>
                  {draft.passengers?.[l]?.name || 'Hành khách'}
                </span>
                <Money
                  value={prices[l] ?? trip.price_vnd}
                  className="text-fg"
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-fg-muted">Chưa chọn ghế</p>
        )}
      </div>
      <div className="flex items-end justify-between border-t border-border-subtle pt-4">
        <span className="text-sm text-fg-muted">Tạm tính</span>
        <Money value={total} className="text-2xl font-semibold text-brand-fg" />
      </div>
      <HoldTimer />
    </Card>
  );
}

export function BookingShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <Container className="py-8 sm:py-12">
      <Stepper
        steps={STEPS}
        current={stepOf(pathname)}
        className="mx-auto mb-10 max-w-3xl"
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">{children}</div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <TripSummary />
        </aside>
      </div>
    </Container>
  );
}
