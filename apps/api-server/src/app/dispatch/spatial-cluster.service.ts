import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import type { DataSource } from 'typeorm';
import type { BookingEntity } from '../entities/booking.entity';

/**
 * Gom cụm điểm đón bằng PostGIS ST_ClusterDBSCAN trên Web Mercator (eps mét).
 * Fallback: null nếu PostGIS lỗi — caller dùng k-means.
 */
@Injectable()
export class SpatialClusterService {
  private readonly logger = new Logger(SpatialClusterService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /**
   * @returns Map bookingId -> cluster index (0..k-1), hoặc null nếu không chạy được
   */
  async clusterPickupLabels(
    batchId: string,
    epsMeters: number,
    minPoints = 1,
  ): Promise<Map<string, number> | null> {
    try {
      const rows = (await this.dataSource.query(
        `
        SELECT id::text AS id,
               ST_ClusterDBSCAN(
                 ST_Transform(pickup_geom::geometry, 3857),
                 eps := $2,
                 minpoints := $3
               ) OVER () AS cid
        FROM bookings
        WHERE trip_batch_id = $1
          AND pickup_geom IS NOT NULL
        `,
        [batchId, epsMeters, minPoints],
      )) as Array<{ id: string; cid: number | null }>;

      if (rows.length === 0) return null;

      const map = new Map<string, number>();
      const cidToIdx = new Map<number, number>();
      let next = 0;
      for (const r of rows) {
        let cid = r.cid ?? 0;
        if (cid < 0) cid = -1;
        if (!cidToIdx.has(cid)) {
          cidToIdx.set(cid, next++);
        }
        map.set(r.id, cidToIdx.get(cid)!);
      }
      return map;
    } catch (e) {
      this.logger.warn(
        `PostGIS cluster failed: ${e instanceof Error ? e.message : String(e)}`,
      );
      return null;
    }
  }

  /**
   * Danh sách booking id trong bán kính (mét) quanh một điểm — helper cho ST_DWithin.
   */
  async idsWithinPickupRadius(
    batchId: string,
    center: { lat: number; lng: number },
    radiusM: number,
  ): Promise<string[]> {
    const rows = (await this.dataSource.query(
      `
      SELECT id::text AS id FROM bookings
      WHERE trip_batch_id = $1
        AND pickup_geom IS NOT NULL
        AND ST_DWithin(
          pickup_geom::geography,
          ST_SetSRID(ST_MakePoint($3, $2), 4326)::geography,
          $4
        )
      `,
      [batchId, center.lat, center.lng, radiusM],
    )) as Array<{ id: string }>;
    return rows.map((r) => r.id);
  }

  /** Nhóm BookingEntity theo label cluster. */
  groupByLabels(
    batchBookings: BookingEntity[],
    labels: Map<string, number>,
  ): BookingEntity[][] {
    const byLab = new Map<number, BookingEntity[]>();
    for (const b of batchBookings) {
      const lab = labels.get(b.id) ?? 0;
      if (!byLab.has(lab)) byLab.set(lab, []);
      byLab.get(lab)!.push(b);
    }
    return [...byLab.values()].filter((g) => g.length > 0);
  }
}
