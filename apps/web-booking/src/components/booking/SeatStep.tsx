'use client';

import type {
  SeatsChangedEvent,
  TripSeatMapDto,
} from '@limousine-workspace/shared-types';
import {
  Button,
  Card,
  ErrorState,
  Money,
  SeatLegend,
  SeatMap,
  Skeleton,
  useToast,
} from '@limousine-workspace/shared-ui';
import {
  RealtimeCommands,
  RealtimeEvents,
} from '@limousine-workspace/utils-core';
import { ArrowRight, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError, publicApi } from '../../lib/api';
import { realtime } from '../../lib/socket';
import { useBooking } from './BookingContext';

export function SeatStep() {
  const { trip, draft, ready, update, maxSeats, setLive } = useBooking();
  const router = useRouter();
  const toast = useToast();
  const [map, setMap] = useState<TripSeatMapDto | null>(null);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setError(false);
    publicApi.seats(trip.id).then(setMap, () => setError(true));
  }, [trip.id]);

  useEffect(load, [load]);

  // Restore the selection once the draft is read from sessionStorage.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from hydrated draft once
    if (ready) setSelected(draft.seats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Live availability while the page is open.
  useEffect(() => {
    const socket = realtime();
    const join = () => socket.emit(RealtimeCommands.subscribeBatch, trip.id);
    const onSeats = (e: SeatsChangedEvent) => {
      if (e.trip_batch_id === trip.id)
        setMap((m) => (m ? { ...m, seats: e.seats } : m));
    };
    join();
    socket.on('connect', join);
    socket.on(RealtimeEvents.seatsChanged, onSeats);
    return () => {
      socket.emit(RealtimeCommands.unsubscribeBatch, trip.id);
      socket.off('connect', join);
      socket.off(RealtimeEvents.seatsChanged, onSeats);
    };
  }, [trip.id]);

  // My own held seats must not show as "taken by someone else".
  const ownHeld = useMemo(
    () =>
      new Set(
        draft.hold_token &&
        draft.hold_expires_at &&
        new Date(draft.hold_expires_at) > new Date()
          ? draft.seats
          : [],
      ),
    [draft.hold_token, draft.hold_expires_at, draft.seats],
  );
  const { taken, held, prices } = useMemo(() => {
    const seats = map?.seats ?? [];
    return {
      taken: seats
        .filter(
          (s) => s.remaining === 0 && s.held === 0 && !ownHeld.has(s.label),
        )
        .map((s) => s.label),
      held: seats
        .filter((s) => s.remaining === 0 && s.held > 0 && !ownHeld.has(s.label))
        .map((s) => s.label),
      prices: Object.fromEntries(seats.map((s) => [s.label, s.price_vnd])),
    };
  }, [map, ownHeld]);

  const total = selected.reduce((s, l) => s + (prices[l] ?? 0), 0);

  // Mirror the selection into the summary card while choosing.
  useEffect(() => {
    setLive({ seats: selected, prices });
    return () => setLive(null);
  }, [selected, prices, setLive]);

  const toggle = (label: string) =>
    setSelected((s) => {
      if (s.includes(label)) return s.filter((x) => x !== label);
      if (s.length >= maxSeats) {
        toast.warning(`Mỗi lần đặt tối đa ${maxSeats} ghế`);
        return s;
      }
      return [...s, label];
    });

  const next = async () => {
    setSubmitting(true);
    try {
      const hold = await publicApi.hold({
        trip_batch_id: trip.id,
        seat_labels: selected,
        hold_token: draft.hold_token,
      });
      update({
        seats: selected,
        hold_token: hold.hold_token,
        hold_expires_at: hold.expires_at,
        seat_prices: Object.fromEntries(
          selected.map((l) => [l, prices[l] ?? trip.price_vnd]),
        ),
        passengers: Object.fromEntries(
          selected.map((l) => [l, draft.passengers?.[l] ?? { name: '' }]),
        ),
      });
      router.push(`/booking/${trip.id}/info`);
    } catch (e) {
      if (e instanceof ApiError && e.code === 'SEAT_TAKEN') {
        const gone =
          (e.details as { seats?: string[] } | undefined)?.seats ?? [];
        setSelected((s) => s.filter((l) => !gone.includes(l)));
        load();
      }
      toast.error(
        e instanceof ApiError
          ? e.message
          : 'Không giữ được ghế, vui lòng thử lại',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!trip.bookable) {
    return (
      <Card>
        <ErrorState
          title="Chuyến này đã ngừng nhận đặt vé online"
          description="Vui lòng chọn chuyến khác hoặc gọi hotline để được hỗ trợ."
        />
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-fg">Chọn ghế</h1>
        <p className="text-sm text-fg-muted">
          Chạm vào ghế để chọn. Hàng đầu là ghế VIP, rộng hơn và gần cửa. Bạn có
          thể chọn tối đa {maxSeats} ghế.
        </p>
      </div>

      {error ? (
        <ErrorState onRetry={load} />
      ) : (
        <div className="grid items-start gap-8 md:grid-cols-[auto_1fr]">
          <div className="flex justify-center">
            {map ? (
              <SeatMap
                layout={{
                  id: trip.id,
                  name: trip.vehicle_type.name,
                  rows: map.layout,
                }}
                selected={selected}
                taken={taken}
                held={held}
                maxSelectable={maxSeats}
                priceOf={(c) => prices[c.label]}
                onToggle={toggle}
              />
            ) : (
              <Skeleton className="h-[380px] w-[236px]" rounded="card" />
            )}
          </div>
          <div className="flex flex-col gap-6">
            <SeatLegend />
            <div className="flex gap-3 rounded-card border border-info-border bg-info-bg p-4 text-sm text-info-fg">
              <Info className="mt-0.5 size-4 shrink-0" />
              <p>
                Chuyến chạy{' '}
                {trip.planned_vehicles > 1
                  ? `${trip.planned_vehicles} xe cùng giờ`
                  : '1 xe'}
                ; vị trí ghế bạn chọn được giữ nguyên trên xe được xếp. Sơ đồ
                cập nhật trực tiếp khi có khách khác đặt.
              </p>
            </div>
            <div className="mt-auto flex flex-col gap-4 rounded-card border border-border-subtle bg-surface-2 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-fg-muted">
                  {selected.length
                    ? `${selected.length} ghế: ${[...selected].sort().join(', ')}`
                    : 'Chưa chọn ghế nào'}
                </p>
                <Money
                  value={total}
                  className="text-2xl font-semibold text-fg"
                />
              </div>
              <Button
                size="lg"
                disabled={!selected.length}
                loading={submitting}
                onClick={next}
                rightIcon={<ArrowRight className="size-4" />}
              >
                Giữ ghế & tiếp tục
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
