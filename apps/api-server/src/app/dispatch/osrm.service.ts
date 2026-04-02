import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { haversineDistanceMatrix } from './haversine';

@Injectable()
export class OsrmService {
  private readonly logger = new Logger(OsrmService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Returns duration matrix in seconds (or distance-like weights). Falls back to Haversine meters.
   */
  async getDurationMatrix(
    coords: Array<{ lng: number; lat: number }>,
  ): Promise<number[][]> {
    const base = this.config.get<string>('OSRM_BASE_URL')?.replace(/\/$/, '');
    if (!base || coords.length === 0) {
      return haversineDistanceMatrix(coords.map((c) => ({ lat: c.lat, lng: c.lng })));
    }

    const coordStr = coords.map((c) => `${c.lng},${c.lat}`).join(';');
    const url = `${base}/table/v1/driving/${coordStr}?annotations=duration`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        this.logger.warn(`OSRM table failed ${res.status}, using Haversine`);
        return haversineDistanceMatrix(
          coords.map((c) => ({ lat: c.lat, lng: c.lng })),
        );
      }
      const data = (await res.json()) as { durations?: number[][] };
      if (!data.durations?.length) {
        return haversineDistanceMatrix(
          coords.map((c) => ({ lat: c.lat, lng: c.lng })),
        );
      }
      return data.durations;
    } catch (e) {
      this.logger.warn(
        `OSRM error: ${e instanceof Error ? e.message : String(e)} — using Haversine`,
      );
      return haversineDistanceMatrix(
        coords.map((c) => ({ lat: c.lat, lng: c.lng })),
      );
    }
  }
}
