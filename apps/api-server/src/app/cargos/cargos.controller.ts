import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Cargo } from '@limousine-workspace/shared-types';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CargosService, type CreateCargoInput } from './cargos.service';

@Controller('cargos')
export class CargosController {
  constructor(private readonly cargos: CargosService) {}

  @Get()
  list(): Promise<Cargo[]> {
    return this.cargos.list();
  }

  @Post()
  create(@Body() body: CreateCargoInput): Promise<Cargo> {
    return this.cargos.create(body);
  }

  @Patch(':id/driver-status')
  @UseGuards(JwtAuthGuard)
  patchDriverStatus(
    @Req() req: Request & { user?: { sub: string } },
    @Param('id') id: string,
    @Body() body: { status: Cargo['status'] },
  ): Promise<Cargo> {
    const driverId = req.user?.sub;
    if (!driverId) throw new UnauthorizedException();
    return this.cargos.patchStatusByDriver(id, driverId, body.status);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<CreateCargoInput>,
  ): Promise<Cargo> {
    return this.cargos.update(id, body);
  }
}
