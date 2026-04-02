import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import type { Vehicle } from '@limousine-workspace/shared-types';
import { VehiclesService, type UpsertVehicleInput } from './vehicles.service';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehicles: VehiclesService) {}

  @Get()
  list(): Promise<Vehicle[]> {
    return this.vehicles.list();
  }

  @Post()
  create(@Body() body: UpsertVehicleInput): Promise<Vehicle> {
    return this.vehicles.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<UpsertVehicleInput>,
  ): Promise<Vehicle> {
    return this.vehicles.update(id, body);
  }
}
