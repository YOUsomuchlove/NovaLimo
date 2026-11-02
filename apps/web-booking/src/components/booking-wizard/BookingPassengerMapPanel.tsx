'use client';

import React, { useMemo } from 'react';

type Geo = { lat: number; lng: number };

function fmtCoord(g: Geo | null): string {
  if (!g) return '—';
  return `${g.lat.toFixed(5)}, ${g.lng.toFixed(5)}`;
}

function osmEmbedUrl(a: Geo | null, b: Geo | null): string {
  const pad = 0.02;
  if (a && b) {
    const minLat = Math.min(a.lat, b.lat) - pad;
    const maxLat = Math.max(a.lat, b.lat) + pad;
    const minLng = Math.min(a.lng, b.lng) - pad;
    const maxLng = Math.max(a.lng, b.lng) + pad;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik`;
  }
  if (a) {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${a.lng - pad},${a.lat - pad},${a.lng + pad},${a.lat + pad}&layer=mapnik`;
  }
  if (b) {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${b.lng - pad},${b.lat - pad},${b.lng + pad},${b.lat + pad}&layer=mapnik`;
  }
  /* Hà Nội mặc định */
  return 'https://www.openstreetmap.org/export/embed.html?bbox=105.75,20.98,105.92,21.12&layer=mapnik';
}

export type BookingPassengerMapPanelProps = {
  pickupLoc: Geo | null;
  dropoffLoc: Geo | null;
};

/** Bản đồ OSM + thanh tọa độ + chú giải (mockup đặt vé). */
export function BookingPassengerMapPanel({
  pickupLoc,
  dropoffLoc,
}: BookingPassengerMapPanelProps) {
  const src = useMemo(
    () => osmEmbedUrl(pickupLoc, dropoffLoc),
    [pickupLoc, dropoffLoc],
  );

  return (
    <div className="relative overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-[#dfe3e8] shadow-inner">
      <div className="relative aspect-[16/11] min-h-[220px] w-full md:aspect-[16/10] md:min-h-[260px]">
        <iframe
          title="Bản đồ điểm đón trả"
          src={src}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-wrap gap-x-5 gap-y-1 bg-[#0a0e1a]/85 px-3 py-2.5 text-[11px] font-semibold text-white sm:px-4 sm:text-xs">
          <span>
            <span className="text-nova-gold">Đón:</span>{' '}
            <span className="font-mono text-white/95">{fmtCoord(pickupLoc)}</span>
          </span>
          <span>
            <span className="text-red-400">Trả:</span>{' '}
            <span className="font-mono text-white/95">{fmtCoord(dropoffLoc)}</span>
          </span>
        </div>
        {pickupLoc ? (
          <div
            className="pointer-events-none absolute z-20 h-4 w-4 -translate-x-1/2 -translate-y-full rounded-full border-2 border-white bg-nova-gold shadow-md sm:h-5 sm:w-5"
            style={{ left: '32%', top: '58%' }}
            aria-hidden
          />
        ) : null}
        {dropoffLoc ? (
          <div
            className="pointer-events-none absolute z-20 h-4 w-4 -translate-x-1/2 -translate-y-full rounded-full border-2 border-white bg-red-500 shadow-md sm:h-5 sm:w-5"
            style={{ left: '68%', top: '52%' }}
            aria-hidden
          />
        ) : null}
        <div className="pointer-events-none absolute bottom-2 left-2 z-10 flex flex-wrap items-center gap-3 rounded-lg bg-white/92 px-2.5 py-1.5 text-[10px] font-bold text-[#0a0e18] shadow sm:bottom-3 sm:left-3 sm:gap-4 sm:px-3 sm:text-[11px]">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block size-2.5 shrink-0 rounded-sm bg-nova-gold sm:size-3"
              aria-hidden
            />
            Điểm đón
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block size-2.5 shrink-0 rounded-sm bg-red-500 sm:size-3"
              aria-hidden
            />
            Điểm trả
          </span>
        </div>
      </div>
      <p className="border-t border-[#e5e7eb] bg-[#f8f9fa] px-3 py-2 text-center text-[10px] font-medium leading-snug text-[#64748b] sm:px-4 sm:text-xs">
        (Mở phần Maps: nhập điểm đón/trả từ gợi ý để lưu tọa độ)
      </p>
    </div>
  );
}
