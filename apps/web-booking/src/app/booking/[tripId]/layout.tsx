import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { BookingProvider } from '../../../components/booking/BookingContext';
import { BookingShell } from '../../../components/booking/BookingShell';
import { ApiError, DEFAULT_SETTINGS, publicApi, safe } from '../../../lib/api';

export const metadata: Metadata = { title: 'Đặt vé', robots: { index: false } };

export default async function BookingLayout({
  params,
  children,
}: {
  params: Promise<{ tripId: string }>;
  children: ReactNode;
}) {
  const { tripId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(tripId)) notFound();
  let trip;
  try {
    trip = await publicApi.trip(tripId);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400))
      notFound();
    throw e;
  }
  const [routes, settings] = await Promise.all([
    safe(publicApi.routes(), []),
    safe(publicApi.settings(), DEFAULT_SETTINGS),
  ]);
  const route = routes.find((r) => r.id === trip.route.id) ?? null;

  return (
    <BookingProvider
      trip={trip}
      route={route}
      maxSeats={settings.booking.max_seats_per_booking}
    >
      <BookingShell>{children}</BookingShell>
    </BookingProvider>
  );
}
