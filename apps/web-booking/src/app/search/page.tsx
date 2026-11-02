'use client';

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Alert, Button, Empty } from 'antd';
import dayjs from 'dayjs';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import type { TripBatch } from '@limousine-workspace/shared-types';
import { getApiBaseUrl } from '../../lib/api';
import { formatRouteDash } from '../../lib/route-parse';
import { PEN_BG } from '../../lib/booking-pen-assets';
import {
  HOUR_PRESETS,
  SearchFilterCard,
} from '../../components/search/SearchFilterCard';
import { SearchHeroSection } from '../../components/search/SearchHeroSection';
import { SearchSelectionDrawer } from '../../components/search/SearchSelectionDrawer';
import { SearchSelectionSummary } from '../../components/search/SearchSelectionSummary';
import { SearchTripCard } from '../../components/search/SearchTripCard';
import { getBatchDemoMeta } from '../../components/search/search-batch-demo';

function useLgUp() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia('(min-width: 1024px)');
      mq.addEventListener('change', onStoreChange);
      return () => mq.removeEventListener('change', onStoreChange);
    },
    () => window.matchMedia('(min-width: 1024px)').matches,
    () => false,
  );
}

function SearchPageInner() {
  const searchParams = useSearchParams();
  const route = searchParams.get('route') ?? '';
  const dateStr = searchParams.get('date') ?? dayjs().format('YYYY-MM-DD');
  const apiUrl = getApiBaseUrl();
  const lgUp = useLgUp();

  const [batches, setBatches] = useState<TripBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hourFilter, setHourFilter] = useState<[number, number]>([0, 24]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000000]);
  const [presetHours, setPresetHours] = useState<string[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<TripBatch | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchSeq = useRef(0);

  const loadTripBatches = useCallback(async () => {
    const id = ++fetchSeq.current;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`${apiUrl}/trip-batches`);
      if (id !== fetchSeq.current) return;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as TripBatch[];
      setBatches(data);
    } catch {
      if (id !== fetchSeq.current) return;
      setBatches([]);
      setLoadError(
        'Không tải được danh sách chuyến. Hãy kiểm tra API đang chạy (vd. `nx serve api-server`) và biến `NEXT_PUBLIC_API_URL` nếu cần.',
      );
    } finally {
      if (id === fetchSeq.current) setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    void loadTripBatches();
  }, [loadTripBatches]);

  const filtered = useMemo(() => {
    const presetRanges = HOUR_PRESETS.filter((p) =>
      presetHours.includes(p.label),
    ).map((p) => p.value);

    return batches.filter((b) => {
      if (route && b.route_name !== route) return false;
      const d = dayjs(b.departure_time);
      if (!d.isSame(dayjs(dateStr), 'day')) return false;
      const h = d.hour() + d.minute() / 60;
      if (presetRanges.length > 0) {
        const inSlot = presetRanges.some(
          ([lo, hi]) => h >= lo && h <= hi,
        );
        if (!inSlot) return false;
      } else if (h < hourFilter[0] || h > hourFilter[1]) {
        return false;
      }
      const { mockPrice, capacity } = getBatchDemoMeta(b);
      if (mockPrice < priceRange[0] || mockPrice > priceRange[1]) return false;
      const capKey = String(capacity);
      if (vehicleTypes.length > 0 && !vehicleTypes.includes(capKey)) return false;
      return b.status === 'OPEN';
    });
  }, [
    batches,
    route,
    dateStr,
    hourFilter,
    presetHours,
    priceRange,
    vehicleTypes,
  ]);

  const routeTitle = route
    ? formatRouteDash(route)
    : 'tất cả tuyến';

  const applyPresetHours = useCallback((values: string[]) => {
    setPresetHours(values);
    if (values.length === 0) {
      setHourFilter([0, 24]);
      return;
    }
    const ranges = HOUR_PRESETS.filter((p) => values.includes(p.label)).map(
      (p) => p.value,
    );
    const min = Math.min(...ranges.map((r) => r[0]));
    const max = Math.max(...ranges.map((r) => r[1]));
    setHourFilter([min, max]);
  }, []);

  const resetFilters = useCallback(() => {
    setPresetHours([]);
    setHourFilter([0, 24]);
    setPriceRange([0, 3000000]);
    setVehicleTypes([]);
  }, []);

  const handleSelectTrip = useCallback(
    (b: TripBatch) => {
      setSelectedBatch(b);
      if (!lgUp) setDrawerOpen(true);
    },
    [lgUp],
  );

  const selectedMeta = selectedBatch ? getBatchDemoMeta(selectedBatch) : null;

  return (
    <div className="search-results-page relative min-h-screen bg-[#070b14]">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <Image
          src={PEN_BG.searchResults}
          alt=""
          fill
          priority
          className="object-cover object-center opacity-95"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-[#070b14]/86 backdrop-blur-[1px]"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1320px] px-4 pb-20 pt-4 sm:px-6 md:px-8 lg:pt-6">
        {loadError ? (
          <Alert
            type="error"
            showIcon
            className="mb-4 rounded-[14px] border-red-500/35 bg-red-950/40 text-red-100 [&_.ant-alert-message]:font-bold [&_.ant-alert-description]:text-red-100/90"
            message="Lỗi tải dữ liệu"
            description={loadError}
            action={
              <Button
                size="small"
                type="primary"
                danger
                ghost
                className="font-bold"
                onClick={() => void loadTripBatches()}
              >
                Thử lại
              </Button>
            }
          />
        ) : null}
        <SearchHeroSection tripCount={filtered.length} routeTitle={routeTitle} />

        <div className="mt-2 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(260px,300px)_minmax(0,1fr)_minmax(260px,300px)] lg:items-start lg:gap-8">
          <aside className="min-w-0 lg:max-w-[300px]">
            <SearchFilterCard
              loading={loading}
              presetHours={presetHours}
              onPresetHoursChange={(v) => applyPresetHours(v as string[])}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              vehicleTypes={vehicleTypes}
              onVehicleTypesChange={setVehicleTypes}
              onReset={resetFilters}
            />
          </aside>

          <main className="min-w-0 space-y-4">
            {!loadError && filtered.length === 0 && !loading ? (
              <Empty
                className="rounded-[18px] border border-white/10 bg-white/[0.06] py-14"
                description={
                  <span className="text-sm font-medium text-white/70">
                    Không có chuyến phù hợp
                  </span>
                }
              />
            ) : null}
            {filtered.map((b) => {
              const { mockPrice, capacity, seatsLeft } = getBatchDemoMeta(b);
              return (
                <SearchTripCard
                  key={b.id}
                  departureTime={b.departure_time}
                  mockPrice={mockPrice}
                  capacity={capacity}
                  seatsLeft={seatsLeft}
                  onSelect={() => handleSelectTrip(b)}
                />
              );
            })}
          </main>

          <aside className="hidden min-h-0 lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-hidden rounded-[18px] border border-[#1c2436] bg-[#0a0e18] shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
              {selectedBatch && selectedMeta ? (
                <SearchSelectionSummary
                  batch={selectedBatch}
                  mockPrice={selectedMeta.mockPrice}
                  capacity={selectedMeta.capacity}
                  seatsLeft={selectedMeta.seatsLeft}
                />
              ) : (
                <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 px-8 text-center">
                  <p className="text-base font-bold text-white/90">
                    Chọn chuyến
                  </p>
                  <p className="text-sm font-medium leading-relaxed text-white/55">
                    Nhấn &quot;Chọn chuyến&quot; trên một thẻ để xem tóm tắt và
                    xác nhận đặt vé.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <SearchSelectionDrawer
        open={drawerOpen && !lgUp}
        batch={selectedBatch}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] bg-[#070b14] p-8 text-center text-white/60">
          Đang tải…
        </div>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}
