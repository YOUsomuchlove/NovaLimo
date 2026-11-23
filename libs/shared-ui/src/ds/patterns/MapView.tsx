'use client';

import {
  alpha,
  categorical,
  palette,
} from '@limousine-workspace/design-tokens';
import type { Map as MlMap, Marker as MlMarker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../utils/cn';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  /** Short text inside the pin (e.g. pickup order "3") */
  label?: string;
  /** Hover title */
  title?: string;
  kind?: 'pickup' | 'dropoff' | 'vehicle' | 'default';
  tone?: 'brand' | 'info' | 'success' | 'danger' | 'warning' | 'neutral';
  /** Index into the categorical palette (vehicle colour) */
  colorIndex?: number;
  onClick?: () => void;
}

export interface MapRoute {
  id: string;
  /** [lng, lat] pairs */
  coordinates: [number, number][];
  colorIndex?: number;
  dashed?: boolean;
}

export interface MapViewProps {
  markers?: MapMarker[];
  routes?: MapRoute[];
  /** Convenience single polyline as `{ lat, lng }[]` */
  polyline?: { lat: number; lng: number }[];
  /** Optional height in px or CSS units (defaults to 320px if no h-* class) */
  height?: number | string;
  center?: [number, number];
  zoom?: number;
  /** Fit bounds to markers/routes whenever they change */
  fitToContent?: boolean;
  theme?: 'dark' | 'light';
  /** Override the default basemap style URL */
  styleUrl?: string;
  className?: string;
}

/** Hà Nội — Hoàn Kiếm */
const DEFAULT_CENTER: [number, number] = [105.8542, 21.0285];

/**
 * Default basemaps: OpenFreeMap vector styles (free, no API key). `fiord` is a navy dark style
 * that sits well with the brand; `positron` for light surfaces. Override with `styleUrl`
 * (e.g. MapTiler with a key) in production if needed.
 */
const DEFAULT_STYLE: Record<'dark' | 'light', string> = {
  dark: 'https://tiles.openfreemap.org/styles/fiord',
  light: 'https://tiles.openfreemap.org/styles/positron',
};

const colorFor = (i = 0) => categorical[i % categorical.length];

function markerElement(m: MapMarker): HTMLElement {
  const el = document.createElement('button');
  el.type = 'button';
  el.title = m.title ?? '';
  el.setAttribute('aria-label', m.title ?? m.label ?? 'Điểm trên bản đồ');
  const color = colorFor(m.colorIndex);
  if (m.kind === 'vehicle') {
    el.className =
      'flex size-9 items-center justify-center rounded-full border-2 border-white/90 shadow-e3 transition-transform hover:scale-110';
    el.style.background = color;
    el.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="${palette.navy[800]}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2l.64-2.54c.24-.959.24-1.962 0-2.92l-1.07-4.27A3 3 0 0 0 17.66 5H4a2 2 0 0 0-2 2v10h2"/><path d="M14 17H9"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/></svg>`;
  } else {
    const dropoff = m.kind === 'dropoff';
    el.className =
      'flex h-7 min-w-7 items-center justify-center rounded-full border-2 px-1.5 text-[11px] font-bold shadow-e2 transition-transform hover:scale-110';
    el.style.background = dropoff ? palette.navy[800] : color;
    el.style.borderColor = dropoff ? color : alpha(palette.white, 0.9);
    el.style.color = dropoff ? color : palette.navy[800];
    el.textContent = m.label ?? '';
  }
  if (m.onClick) el.addEventListener('click', m.onClick);
  return el;
}

/**
 * MapLibre map with numbered pickup/dropoff pins, vehicle markers and route polylines.
 * Client-only; the parent should give it a height (e.g. `h-[480px]`).
 */
export function MapView({
  markers = [],
  routes = [],
  polyline,
  height,
  center = DEFAULT_CENTER,
  zoom = 12,
  fitToContent = true,
  theme = 'dark',
  styleUrl,
  className,
}: MapViewProps) {
  const effectiveRoutes: MapRoute[] =
    polyline && polyline.length > 1
      ? [
          ...routes,
          {
            id: 'polyline-main',
            coordinates: polyline.map(
              (p) => [p.lng, p.lat] as [number, number],
            ),
            colorIndex: 0,
          },
        ]
      : routes;
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const markerRefs = useRef<MlMarker[]>([]);
  const [ready, setReady] = useState(false);
  const lib = useRef<typeof import('maplibre-gl') | null>(null);

  // create once
  useEffect(() => {
    let cancelled = false;
    void import('maplibre-gl').then((ml) => {
      if (cancelled || !container.current) return;
      lib.current = ml;
      const m = new ml.Map({
        container: container.current,
        style: styleUrl ?? DEFAULT_STYLE[theme],
        center,
        zoom,
        attributionControl: { compact: true },
      });
      m.addControl(
        new ml.NavigationControl({ showCompass: false }),
        'top-right',
      );
      m.on('load', () => setReady(true));
      map.current = m;
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      setReady(false);
    };
  }, [theme, styleUrl]);

  // markers
  useEffect(() => {
    const m = map.current;
    const ml = lib.current;
    if (!ready || !m || !ml) return;
    markerRefs.current.forEach((mk) => mk.remove());
    markerRefs.current = markers.map((mk) =>
      new ml.Marker({ element: markerElement(mk), anchor: 'center' })
        .setLngLat([mk.lng, mk.lat])
        .addTo(m),
    );
  }, [ready, markers]);

  // routes
  useEffect(() => {
    const m = map.current;
    if (!ready || !m) return;
    const style = m.getStyle();
    style.layers
      .filter((l) => l.id.startsWith('route-'))
      .forEach((l) => m.removeLayer(l.id));
    Object.keys(style.sources)
      .filter((id) => id.startsWith('route-'))
      .forEach((id) => m.removeSource(id));
    effectiveRoutes.forEach((r) => {
      const id = `route-${r.id}`;
      m.addSource(id, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: r.coordinates },
        },
      });
      m.addLayer({
        id: `${id}-casing`,
        type: 'line',
        source: id,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': palette.navy[900],
          'line-width': 7,
          'line-opacity': 0.55,
        },
      });
      m.addLayer({
        id,
        type: 'line',
        source: id,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': colorFor(r.colorIndex),
          'line-width': 4,
          ...(r.dashed ? { 'line-dasharray': [1.5, 1.5] } : {}),
        },
      });
    });
  }, [ready, effectiveRoutes]);

  // fit
  useEffect(() => {
    const m = map.current;
    const ml = lib.current;
    if (!ready || !m || !ml || !fitToContent) return;
    const pts: [number, number][] = [
      ...markers.map((mk) => [mk.lng, mk.lat] as [number, number]),
      ...effectiveRoutes.flatMap((r) => r.coordinates),
    ];
    if (pts.length === 0) return;
    if (pts.length === 1) {
      m.easeTo({ center: pts[0], zoom: 14, duration: 600 });
      return;
    }
    const bounds = pts.reduce(
      (b, p) => b.extend(p),
      new ml.LngLatBounds(pts[0], pts[0]),
    );
    m.fitBounds(bounds, { padding: 56, maxZoom: 15, duration: 600 });
  }, [ready, markers, effectiveRoutes, fitToContent]);

  return (
    <div
      style={height !== undefined ? { height } : undefined}
      className={cn(
        'relative overflow-hidden rounded-card border border-border-subtle bg-surface-2',
        height === undefined && 'min-h-[300px]',
        className,
      )}
    >
      {/* inline style: maplibre's unlayered `.maplibregl-map { position: relative }` would beat a Tailwind class */}
      <div ref={container} style={{ position: 'absolute', inset: 0 }} />
      {!ready && <div className="nl-skeleton absolute inset-0" aria-hidden />}
    </div>
  );
}
