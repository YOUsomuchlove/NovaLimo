import type { DataSource } from 'typeorm';

/** Đồng bộ pickup_geom / dropoff_geom từ lat/lng (sau INSERT/UPDATE). */
export async function syncBookingGeoms(
  dataSource: DataSource,
  bookingId: string,
): Promise<void> {
  await dataSource.query(
    `UPDATE bookings SET
      pickup_geom = ST_SetSRID(ST_MakePoint(pickup_lng, pickup_lat), 4326)::geography,
      dropoff_geom = ST_SetSRID(ST_MakePoint(dropoff_lng, dropoff_lat), 4326)::geography
    WHERE id = $1`,
    [bookingId],
  );
}

export async function syncAllBookingGeoms(dataSource: DataSource): Promise<void> {
  await dataSource.query(`
    UPDATE bookings SET
      pickup_geom = ST_SetSRID(ST_MakePoint(pickup_lng, pickup_lat), 4326)::geography,
      dropoff_geom = ST_SetSRID(ST_MakePoint(dropoff_lng, dropoff_lat), 4326)::geography
  `);
}

export async function syncBookingGeomsForBatch(
  dataSource: DataSource,
  tripBatchId: string,
): Promise<void> {
  await dataSource.query(
    `UPDATE bookings SET
      pickup_geom = ST_SetSRID(ST_MakePoint(pickup_lng, pickup_lat), 4326)::geography,
      dropoff_geom = ST_SetSRID(ST_MakePoint(dropoff_lng, dropoff_lat), 4326)::geography
    WHERE trip_batch_id = $1`,
    [tripBatchId],
  );
}
