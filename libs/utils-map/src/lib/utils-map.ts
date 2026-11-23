export interface GeoPoint {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371.0088;

const toRad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * Great-circle distance in kilometers between two WGS84 points using the Haversine formula.
 */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  if (a.lat === b.lat && a.lng === b.lng) return 0;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
  return Math.round(EARTH_RADIUS_KM * c * 1000) / 1000;
}

/**
 * Estimated road distance (Haversine × road detours factor, default 1.28 for VN urban/intercity).
 */
export function roadDistanceKm(
  a: GeoPoint,
  b: GeoPoint,
  roadFactor = 1.28,
): number {
  return Math.round(haversineKm(a, b) * roadFactor * 100) / 100;
}

/**
 * Estimated travel duration in minutes given road distance (km) and average speed (km/h).
 */
export function estimateEtaMinutes(
  distanceKm: number,
  avgSpeedKmh = 42,
): number {
  if (distanceKm <= 0 || avgSpeedKmh <= 0) return 0;
  return Math.max(1, Math.round((distanceKm / avgSpeedKmh) * 60));
}

/**
 * Bounding box `[minLng, minLat, maxLng, maxLat]` suitable for MapLibre `fitBounds`.
 */
export function computeBbox(
  points: readonly GeoPoint[],
): [number, number, number, number] | null {
  if (!points.length) return null;
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
  for (const p of points) {
    if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) continue;
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lng < minLng) minLng = p.lng;
    if (p.lng > maxLng) maxLng = p.lng;
  }
  if (!Number.isFinite(minLat)) return null;
  return [minLng, minLat, maxLng, maxLat];
}

function encodeSignedNumber(num: number): string {
  let sgnNum = num << 1;
  if (num < 0) sgnNum = ~sgnNum;
  let out = '';
  while (sgnNum >= 0x20) {
    out += String.fromCharCode((0x20 | (sgnNum & 0x1f)) + 63);
    sgnNum >>= 5;
  }
  out += String.fromCharCode(sgnNum + 63);
  return out;
}

/**
 * Encodes an array of `{ lat, lng }` coordinates into a standard Google/OSRM 1e-5 polyline string.
 */
export function encodePolyline(points: readonly GeoPoint[]): string {
  let lastLat = 0;
  let lastLng = 0;
  let result = '';
  for (const p of points) {
    const lat = Math.round(p.lat * 1e5);
    const lng = Math.round(p.lng * 1e5);
    result += encodeSignedNumber(lat - lastLat);
    result += encodeSignedNumber(lng - lastLng);
    lastLat = lat;
    lastLng = lng;
  }
  return result;
}

/**
 * Decodes a standard 1e-5 encoded polyline string into `{ lat, lng }[]`.
 */
export function decodePolyline(encoded: string): GeoPoint[] {
  const points: GeoPoint[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index <= encoded.length);
    const dLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dLat;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index <= encoded.length);
    const dLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dLng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}

/**
 * Deep link to open Google Maps turn-by-turn navigation.
 */
export function googleMapsDirectionsUrl(
  origin: GeoPoint,
  destination: GeoPoint,
  waypoints: readonly GeoPoint[] = [],
): string {
  const params = new URLSearchParams({
    api: '1',
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    travelmode: 'driving',
  });
  if (waypoints.length > 0) {
    params.set(
      'waypoints',
      waypoints.map((w) => `${w.lat},${w.lng}`).join('|'),
    );
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/**
 * Deep link to open a single coordinate pin in Google Maps.
 */
export function googleMapsPlaceUrl(point: GeoPoint): string {
  return `https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng}`;
}

/* ---------------- Smart Dispatch Engine (CVRP + 2-opt TSP) ---------------- */

export interface DispatchBookingInput {
  id: string;
  seats: string[];
  pickup: GeoPoint | null;
  dropoff: GeoPoint | null;
}

export interface DispatchRunInput {
  id: string;
  capacity: number;
}

export interface PlannedRunResult {
  run_id: string;
  booking_ids: string[];
  pickup_order: string[];
  dropoff_order: string[];
  seat_count: number;
  planned_distance_km: number;
}

export interface UnassignedBookingResult {
  booking_id: string;
  reason: string;
}

export interface DispatchPlanResult {
  runs: PlannedRunResult[];
  unassigned: UnassignedBookingResult[];
}

function validCoord(p: GeoPoint | null | undefined): GeoPoint {
  if (
    p &&
    Number.isFinite(p.lat) &&
    Number.isFinite(p.lng) &&
    (p.lat !== 0 || p.lng !== 0)
  ) {
    return p;
  }
  // Fallback to central Hanoi if coordinates are missing
  return { lat: 21.0285, lng: 105.8542 };
}

/**
 * Orders bookings by Nearest Neighbor + 2-opt local search to minimize total travel distance.
 */
function orderStopsTsp(items: { id: string; point: GeoPoint }[]): {
  orderedIds: string[];
  distanceKm: number;
} {
  if (items.length <= 1) {
    return { orderedIds: items.map((x) => x.id), distanceKm: 0 };
  }

  // Start from the northernmost/westernmost point for deterministic ordering
  const remaining = [...items];
  remaining.sort(
    (a, b) => b.point.lat - a.point.lat || a.point.lng - b.point.lng,
  );
  const firstItem = remaining.shift();
  if (!firstItem) return { orderedIds: [], distanceKm: 0 };
  const route = [firstItem];

  while (remaining.length > 0) {
    const last = route[route.length - 1];
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineKm(last.point, remaining[i].point);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    route.push(remaining.splice(bestIdx, 1)[0]);
  }

  // 2-opt improvement
  let improved = true;
  let iterations = 0;
  while (improved && iterations < 50) {
    improved = false;
    iterations++;
    for (let i = 0; i < route.length - 2; i++) {
      for (let k = i + 2; k < route.length; k++) {
        const a = route[i].point;
        const b = route[i + 1].point;
        const c = route[k].point;
        const d = k + 1 < route.length ? route[k + 1].point : null;

        const currentCost = haversineKm(a, b) + (d ? haversineKm(c, d) : 0);
        const swappedCost = haversineKm(a, c) + (d ? haversineKm(b, d) : 0);

        if (swappedCost + 1e-6 < currentCost) {
          const reversed = route.slice(i + 1, k + 1).reverse();
          route.splice(i + 1, k - i, ...reversed);
          improved = true;
        }
      }
    }
  }

  let totalKm = 0;
  for (let i = 0; i < route.length - 1; i++) {
    totalKm += roadDistanceKm(route[i].point, route[i + 1].point);
  }
  return {
    orderedIds: route.map((r) => r.id),
    distanceKm: Math.round(totalKm * 10) / 10,
  };
}

/**
 * Spatial clustering + capacity-constrained vehicle assignment + 2-opt pickup/dropoff TSP.
 */
export function planDispatchClusters(
  bookings: readonly DispatchBookingInput[],
  runs: readonly DispatchRunInput[],
): DispatchPlanResult {
  if (!runs.length) {
    return {
      runs: [],
      unassigned: bookings.map((b) => ({
        booking_id: b.id,
        reason: 'Chưa có xe/chuyến chạy trong lô này',
      })),
    };
  }

  // Sort bookings spatially by pickup angle around centroid + seat count (largest first to reduce fragmentation)
  const pts = bookings.map((b) => validCoord(b.pickup));
  const centroid = pts.reduce(
    (acc, p) => ({
      lat: acc.lat + p.lat / pts.length,
      lng: acc.lng + p.lng / pts.length,
    }),
    { lat: 0, lng: 0 },
  );

  const enriched = bookings.map((b) => {
    const pickup = validCoord(b.pickup);
    const dropoff = validCoord(b.dropoff);
    const angle = Math.atan2(
      pickup.lat - centroid.lat,
      pickup.lng - centroid.lng,
    );
    return {
      ...b,
      seatCount: Math.max(1, b.seats.length),
      pickupPt: pickup,
      dropoffPt: dropoff,
      angle,
    };
  });

  // Sweep sort by angle so nearby pickups stay contiguous
  enriched.sort((a, b) => a.angle - b.angle || b.seatCount - a.seatCount);

  const buckets = runs.map((r) => ({
    run_id: r.id,
    capacity: r.capacity,
    usedSeats: 0,
    seatLabels: new Set<string>(),
    items: [] as typeof enriched,
    centroid: null as GeoPoint | null,
  }));

  const unassigned: UnassignedBookingResult[] = [];

  for (const item of enriched) {
    // Find best run that fits capacity, preferring runs whose centroid is closest to item.pickupPt
    // (or an empty run if item is far from existing runs and empty runs remain)
    let bestBucket: (typeof buckets)[number] | null = null;
    let bestScore = Infinity;

    for (const bucket of buckets) {
      if (bucket.usedSeats + item.seatCount > bucket.capacity) continue;

      const hasSeatCollision = item.seats.some((s) => bucket.seatLabels.has(s));
      const collisionPenalty = hasSeatCollision ? 5.0 : 0; // 5 km penalty for duplicate seat label

      if (!bucket.centroid) {
        // Empty bucket gets a mild base distance so we seed clusters across available vehicles
        const emptyCost = 1.5 + collisionPenalty;
        if (emptyCost < bestScore) {
          bestScore = emptyCost;
          bestBucket = bucket;
        }
      } else {
        const dist =
          haversineKm(bucket.centroid, item.pickupPt) + collisionPenalty;
        if (dist < bestScore) {
          bestScore = dist;
          bestBucket = bucket;
        }
      }
    }

    if (!bestBucket) {
      unassigned.push({
        booking_id: item.id,
        reason: 'Vượt sức chứa đội xe hiện có',
      });
      continue;
    }

    bestBucket.items.push(item);
    bestBucket.usedSeats += item.seatCount;
    for (const s of item.seats) bestBucket.seatLabels.add(s);

    // Recompute bucket pickup centroid
    const n = bestBucket.items.length;
    bestBucket.centroid = {
      lat: bestBucket.items.reduce((sum, x) => sum + x.pickupPt.lat, 0) / n,
      lng: bestBucket.items.reduce((sum, x) => sum + x.pickupPt.lng, 0) / n,
    };
  }

  const plannedRuns: PlannedRunResult[] = buckets.map((bucket) => {
    const pickupTsp = orderStopsTsp(
      bucket.items.map((x) => ({ id: x.id, point: x.pickupPt })),
    );
    const dropoffTsp = orderStopsTsp(
      bucket.items.map((x) => ({ id: x.id, point: x.dropoffPt })),
    );

    // Intercity leg from last pickup to first dropoff
    let intercityKm = 0;
    if (bucket.items.length > 0) {
      const lastPickup = bucket.items.find(
        (x) => x.id === pickupTsp.orderedIds[pickupTsp.orderedIds.length - 1],
      );
      const firstDropoff = bucket.items.find(
        (x) => x.id === dropoffTsp.orderedIds[0],
      );
      if (lastPickup && firstDropoff) {
        intercityKm = roadDistanceKm(
          lastPickup.pickupPt,
          firstDropoff.dropoffPt,
        );
      }
    }

    const totalDistanceKm =
      Math.round(
        (pickupTsp.distanceKm + intercityKm + dropoffTsp.distanceKm) * 10,
      ) / 10;

    return {
      run_id: bucket.run_id,
      booking_ids: pickupTsp.orderedIds,
      pickup_order: pickupTsp.orderedIds,
      dropoff_order: dropoffTsp.orderedIds,
      seat_count: bucket.usedSeats,
      planned_distance_km: totalDistanceKm,
    };
  });

  return { runs: plannedRuns, unassigned };
}
