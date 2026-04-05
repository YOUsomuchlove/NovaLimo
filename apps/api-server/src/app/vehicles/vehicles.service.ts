import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleEntity } from '../entities/vehicle.entity';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(VehicleEntity)
    private readonly vehicles: Repository<VehicleEntity>,
  ) {}

  list() {
    return this.vehicles.find({ order: { license_plate: 'ASC' }, take: 500 });
  }

  async findOne(id: string) {
    const v = await this.vehicles.findOne({ where: { id } });
    if (!v) throw new NotFoundException('Vehicle not found');
    return v;
  }

  async create(data: Partial<VehicleEntity>) {
    return this.vehicles.save(this.vehicles.create(data));
  }

  async update(id: string, patch: Partial<VehicleEntity>) {
    const v = await this.vehicles.findOne({ where: { id } });
    if (!v) throw new NotFoundException('Vehicle not found');
    Object.assign(v, patch);
    return this.vehicles.save(v);
  }

  async remove(id: string): Promise<void> {
    const r = await this.vehicles.delete(id);
    if (!r.affected) throw new NotFoundException('Vehicle not found');
  }
}
