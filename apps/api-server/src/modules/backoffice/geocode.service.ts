import type { LatLng } from '@limousine-workspace/shared-types';
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { InjectEnv } from '../../config/config.module';
import type { Env } from '../../config/env';

export class GeocodeQuery {
  @ApiProperty() @IsString() @MinLength(3) @MaxLength(200) q!: string;
  @ApiPropertyOptional({ description: 'Ưu tiên kết quả gần điểm này' })
  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  near_lat?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  near_lng?: number;
}

export class ReverseQuery {
  @ApiProperty() @Type(() => Number) @IsLatitude() lat!: number;
  @ApiProperty() @Type(() => Number) @IsLongitude() lng!: number;
}

export interface GeocodeHit extends LatLng {
  display_name: string;
}

/** Small LRU so repeated keystrokes don't hit the upstream geocoder. */
class Lru<V> {
  private map = new Map<string, { v: V; at: number }>();
  constructor(
    private readonly max: number,
    private readonly ttlMs: number,
  ) {}
  get(k: string): V | undefined {
    const e = this.map.get(k);
    if (!e || Date.now() - e.at > this.ttlMs) return undefined;
    this.map.delete(k);
    this.map.set(k, e);
    return e.v;
  }
  set(k: string, v: V) {
    this.map.delete(k);
    this.map.set(k, { v, at: Date.now() });
    if (this.map.size > this.max)
      this.map.delete(this.map.keys().next().value as string);
  }
}

/**
 * Nominatim (OpenStreetMap) proxy limited to Việt Nam. Server-side so we control rate, cache and
 * User-Agent per the Nominatim usage policy; swap for a commercial geocoder by changing this file.
 */
@Injectable()
export class GeocodeService {
  private readonly logger = new Logger(GeocodeService.name);
  private readonly cache = new Lru<GeocodeHit[]>(2000, 24 * 3_600_000);

  constructor(@InjectEnv() private readonly env: Env) {}

  async search(q: GeocodeQuery): Promise<GeocodeHit[]> {
    const term = q.q.trim().replace(/\s+/g, ' ');
    const key = `${term.toLowerCase()}|${q.near_lat?.toFixed(2)}|${q.near_lng?.toFixed(2)}`;
    const hit = this.cache.get(key);
    if (hit) return hit;
    const params = new URLSearchParams({
      q: term,
      format: 'jsonv2',
      countrycodes: 'vn',
      limit: '8',
      'accept-language': 'vi',
      addressdetails: '0',
    });
    if (q.near_lat !== undefined && q.near_lng !== undefined) {
      const d = 0.6;
      params.set(
        'viewbox',
        `${q.near_lng - d},${q.near_lat + d},${q.near_lng + d},${q.near_lat - d}`,
      );
    }
    const rows = await this.fetchJson<
      { lat: string; lon: string; display_name: string }[]
    >(`https://nominatim.openstreetmap.org/search?${params}`);
    const out = rows.map((r) => ({
      lat: Number(r.lat),
      lng: Number(r.lon),
      display_name: r.display_name,
    }));
    this.cache.set(key, out);
    return out;
  }

  async reverse(q: ReverseQuery): Promise<GeocodeHit | null> {
    const key = `rev|${q.lat.toFixed(5)}|${q.lng.toFixed(5)}`;
    const hit = this.cache.get(key);
    if (hit) return hit[0] ?? null;
    const params = new URLSearchParams({
      lat: String(q.lat),
      lon: String(q.lng),
      format: 'jsonv2',
      'accept-language': 'vi',
      zoom: '18',
    });
    const r = await this.fetchJson<{
      lat?: string;
      lon?: string;
      display_name?: string;
    }>(`https://nominatim.openstreetmap.org/reverse?${params}`);
    const out = r.display_name
      ? [
          {
            lat: Number(r.lat),
            lng: Number(r.lon),
            display_name: r.display_name,
          },
        ]
      : [];
    this.cache.set(key, out);
    return out[0] ?? null;
  }

  private async fetchJson<T>(url: string): Promise<T> {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': this.env.GEOCODER_USER_AGENT },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as T;
    } catch (e) {
      this.logger.warn(
        `geocoder failed: ${e instanceof Error ? e.message : String(e)}`,
      );
      throw new ServiceUnavailableException({
        code: 'GEOCODER_DOWN',
        message: 'Dịch vụ tìm địa chỉ tạm thời gián đoạn',
      });
    }
  }
}
