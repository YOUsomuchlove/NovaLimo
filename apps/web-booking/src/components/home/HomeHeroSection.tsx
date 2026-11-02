'use client';

import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/vi';
import type { TripBatch } from '@limousine-workspace/shared-types';
import { HOME_HERO_SLIDES, PEN_OVERLAY } from '../../lib/booking-pen-assets';
import { parseRouteEndpoints, resolveRouteName } from '../../lib/route-parse';
import { HomeBookingBar } from './HomeBookingBar';

dayjs.locale('vi');

function cn(...parts: (string | undefined | false)[]) {
  return parts.filter(Boolean).join(' ');
}

type HomeHeroSectionProps = {
  batches: TripBatch[];
  loading: boolean;
};

/**
 * Hero khớp web-bôking.pen: carousel full-bleed, copy trái, thanh đặt vé kính mờ dưới hero.
 */
export function HomeHeroSection({ batches, loading }: HomeHeroSectionProps) {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const [from, setFrom] = useState<string>();
  const [to, setTo] = useState<string>();
  const [date, setDate] = useState<Dayjs>(() => dayjs());
  const [fallbackRoute, setFallbackRoute] = useState<string>();

  const pairs = useMemo(() => {
    const out: { from: string; to: string; routeName: string }[] = [];
    for (const b of batches) {
      const p = parseRouteEndpoints(b.route_name);
      if (p) out.push({ ...p, routeName: b.route_name });
    }
    return out;
  }, [batches]);

  const origins = useMemo(() => {
    const s = new Set(pairs.map((p) => p.from));
    return [...s].sort((a, b) => a.localeCompare(b, 'vi'));
  }, [pairs]);

  const destinations = useMemo(() => {
    if (!from) {
      const s = new Set(pairs.map((p) => p.to));
      return [...s].sort((a, b) => a.localeCompare(b, 'vi'));
    }
    const s = new Set(pairs.filter((p) => p.from === from).map((p) => p.to));
    return [...s].sort((a, b) => a.localeCompare(b, 'vi'));
  }, [pairs, from]);

  const showFallback = pairs.length === 0 && batches.length > 0;
  const routeOptions = useMemo(() => {
    return [...new Set(batches.map((b) => b.route_name))].map((r) => ({
      value: r,
      label: r,
    }));
  }, [batches]);

  useEffect(() => {
    const t = window.setInterval(() => {
      setSlide((s) => (s + 1) % HOME_HERO_SLIDES.length);
    }, 7000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (!from) return;
    if (to && !destinations.includes(to)) setTo(undefined);
  }, [from, to, destinations]);

  useEffect(() => {
    if (origins.length && !from) setFrom(origins[0]);
  }, [origins, from]);

  useEffect(() => {
    if (from && destinations.length && !to) setTo(destinations[0]);
  }, [from, destinations, to]);

  useEffect(() => {
    if (!showFallback || fallbackRoute || routeOptions.length === 0) return;
    setFallbackRoute(routeOptions[0]?.value);
  }, [showFallback, fallbackRoute, routeOptions]);

  function onSearch() {
    if (showFallback && fallbackRoute && date) {
      const q = new URLSearchParams({
        route: fallbackRoute,
        date: date.format('YYYY-MM-DD'),
      });
      router.push(`/search?${q.toString()}`);
      return;
    }
    if (!from || !to || !date) return;
    const routeName = resolveRouteName(from, to, batches);
    if (!routeName) return;
    const q = new URLSearchParams({
      route: routeName,
      date: date.format('YYYY-MM-DD'),
    });
    router.push(`/search?${q.toString()}`);
  }

  const canSearch = showFallback
    ? Boolean(fallbackRoute && date)
    : Boolean(from && to && date && resolveRouteName(from, to, batches));

  return (
    <section className="relative min-h-[600px] w-full overflow-hidden md:min-h-[680px]">
      {HOME_HERO_SLIDES.map((src, i) => (
        <Image
          key={`${src}-${i}`}
          src={src}
          alt=""
          fill
          priority={i === 0}
          className={cn(
            'object-cover object-center transition-opacity duration-800',
            i === slide ? 'opacity-100' : 'opacity-0',
          )}
          sizes="100vw"
        />
      ))}
      <div
        className={cn(
          'pointer-events-none absolute inset-0',
          PEN_OVERLAY.homeHero,
        )}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/35"
        aria-hidden
      />

      <div className="absolute inset-0 z-10 flex flex-col">
        <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 pt-28 pb-6 md:px-16 md:pt-32">
          <div className="max-w-xl text-left">
            <Typography.Text className="block text-sm font-semibold text-[#D4AF37]! md:text-[14px]">
              Đặt vé limousine cao cấp
            </Typography.Text>
            <Typography.Title
              level={1}
              className="mb-4 mt-2 text-3xl font-black leading-[1.08] text-white! md:text-[48px]"
            >
              Chuyến đi sang trọng,
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              đúng giờ, đúng chuẩn
            </Typography.Title>
            <Typography.Paragraph className="mb-0 text-base font-normal leading-relaxed text-[#E8E8EA]! md:text-base">
              Chọn điểm đi - điểm đến và ngày khởi hành. NovaLimo giúp bạn đặt
              vé nhanh chóng, rõ ràng và tin cậy.
            </Typography.Paragraph>
          </div>

          <div className="mt-auto pt-10 md:pt-14" />

          <div className="relative">
            <HomeBookingBar
              loading={loading}
              showFallback={showFallback}
              routeOptions={routeOptions}
              fallbackRoute={fallbackRoute}
              setFallbackRoute={setFallbackRoute}
              origins={origins}
              destinations={destinations}
              from={from}
              to={to}
              setFrom={setFrom}
              setTo={setTo}
              date={date}
              setDate={setDate}
              canSearch={canSearch}
              onSearch={onSearch}
              slide={slide}
              setSlide={setSlide}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
