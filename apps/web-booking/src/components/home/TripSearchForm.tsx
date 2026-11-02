'use client';

import type { RouteDto } from '@limousine-workspace/shared-types';
import { Button, cn } from '@limousine-workspace/shared-ui';
import { DatePicker, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Minus,
  Navigation,
  Plus,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type ReactNode, useMemo, useState } from 'react';

/** Vietnam "today" regardless of the visitor's device timezone. */
export const vnToday = () =>
  dayjs(
    new Date(Date.now() + (7 * 60 + new Date().getTimezoneOffset()) * 60_000),
  ).startOf('day');

function Field({
  label,
  icon,
  children,
  className,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-fg-muted">
        {icon}
        {label}
      </span>
      {children}
    </div>
  );
}

export function TripSearchForm({
  routes,
  initial,
  compact,
}: {
  routes: RouteDto[];
  initial?: { route_id?: string; date?: string; seats?: number };
  /** Horizontal bar used on the results page */
  compact?: boolean;
}) {
  const router = useRouter();
  const initialRoute = routes.find((r) => r.id === initial?.route_id);
  const origins = useMemo(
    () => [...new Set(routes.map((r) => r.origin_name))],
    [routes],
  );
  const [origin, setOrigin] = useState<string | undefined>(
    initialRoute?.origin_name ?? origins[0],
  );
  const [routeId, setRouteId] = useState<string | undefined>(initialRoute?.id);
  const [date, setDate] = useState<Dayjs>(
    initial?.date ? dayjs(initial.date) : vnToday(),
  );
  const [seats, setSeats] = useState(initial?.seats ?? 1);
  const [touched, setTouched] = useState(false);

  const destinations = routes.filter((r) => r.origin_name === origin);

  const submit = () => {
    setTouched(true);
    if (!routeId) return;
    router.push(
      `/search?route=${routeId}&date=${date.format('YYYY-MM-DD')}&seats=${seats}`,
    );
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className={cn(
        'grid gap-4',
        compact
          ? 'md:grid-cols-[1fr_1.3fr_1fr_auto_auto] md:items-end'
          : 'sm:grid-cols-2 lg:grid-cols-[1fr_1.3fr_1fr_auto_auto] lg:items-end',
      )}
      aria-label="Tìm chuyến xe"
    >
      <Field label="Điểm đi" icon={<Navigation className="size-3.5" />}>
        <Select
          size="large"
          value={origin}
          onChange={(v) => {
            setOrigin(v);
            setRouteId(undefined);
          }}
          options={origins.map((o) => ({ value: o, label: o }))}
          aria-label="Điểm đi"
        />
      </Field>
      <Field label="Điểm đến" icon={<MapPin className="size-3.5" />}>
        <Select
          size="large"
          value={routeId}
          placeholder="Chọn điểm đến"
          onChange={setRouteId}
          status={touched && !routeId ? 'error' : undefined}
          options={destinations.map((r) => ({
            value: r.id,
            label: (
              <span className="flex items-center justify-between gap-3">
                <span className="truncate">{r.destination_name}</span>
                {r.from_price_vnd ? (
                  <span className="shrink-0 text-xs text-fg-muted">
                    từ {(r.from_price_vnd / 1000).toLocaleString('vi-VN')}k
                  </span>
                ) : null}
              </span>
            ),
          }))}
          aria-label="Điểm đến"
        />
      </Field>
      <Field label="Ngày đi" icon={<CalendarDays className="size-3.5" />}>
        <DatePicker
          size="large"
          value={date}
          onChange={(d) => d && setDate(d)}
          format="dddd, DD/MM/YYYY"
          allowClear={false}
          disabledDate={(d) =>
            d.isBefore(vnToday()) || d.isAfter(vnToday().add(60, 'day'))
          }
          className="w-full capitalize"
          aria-label="Ngày đi"
        />
      </Field>
      <Field label="Số ghế" icon={<Users className="size-3.5" />}>
        <div className="flex h-12 items-center justify-between gap-1 rounded-control border border-border-default bg-surface-2 px-1.5">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-[8px] text-fg-secondary hover:bg-surface-3 disabled:opacity-30"
            onClick={() => setSeats((s) => Math.max(1, s - 1))}
            disabled={seats <= 1}
            aria-label="Bớt một ghế"
          >
            <Minus className="size-4" />
          </button>
          <span
            className="w-6 text-center text-base font-semibold tabular-nums"
            aria-live="polite"
          >
            {seats}
          </span>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-[8px] text-fg-secondary hover:bg-surface-3 disabled:opacity-30"
            onClick={() => setSeats((s) => Math.min(6, s + 1))}
            disabled={seats >= 6}
            aria-label="Thêm một ghế"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </Field>
      <Button
        type="submit"
        size="lg"
        rightIcon={<ArrowRight className="size-4" />}
        className={cn(
          'sm:col-span-2 lg:col-span-1',
          compact && 'md:col-span-1',
        )}
      >
        Tìm chuyến
      </Button>
      {touched && !routeId && (
        <p className="text-sm text-danger-fg sm:col-span-full">
          Vui lòng chọn điểm đến
        </p>
      )}
    </form>
  );
}
