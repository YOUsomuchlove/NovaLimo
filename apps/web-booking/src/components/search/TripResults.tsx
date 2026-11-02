'use client';

import type {
  TripBatchDto,
  TripSeatMapDto,
} from '@limousine-workspace/shared-types';
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Money,
  SeatLegend,
  SeatMap,
  SegmentedControl,
  Skeleton,
  buttonClasses,
  cn,
} from '@limousine-workspace/shared-ui';
import { formatDuration, formatTime } from '@limousine-workspace/utils-core';
import { Drawer } from 'antd';
import {
  Armchair,
  ArrowRight,
  Bus,
  CalendarX2,
  Crown,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { publicApi } from '../../lib/api';

type Period = 'all' | 'morning' | 'afternoon' | 'evening';

const vnHour = (iso: string) => (new Date(iso).getUTCHours() + 7) % 24;
const inPeriod = (iso: string, p: Period) => {
  const h = vnHour(iso);
  return (
    p === 'all' ||
    (p === 'morning' && h < 12) ||
    (p === 'afternoon' && h >= 12 && h < 18) ||
    (p === 'evening' && h >= 18)
  );
};

function TripCard({
  trip,
  seats,
  onPreview,
}: {
  trip: TripBatchDto;
  seats: number;
  onPreview: () => void;
}) {
  const enough = trip.seats_available >= seats;
  const disabled = !trip.bookable || !enough;
  const low =
    trip.bookable && trip.seats_available > 0 && trip.seats_available <= 3;
  return (
    <article
      className={cn(
        'grid gap-5 rounded-panel border bg-surface-1 p-5 shadow-e1 transition-[border-color,box-shadow] duration-200 sm:p-6 md:grid-cols-[1fr_auto] md:items-center',
        disabled
          ? 'border-border-subtle opacity-70'
          : 'border-border-subtle hover:border-brand/35 hover:shadow-e2',
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <div>
            <p className="text-3xl font-semibold tabular-nums text-fg">
              {formatTime(trip.departure_at)}
            </p>
            <p className="mt-0.5 text-xs text-fg-muted">
              {trip.route.origin_name}
            </p>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 px-2 text-xs text-fg-muted">
            <span>{formatDuration(trip.route.duration_min)}</span>
            <span className="relative h-px w-full bg-border-strong">
              <span className="absolute -top-[3px] left-0 size-[7px] rounded-full border border-brand bg-canvas" />
              <span className="absolute -top-[3px] right-0 size-[7px] rounded-full bg-brand" />
            </span>
            <span>Đón tận nơi</span>
          </div>
          <div className="text-right">
            <p className="text-3xl font-semibold tabular-nums text-fg-secondary">
              {formatTime(trip.arrival_eta)}
            </p>
            <p className="mt-0.5 text-xs text-fg-muted">
              {trip.route.destination_name}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge icon={<Bus className="size-3.5" />}>
            {trip.vehicle_type.name}
          </Badge>
          {trip.vip_surcharge_vnd > 0 && (
            <Badge tone="brand" icon={<Crown className="size-3.5" />}>
              Ghế VIP +{(trip.vip_surcharge_vnd / 1000).toLocaleString('vi-VN')}
              k
            </Badge>
          )}
          {!trip.bookable ? (
            <Badge tone="neutral">Ngừng nhận đặt online</Badge>
          ) : (
            <Badge tone={low ? 'warning' : 'success'} dot>
              {trip.seats_available === 0
                ? 'Hết ghế'
                : low
                  ? `Chỉ còn ${trip.seats_available} ghế`
                  : `Còn ${trip.seats_available} ghế`}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-border-subtle pt-4 md:flex-col md:items-end md:border-l md:border-t-0 md:pl-6 md:pt-0">
        <div className="md:text-right">
          <p className="text-xs text-fg-muted">Giá mỗi ghế từ</p>
          <Money
            value={trip.price_vnd}
            className="text-2xl font-semibold text-brand-fg"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Eye className="size-4" />}
            onClick={onPreview}
            disabled={!trip.bookable}
            aria-label={`Xem ghế chuyến ${formatTime(trip.departure_at)}`}
          >
            <span className="hidden sm:inline">Xem ghế</span>
          </Button>
          {disabled ? (
            <Button disabled>{enough ? 'Chọn ghế' : 'Không đủ ghế'}</Button>
          ) : (
            <Link href={`/booking/${trip.id}`} className={buttonClasses()}>
              Chọn ghế <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

/** A3 — "Drawer (Mở hé)": quick seat map preview before the full seat step. */
function SeatPreviewDrawer({
  trip,
  map,
  onClose,
}: {
  trip: TripBatchDto | null;
  map: TripSeatMapDto | null | 'error';
  onClose: () => void;
}) {
  const ready = map && map !== 'error' ? map : null;
  const taken = useMemo(
    () =>
      ready?.seats
        .filter((s) => s.remaining === 0 && s.held === 0)
        .map((s) => s.label) ?? [],
    [ready],
  );
  const held = useMemo(
    () =>
      ready?.seats
        .filter((s) => s.remaining === 0 && s.held > 0)
        .map((s) => s.label) ?? [],
    [ready],
  );
  const prices = useMemo(
    () => new Map(ready?.seats.map((s) => [s.label, s.price_vnd])),
    [ready],
  );

  return (
    <Drawer
      open={!!trip}
      onClose={onClose}
      size={460}
      title={
        trip
          ? `Chuyến ${formatTime(trip.departure_at)} · ${trip.vehicle_type.name}`
          : ''
      }
      footer={
        trip && (
          <Link
            href={`/booking/${trip.id}`}
            className={buttonClasses({ fullWidth: true, size: 'lg' })}
          >
            Tiếp tục chọn ghế <ArrowRight className="size-4" />
          </Link>
        )
      }
    >
      {map === 'error' ? (
        <ErrorState compact />
      ) : !ready ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <Skeleton className="h-[360px] w-[230px]" rounded="card" />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <p className="text-center text-sm text-fg-muted">
            Mỗi vị trí ghế có trên {trip?.planned_vehicles ?? 1} xe. Ghế có ổ
            khóa là vị trí đã bán hết.
          </p>
          <SeatMap
            layout={{
              id: ready.trip_batch_id,
              name: trip?.vehicle_type.name ?? '',
              rows: ready.layout,
            }}
            selected={[]}
            taken={taken}
            held={held}
            onToggle={() => undefined}
            priceOf={(c) => prices.get(c.label)}
            disabled
          />
          <SeatLegend />
        </div>
      )}
    </Drawer>
  );
}

export function TripResults({
  trips,
  seats,
  nextDayHref,
}: {
  trips: TripBatchDto[];
  seats: number;
  nextDayHref: string;
}) {
  const [period, setPeriod] = useState<Period>('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [preview, setPreview] = useState<TripBatchDto | null>(null);
  const [map, setMap] = useState<TripSeatMapDto | null | 'error'>(null);

  const openPreview = (t: TripBatchDto) => {
    setPreview(t);
    setMap(null);
    publicApi.seats(t.id).then(setMap, () => setMap('error'));
  };

  const visible = trips.filter(
    (t) =>
      inPeriod(t.departure_at, period) &&
      (!onlyAvailable || (t.bookable && t.seats_available >= seats)),
  );

  if (!trips.length) {
    return (
      <div className="rounded-panel border border-border-subtle bg-surface-1">
        <EmptyState
          icon={<CalendarX2 className="size-6" strokeWidth={1.75} />}
          title="Không có chuyến nào trong ngày này"
          description="Các khung giờ trong ngày đã khởi hành hoặc chưa mở bán. Bạn thử chọn ngày khác nhé."
          action={
            <Link
              href={nextDayHref}
              className={buttonClasses({ variant: 'outline' })}
            >
              Xem ngày tiếp theo <ArrowRight className="size-4" />
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          ariaLabel="Khung giờ"
          value={period}
          onChange={setPeriod}
          options={[
            { value: 'all', label: 'Cả ngày' },
            { value: 'morning', label: 'Sáng' },
            { value: 'afternoon', label: 'Chiều' },
            { value: 'evening', label: 'Tối' },
          ]}
        />
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-fg-secondary">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
            className="size-4 accent-[var(--nl-brand)]"
          />
          Chỉ hiện chuyến còn đủ {seats} ghế
        </label>
      </div>
      <p className="mb-4 text-sm text-fg-muted" aria-live="polite">
        {visible.length} chuyến
      </p>
      <div className="flex flex-col gap-4">
        {visible.map((t) => (
          <TripCard
            key={t.id}
            trip={t}
            seats={seats}
            onPreview={() => openPreview(t)}
          />
        ))}
        {!visible.length && (
          <div className="rounded-panel border border-border-subtle bg-surface-1">
            <EmptyState
              compact
              icon={<Armchair className="size-5" />}
              title="Không có chuyến phù hợp bộ lọc"
              description="Thử chọn khung giờ khác."
            />
          </div>
        )}
      </div>
      <SeatPreviewDrawer
        trip={preview}
        map={map}
        onClose={() => setPreview(null)}
      />
    </>
  );
}
