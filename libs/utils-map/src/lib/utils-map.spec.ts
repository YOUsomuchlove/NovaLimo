import {
  computeBbox,
  decodePolyline,
  encodePolyline,
  estimateEtaMinutes,
  googleMapsDirectionsUrl,
  googleMapsPlaceUrl,
  haversineKm,
  planDispatchClusters,
  roadDistanceKm,
  type DispatchBookingInput,
  type DispatchRunInput,
} from './utils-map';

describe('utils-map', () => {
  describe('haversineKm & roadDistanceKm & estimateEtaMinutes', () => {
    it('computes accurate great-circle distance between Hoan Kiem (Hanoi) and Bai Chay (Ha Long)', () => {
      const hoanKiem = { lat: 21.0285, lng: 105.8542 };
      const baiChay = { lat: 20.9599, lng: 107.0425 };
      const d = haversineKm(hoanKiem, baiChay);
      // ~123.5 km straight line
      expect(d).toBeGreaterThan(120);
      expect(d).toBeLessThan(128);

      const road = roadDistanceKm(hoanKiem, baiChay, 1.25);
      expect(road).toBeCloseTo(d * 1.25, 2);

      const eta = estimateEtaMinutes(100, 50);
      expect(eta).toBe(120);
    });

    it('returns 0 for identical coordinates', () => {
      expect(
        haversineKm({ lat: 21.0, lng: 105.8 }, { lat: 21.0, lng: 105.8 }),
      ).toBe(0);
    });
  });

  describe('computeBbox', () => {
    it('returns null for empty array and bounding box [minLng, minLat, maxLng, maxLat] for points', () => {
      expect(computeBbox([])).toBeNull();
      const bbox = computeBbox([
        { lat: 21.02, lng: 105.85 },
        { lat: 20.95, lng: 107.04 },
        { lat: 21.05, lng: 105.78 },
      ]);
      expect(bbox).toEqual([105.78, 20.95, 107.04, 21.05]);
    });
  });

  describe('encodePolyline & decodePolyline', () => {
    it('round-trips coordinates with 1e-5 precision', () => {
      const pts = [
        { lat: 21.02851, lng: 105.85422 },
        { lat: 21.03623, lng: 105.79054 },
        { lat: 20.95991, lng: 107.04251 },
      ];
      const encoded = encodePolyline(pts);
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(8);

      const decoded = decodePolyline(encoded);
      expect(decoded).toHaveLength(pts.length);
      for (let i = 0; i < pts.length; i++) {
        expect(decoded[i].lat).toBeCloseTo(pts[i].lat, 4);
        expect(decoded[i].lng).toBeCloseTo(pts[i].lng, 4);
      }
    });
  });

  describe('Google Maps deep links', () => {
    it('builds directions URL with waypoints and place URL', () => {
      const url = googleMapsDirectionsUrl(
        { lat: 21.0285, lng: 105.8542 },
        { lat: 20.9599, lng: 107.0425 },
        [{ lat: 21.0362, lng: 105.7905 }],
      );
      expect(url).toContain('https://www.google.com/maps/dir/?api=1');
      expect(url).toContain('origin=21.0285%2C105.8542');
      expect(url).toContain('destination=20.9599%2C107.0425');
      expect(url).toContain('waypoints=21.0362%2C105.7905');

      const place = googleMapsPlaceUrl({ lat: 21.0285, lng: 105.8542 });
      expect(place).toContain('21.0285,105.8542');
    });
  });

  describe('planDispatchClusters (Smart Dispatch CVRP + 2-opt TSP)', () => {
    it('packs 30 passengers across 3 vehicles in Hanoi without exceeding capacity and orders stops spatially', () => {
      // 3 spatial clusters in Hanoi: Hoan Kiem (east), Cau Giay (west), Thanh Xuan (south)
      const clusters = [
        { baseLat: 21.0285, baseLng: 105.8542 }, // Hoan Kiem
        { baseLat: 21.0362, baseLng: 105.7905 }, // Cau Giay
        { baseLat: 20.995, baseLng: 105.805 }, // Thanh Xuan
      ];
      // 15 bookings of 2 seats each = 30 passengers; 3 vehicles of 11 seats each = 33 capacity
      const bookings: DispatchBookingInput[] = [];
      for (let i = 0; i < 15; i++) {
        const c = clusters[i % 3];
        const offset = Math.floor(i / 3) * 0.002;
        bookings.push({
          id: `b-${i + 1}`,
          seats: [`A${(i % 5) + 1}`, `B${(i % 5) + 1}`],
          pickup: { lat: c.baseLat + offset, lng: c.baseLng + offset },
          dropoff: { lat: 20.9599 + offset, lng: 107.0425 + offset },
        });
      }

      const runs: DispatchRunInput[] = [
        { id: 'run-1', capacity: 11 },
        { id: 'run-2', capacity: 11 },
        { id: 'run-3', capacity: 11 },
      ];

      const plan = planDispatchClusters(bookings, runs);

      expect(plan.unassigned).toHaveLength(0);
      expect(plan.runs).toHaveLength(3);

      let totalAssignedBookings = 0;
      for (const r of plan.runs) {
        expect(r.seat_count).toBeLessThanOrEqual(11);
        expect(r.booking_ids.length).toBeGreaterThan(0);
        expect(r.pickup_order).toHaveLength(r.booking_ids.length);
        expect(r.dropoff_order).toHaveLength(r.booking_ids.length);
        expect(r.planned_distance_km).toBeGreaterThan(0);
        totalAssignedBookings += r.booking_ids.length;
      }
      expect(totalAssignedBookings).toBe(15);
    });

    it('puts overflow bookings into unassigned with reason when demand exceeds fleet capacity', () => {
      const bookings: DispatchBookingInput[] = [
        {
          id: 'b-1',
          seats: ['A1', 'A2', 'A3', 'A4', 'A5'],
          pickup: { lat: 21.0285, lng: 105.8542 },
          dropoff: { lat: 20.9599, lng: 107.0425 },
        },
        {
          id: 'b-2',
          seats: ['B1', 'B2', 'B3', 'B4', 'B5'],
          pickup: { lat: 21.029, lng: 105.855 },
          dropoff: { lat: 20.96, lng: 107.043 },
        },
      ];
      const runs: DispatchRunInput[] = [{ id: 'run-1', capacity: 9 }];

      const plan = planDispatchClusters(bookings, runs);
      expect(plan.runs[0].booking_ids).toEqual(['b-1']);
      expect(plan.runs[0].seat_count).toBe(5);
      expect(plan.unassigned).toEqual([
        { booking_id: 'b-2', reason: 'Vượt sức chứa đội xe hiện có' },
      ]);
    });
  });
});
