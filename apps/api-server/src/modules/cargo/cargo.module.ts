import { Module } from '@nestjs/common';
import {
  CargoAdminController,
  CargoDriverController,
  CargoPublicController,
} from './cargo.controllers';
import { CargoService } from './cargo.service';

@Module({
  controllers: [
    CargoPublicController,
    CargoAdminController,
    CargoDriverController,
  ],
  providers: [CargoService],
  exports: [CargoService],
})
export class CargoModule {}
