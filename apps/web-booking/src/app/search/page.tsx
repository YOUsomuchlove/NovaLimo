import { buttonClasses, cn } from '@limousine-workspace/shared-ui';
import { formatWeekdayDate } from '@limousine-workspace/utils-core';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { TripSearchForm } from '../../components/home/TripSearchForm';
import { TripResults } from '../../components/search/TripResults';
import { Container } from '../../components/site/Section';
import { publicApi, safe } from '../../lib/api';
import { DEMO_ROUTES } from '../../lib/demo-data';

export const metadata: Metadata = {
  title: 'Kết quả tìm chuyến',
  robots: { index: false },
};

const vnToday = () =>
  new Date(Date.now() + 7 * 3_600_000).toISOString().slice(0, 10);
const addDays = (d: string, n: number) => {
  const x = new Date(`${d}T00:00:00Z`);
  x.setUTCDate(x.getUTCDate() + n);
  return x.toISOString().slice(0, 10);
};

type Search = Promise<{ route?: string; date?: string; seats?: string }>;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const sp = await searchParams;
  const today = vnToday();
  const date =
    sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) && sp.date >= today
      ? sp.date
      : today;
  const seats = Math.min(6, Math.max(1, Number(sp.seats) || 1));
  const liveRoutes = await safe(publicApi.routes(), []);
  const routes = liveRoutes.length ? liveRoutes : DEMO_ROUTES;
  const route = routes.find((r) => r.id === sp.route);

  const href = (d: string) =>
    `/search?route=${route?.id ?? ''}&date=${d}&seats=${seats}`;
  const start = addDays(date, -2) < today ? today : addDays(date, -2);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  let trips = null as Awaited<ReturnType<typeof publicApi.trips>> | null;
  let failed = false;
  if (route) {
    try {
      trips = await publicApi.trips({ route_id: route.id, date });
    } catch {
      failed = true;
    }
  }

  return (
    <>
      <div className="nl-hero-sky border-b border-border-subtle">
        <Container className="py-8 sm:py-10">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
          >
            <ArrowLeft className="size-4" /> Trang chủ
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            {route ? (
              <>
                {route.origin_name} <span className="text-brand-fg">→</span>{' '}
                {route.destination_name}
              </>
            ) : (
              'Tìm chuyến xe'
            )}
          </h1>
          <div className="mt-6 rounded-sheet border border-border-default bg-surface-1/95 p-4 shadow-e2 backdrop-blur-xl sm:p-5">
            <TripSearchForm
              routes={routes}
              initial={{ route_id: route?.id, date, seats }}
              compact
            />
          </div>
        </Container>
      </div>

      <Container className="py-8 sm:py-10">
        {route && (
          <nav
            aria-label="Chọn ngày"
            className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
          >
            {days.map((d) => (
              <Link
                key={d}
                href={href(d)}
                aria-current={d === date ? 'date' : undefined}
                className={cn(
                  'flex min-w-[92px] shrink-0 flex-col items-center rounded-card border px-3 py-2.5 text-sm capitalize transition-colors',
                  d === date
                    ? 'border-brand bg-brand-subtle text-brand-fg'
                    : 'border-border-subtle bg-surface-1 text-fg-secondary hover:border-border-strong',
                )}
              >
                <span className="text-xs opacity-80">
                  {d === today
                    ? 'Hôm nay'
                    : formatWeekdayDate(`${d}T05:00:00Z`).split(',')[0]}
                </span>
                <span className="font-semibold tabular-nums">
                  {d.slice(8, 10)}/{d.slice(5, 7)}
                </span>
              </Link>
            ))}
          </nav>
        )}

        {!route ? (
          <p className="text-fg-muted">
            Chọn điểm đi, điểm đến và ngày khởi hành để xem các chuyến.
          </p>
        ) : failed ? (
          <div className="rounded-panel border border-danger-border bg-danger-bg p-6 text-sm text-danger-fg">
            Không tải được danh sách chuyến. Vui lòng thử lại sau ít phút.{' '}
            <Link
              href={href(date)}
              className={buttonClasses({ variant: 'link' })}
            >
              Thử lại
            </Link>
          </div>
        ) : (
          <TripResults
            trips={trips ?? []}
            seats={seats}
            nextDayHref={href(addDays(date, 1))}
          />
        )}
      </Container>
    </>
  );
}
