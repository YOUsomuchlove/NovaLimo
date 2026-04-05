import { Controller, Get, Query } from '@nestjs/common';
import { GeocodeService } from './geocode.service';

@Controller('geocode')
export class GeocodeController {
  constructor(private readonly geocode: GeocodeService) {}

  @Get()
  search(@Query('q') q: string) {
    if (!q?.trim()) return [];
    return this.geocode.search(q);
  }
}
