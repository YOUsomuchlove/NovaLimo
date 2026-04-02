import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { syncAllBookingGeoms } from '../utils/sync-booking-geom';

@Injectable()
export class DatabaseInitService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseInitService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.dataSource.query('CREATE EXTENSION IF NOT EXISTS postgis');
      this.logger.log('PostGIS extension ready');
    } catch (err) {
      this.logger.warn(
        `PostGIS extension skipped (${err instanceof Error ? err.message : String(err)}). Spatial queries may fail until Postgres+PostGIS is available.`,
      );
    }
    try {
      await syncAllBookingGeoms(this.dataSource);
      this.logger.log('Booking pickup/dropoff geography synced from lat/lng');
    } catch (err) {
      this.logger.warn(
        `Booking geom sync skipped (${err instanceof Error ? err.message : String(err)})`,
      );
    }
  }
}
