import { Injectable, ServiceUnavailableException } from '@nestjs/common';

type NominatimItem = {
  lat: string;
  lon: string;
  display_name: string;
};

@Injectable()
export class GeocodeService {
  private readonly cache = new Map<
    string,
    { at: number; hits: Array<{ lat: number; lng: number; display_name: string }> }
  >();
  private readonly ttlMs = 60_000;

  async search(q: string): Promise<Array<{ lat: number; lng: number; display_name: string }>> {
    const key = q.trim().toLowerCase();
    if (key.length < 3) return [];
    const now = Date.now();
    const hit = this.cache.get(key);
    if (hit && now - hit.at < this.ttlMs) return hit.hits;

    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'json');
    url.searchParams.set('q', q.trim());
    url.searchParams.set('limit', '8');

    let res: Response;
    try {
      res = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'NovaLimo/1.0 (contact: dev@local)',
          Accept: 'application/json',
        },
      });
    } catch {
      throw new ServiceUnavailableException('Geocode upstream unavailable');
    }
    if (!res.ok) {
      throw new ServiceUnavailableException('Geocode upstream error');
    }
    const data = (await res.json()) as NominatimItem[];
    const hits = Array.isArray(data)
      ? data.map((row) => ({
          lat: Number(row.lat),
          lng: Number(row.lon),
          display_name: row.display_name,
        }))
      : [];
    this.cache.set(key, { at: now, hits });
    return hits;
  }
}
