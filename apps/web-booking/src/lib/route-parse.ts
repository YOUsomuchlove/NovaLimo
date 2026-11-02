import type { TripBatch } from '@limousine-workspace/shared-types';

/** Tách "Điểm đi → Điểm đến" từ `route_name` API (hỗ trợ →, ->, –, —, -). */
export function parseRouteEndpoints(
  routeName: string,
): { from: string; to: string } | null {
  const s = routeName.trim();
  const m = s.match(/^(.+?)\s*(?:→|->|–|—|-)\s*(.+)$/u);
  if (!m) return null;
  return { from: m[1].trim(), to: m[2].trim() };
}

/** Hiển thị kiểu thiết kế: "Hà Nội - Quảng Ninh". */
export function formatRouteDash(routeName: string): string {
  const p = parseRouteEndpoints(routeName);
  if (p) return `${p.from} - ${p.to}`;
  return routeName.trim();
}

/** Tìm `route_name` khớp cặp điểm đi/đến trong danh sách batch. */
export function resolveRouteName(
  from: string,
  to: string,
  batches: TripBatch[],
): string | undefined {
  const names = [...new Set(batches.map((b) => b.route_name))];
  const variants = [
    `${from} → ${to}`,
    `${from} -> ${to}`,
    `${from} – ${to}`,
    `${from} - ${to}`,
  ];
  for (const v of variants) {
    if (names.includes(v)) return v;
  }
  for (const name of names) {
    const p = parseRouteEndpoints(name);
    if (p && p.from === from && p.to === to) return name;
  }
  return undefined;
}
