import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * PostGIS geography points for pickup/dropoff — ST_DWithin, ST_ClusterDBSCAN, GIST.
 */
export class BookingPickupDropoffGeom1743000000000 implements MigrationInterface {
  name = 'BookingPickupDropoffGeom1743000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
    await queryRunner.query(`
      ALTER TABLE "bookings"
      ADD COLUMN IF NOT EXISTS "pickup_geom" geography(Point,4326),
      ADD COLUMN IF NOT EXISTS "dropoff_geom" geography(Point,4326)
    `);
    await queryRunner.query(`
      UPDATE "bookings" SET
        "pickup_geom" = ST_SetSRID(ST_MakePoint("pickup_lng", "pickup_lat"), 4326)::geography,
        "dropoff_geom" = ST_SetSRID(ST_MakePoint("dropoff_lng", "dropoff_lat"), 4326)::geography
      WHERE "pickup_geom" IS NULL OR "dropoff_geom" IS NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_bookings_pickup_geom"
      ON "bookings" USING GIST ("pickup_geom")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_bookings_dropoff_geom"
      ON "bookings" USING GIST ("dropoff_geom")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_bookings_dropoff_geom"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_bookings_pickup_geom"`);
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP COLUMN IF EXISTS "dropoff_geom"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP COLUMN IF EXISTS "pickup_geom"`,
    );
  }
}
