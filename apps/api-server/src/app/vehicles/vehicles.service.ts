import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Vehicle } from '@limousine-workspace/shared-types';
import { VehicleEntity } from '../entities/vehicle.entity';
import { vehicleToDomain } from '../mappers/to-domain';

export type UpsertVehicleInput = {
  license_plate: string;
  capacity: number;
  status: Vehicle['status'];
};

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(VehicleEntity)
    private readonly vehicles: Repository<VehicleEntity>,
  ) {}

  async list(): Promise<Vehicle[]> {
    const rows = await this.vehicles.find({
      order: { license_plate: 'ASC' },
    });
    return rows.map(vehicleToDomain);
  }

  async create(body: UpsertVehicleInput): Promise<Vehicle> {
    const e = this.vehicles.create({
      license_plate: body.license_plate.trim(),
      capacity: body.capacity,
      status: body.status,
    });
    const saved = await this.vehicles.save(e);
    return vehicleToDomain(saved);
  }

  async update(
    id: string,
    body: Partial<UpsertVehicleInput>,
  ): Promise<Vehicle> {
    const e = await this.vehicles.findOne({ where: { id } });
    if (!e) throw new NotFoundException('vehicle not found');
    if (body.license_plate !== undefined)
      e.license_plate = body.license_plate.trim();
    if (body.capacity !== undefined) e.capacity = body.capacity;
    if (body.status !== undefined) e.status = body.status;
    const saved = await this.vehicles.save(e);
    return vehicleToDomain(saved);
  }
}
