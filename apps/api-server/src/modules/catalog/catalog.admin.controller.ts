import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Staff } from '../../common/auth/decorators';
import {
  CreatePriceRuleDto,
  CreateRouteDto,
  CreateStopDto,
  CreateTimeSlotDto,
  CreateVehicleDto,
  CreateVehicleTypeDto,
  RouteScopedQuery,
  UpdatePriceRuleDto,
  UpdateRouteDto,
  UpdateStopDto,
  UpdateTimeSlotDto,
  UpdateVehicleDto,
  UpdateVehicleTypeDto,
  VehicleListQuery,
} from './catalog.dto';
import { CatalogService } from './catalog.service';

const Id = () => Param('id', ParseUUIDPipe);

@ApiTags('admin · fleet')
@Controller('admin')
export class FleetAdminController {
  constructor(private readonly catalog: CatalogService) {}

  @Staff('fleet.read') @Get('vehicle-types') listTypes() {
    return this.catalog.listVehicleTypes();
  }
  @Staff('fleet.write') @Post('vehicle-types') createType(
    @Body() dto: CreateVehicleTypeDto,
  ) {
    return this.catalog.createVehicleType(dto);
  }
  @Staff('fleet.write') @Patch('vehicle-types/:id') updateType(
    @Id() id: string,
    @Body() dto: UpdateVehicleTypeDto,
  ) {
    return this.catalog.updateVehicleType(id, dto);
  }

  @Staff('fleet.read') @Get('vehicles') listVehicles(
    @Query() q: VehicleListQuery,
  ) {
    return this.catalog.listVehicles(q);
  }
  @Staff('fleet.read') @Get('vehicles/:id') getVehicle(@Id() id: string) {
    return this.catalog.getVehicle(id);
  }
  @Staff('fleet.write') @Post('vehicles') createVehicle(
    @Body() dto: CreateVehicleDto,
  ) {
    return this.catalog.createVehicle(dto);
  }
  @Staff('fleet.write') @Patch('vehicles/:id') updateVehicle(
    @Id() id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.catalog.updateVehicle(id, dto);
  }
  @Staff('fleet.write') @Delete('vehicles/:id') @HttpCode(204) archiveVehicle(
    @Id() id: string,
  ) {
    return this.catalog.archiveVehicle(id);
  }
}

@ApiTags('admin · settings (routes, slots, pricing)')
@Controller('admin')
export class NetworkAdminController {
  constructor(private readonly catalog: CatalogService) {}

  @Staff('trip.read') @Get('routes') listRoutes() {
    return this.catalog.listRoutes({ withStops: true, withPrices: true });
  }
  @Staff('trip.read') @Get('routes/:id') getRoute(@Id() id: string) {
    return this.catalog.getRoute(id);
  }
  @Staff('settings.manage') @Post('routes') createRoute(
    @Body() dto: CreateRouteDto,
  ) {
    return this.catalog.createRoute(dto);
  }
  @Staff('settings.manage') @Patch('routes/:id') updateRoute(
    @Id() id: string,
    @Body() dto: UpdateRouteDto,
  ) {
    return this.catalog.updateRoute(id, dto);
  }
  @Staff('settings.manage') @Delete('routes/:id') @HttpCode(204) archiveRoute(
    @Id() id: string,
  ) {
    return this.catalog.archiveRoute(id);
  }

  @Staff('settings.manage') @Post('routes/:id/stops') createStop(
    @Id() id: string,
    @Body() dto: CreateStopDto,
  ) {
    return this.catalog.createStop(id, dto);
  }
  @Staff('settings.manage') @Patch('stops/:id') updateStop(
    @Id() id: string,
    @Body() dto: UpdateStopDto,
  ) {
    return this.catalog.updateStop(id, dto);
  }
  @Staff('settings.manage') @Delete('stops/:id') @HttpCode(204) deleteStop(
    @Id() id: string,
  ) {
    return this.catalog.deleteStop(id);
  }

  @Staff('trip.read') @Get('time-slots') listSlots(
    @Query() q: RouteScopedQuery,
  ) {
    return this.catalog.listTimeSlots(q.route_id);
  }
  @Staff('settings.manage') @Post('time-slots') createSlot(
    @Body() dto: CreateTimeSlotDto,
  ) {
    return this.catalog.createTimeSlot(dto);
  }
  @Staff('settings.manage') @Patch('time-slots/:id') updateSlot(
    @Id() id: string,
    @Body() dto: UpdateTimeSlotDto,
  ) {
    return this.catalog.updateTimeSlot(id, dto);
  }
  @Staff('settings.manage') @Delete('time-slots/:id') @HttpCode(204) deleteSlot(
    @Id() id: string,
  ) {
    return this.catalog.deleteTimeSlot(id);
  }

  @Staff('trip.read') @Get('price-rules') listPrices(
    @Query() q: RouteScopedQuery,
  ) {
    return this.catalog.listPriceRules(q.route_id);
  }
  @Staff('settings.manage') @Post('price-rules') createPrice(
    @Body() dto: CreatePriceRuleDto,
  ) {
    return this.catalog.createPriceRule(dto);
  }
  @Staff('settings.manage') @Patch('price-rules/:id') updatePrice(
    @Id() id: string,
    @Body() dto: UpdatePriceRuleDto,
  ) {
    return this.catalog.updatePriceRule(id, dto);
  }
  @Staff('settings.manage')
  @Delete('price-rules/:id')
  @HttpCode(204)
  deletePrice(@Id() id: string) {
    return this.catalog.deletePriceRule(id);
  }
}
