import { Injectable, Logger } from '@nestjs/common';

export type GeocodeHit = {
  lat: number;
  lng: number;
  display_name: string;
};

@Injectable()
export class GeocodeService {
  private readonly logger = new Logger(GeocodeService.name);

  async search(query: string): Promise<GeocodeHit[]> {
    const q = query.trim();
    if (!q) return [];

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=6`;
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'NovaLimoBooking/1.0 (contact@novalimo.local)',
          Accept: 'application/json',
        },
      });
      if (!res.ok) {
        this.logger.warn(`Nominatim HTTP ${res.status}`);
        return [];
      }
      const raw = (await res.json()) as Array<{
        lat: string;
        lon: string;
        display_name: string;
      }>;
      return raw.map((r) => ({
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
        display_name: r.display_name,
      }));
    } catch (e) {
      this.logger.warn(`Geocode failed: ${e}`);
      return [];
    }
  }
}
