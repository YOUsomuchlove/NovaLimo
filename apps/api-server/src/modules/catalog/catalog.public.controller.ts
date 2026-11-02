import type { RouteDto } from '@limousine-workspace/shared-types';
import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/auth/decorators';
import { CatalogService } from './catalog.service';

@ApiTags('public')
@Public()
@Controller('public/routes')
export class CatalogPublicController {
  constructor(private readonly catalog: CatalogService) {}

  /** Active routes with pickup/drop-off stops and "from" price — home page, search, pricing page. */
  @Get()
  list(): Promise<RouteDto[]> {
    return this.catalog.listRoutes({
      activeOnly: true,
      withStops: true,
      withPrices: true,
    });
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<RouteDto> {
    return this.catalog.getRoute(id, true);
  }
}
