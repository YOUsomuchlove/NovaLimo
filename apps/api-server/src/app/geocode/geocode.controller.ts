import { Controller, Get, Query } from '@nestjs/common';
import { GeocodeService, type GeocodeHit } from './geocode.service';

@Controller('geocode')
export class GeocodeController {
  constructor(private readonly geocode: GeocodeService) {}

  @Get()
  search(@Query('q') q: string): Promise<GeocodeHit[]> {
    return this.geocode.search(q ?? '');
  }
}
