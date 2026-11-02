'use client';

import type { RouteDto, TripBatchDto } from '@limousine-workspace/shared-types';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { type BookingDraft, draftStore } from '../../lib/session';

interface BookingCtx {
  trip: TripBatchDto;
  route: RouteDto | null;
  maxSeats: number;
  draft: BookingDraft;
  /** false until sessionStorage has been read (avoid redirect flashes on refresh) */
  ready: boolean;
  update: (patch: Partial<BookingDraft>) => void;
  reset: () => void;
  /** In-progress seat selection (before the hold), shown live in the summary card */
  live: { seats: string[]; prices: Record<string, number> } | null;
  setLive: (
    v: { seats: string[]; prices: Record<string, number> } | null,
  ) => void;
}

const Ctx = createContext<BookingCtx | null>(null);

export function BookingProvider({
  trip,
  route,
  maxSeats,
  children,
}: {
  trip: TripBatchDto;
  route: RouteDto | null;
  maxSeats: number;
  children: ReactNode;
}) {
  const [draft, setDraft] = useState<BookingDraft>({
    trip_id: trip.id,
    seats: [],
  });
  const [ready, setReady] = useState(false);
  const [live, setLive] = useState<BookingCtx['live']>(null);

  // Hydrate from sessionStorage after mount (it does not exist during SSR).
  useEffect(() => {
    const saved = draftStore.get(trip.id);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from browser storage
    if (saved) setDraft(saved);
    setReady(true);
  }, [trip.id]);

  const update = useCallback(
    (patch: Partial<BookingDraft>) =>
      setDraft((d) => {
        const next = { ...d, ...patch, trip_id: trip.id };
        draftStore.set(next);
        return next;
      }),
    [trip.id],
  );

  const reset = useCallback(() => {
    draftStore.clear(trip.id);
    setDraft({ trip_id: trip.id, seats: [] });
  }, [trip.id]);

  const value = useMemo(
    () => ({
      trip,
      route,
      maxSeats,
      draft,
      ready,
      update,
      reset,
      live,
      setLive,
    }),
    [trip, route, maxSeats, draft, ready, update, reset, live],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBooking(): BookingCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useBooking must be used inside <BookingProvider>');
  return ctx;
}

/** Seconds left on the seat hold, ticking every second (null when there is no hold). */
export function useHoldCountdown(expiresAt?: string): number | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [expiresAt]);
  if (!expiresAt) return null;
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1000));
}
