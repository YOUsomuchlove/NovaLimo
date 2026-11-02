import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { AuthUser } from '../../common/auth/auth-user';
import {
  CurrentUser,
  Driver,
  Public,
  Staff,
} from '../../common/auth/decorators';
import {
  CargoListQuery,
  CargoProofDto,
  CargoQuoteInput,
  CargoService,
  CreateCargoDto,
  SettleCodDto,
  TrackCargoQuery,
  UpdateCargoDto,
} from './cargo.service';

const Id = () => Param('id', ParseUUIDPipe);

@ApiTags('public')
@Public()
@Controller('public/cargo')
export class CargoPublicController {
  constructor(private readonly cargo: CargoService) {}

  @Post('quote') @HttpCode(200) quote(@Body() dto: CargoQuoteInput) {
    return this.cargo.quote(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('orders')
  create(@Body() dto: CreateCargoDto) {
    return this.cargo.create(dto);
  }

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Get('track')
  track(@Query() q: TrackCargoQuery) {
    return this.cargo.track(q.code, q.phone);
  }
}

@ApiTags('admin · cargo')
@Controller('admin')
export class CargoAdminController {
  constructor(private readonly cargo: CargoService) {}

  @Staff('cargo.read') @Get('cargos') list(@Query() q: CargoListQuery) {
    return this.cargo.list(q);
  }
  @Staff('cargo.read') @Get('cargos/:id') get(@Id() id: string) {
    return this.cargo.get(id);
  }
  @Staff('cargo.write') @Post('cargos') create(
    @Body() dto: CreateCargoDto,
    @CurrentUser() u: AuthUser,
  ) {
    return this.cargo.create(dto, u.sub);
  }
  @Staff('cargo.write') @Patch('cargos/:id') update(
    @Id() id: string,
    @Body() dto: UpdateCargoDto,
  ) {
    return this.cargo.update(id, dto);
  }

  @Staff('cod.reconcile') @Get('cod/outstanding') outstanding() {
    return this.cargo.codOutstanding();
  }
  @Staff('cod.reconcile') @Get('cod/settlements') settlements() {
    return this.cargo.listSettlements();
  }
  @Staff('cod.reconcile') @Post('cod/settlements') settle(
    @Body() dto: SettleCodDto,
    @CurrentUser() u: AuthUser,
  ) {
    return this.cargo.settle(dto, u.sub);
  }
}

@ApiTags('driver app')
@Driver()
@Controller('driver/cargos')
export class CargoDriverController {
  constructor(private readonly cargo: CargoService) {}

  @Get() tasks(@CurrentUser() u: AuthUser) {
    return this.cargo.driverTasks(u.sub);
  }
  @Get('scan/:code') scan(
    @CurrentUser() u: AuthUser,
    @Param('code') code: string,
  ) {
    return this.cargo.driverScan(u.sub, code);
  }
  @Post(':id/pickup') @HttpCode(200) pickup(
    @CurrentUser() u: AuthUser,
    @Id() id: string,
    @Body() dto: CargoProofDto,
  ) {
    return this.cargo.driverAction(u.sub, id, 'pickup', dto);
  }
  @Post(':id/deliver') @HttpCode(200) deliver(
    @CurrentUser() u: AuthUser,
    @Id() id: string,
    @Body() dto: CargoProofDto,
  ) {
    return this.cargo.driverAction(u.sub, id, 'deliver', dto);
  }
  @Post(':id/return') @HttpCode(200) ret(
    @CurrentUser() u: AuthUser,
    @Id() id: string,
    @Body() dto: CargoProofDto,
  ) {
    return this.cargo.driverAction(u.sub, id, 'return', dto);
  }
}
