import { Module } from '@nestjs/common';
import {
  FleetAdminController,
  NetworkAdminController,
} from './catalog.admin.controller';
import { CatalogPublicController } from './catalog.public.controller';
import { CatalogService } from './catalog.service';
import { PricingService } from './pricing.service';

@Module({
  controllers: [
    FleetAdminController,
    NetworkAdminController,
    CatalogPublicController,
  ],
  providers: [CatalogService, PricingService],
  exports: [CatalogService, PricingService],
})
export class CatalogModule {}
