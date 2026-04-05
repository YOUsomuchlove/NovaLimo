import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CargoEntity } from '../entities/cargo.entity';
import { TripRunEntity } from '../entities/trip-run.entity';
import { cargoToDto } from '../mappers/to-dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class CargosService {
  constructor(
    @InjectRepository(CargoEntity)
    private readonly cargos: Repository<CargoEntity>,
    private readonly events: EventsGateway,
  ) {}

  async myTasks(driverId: string) {
    const rows = await this.cargos
      .createQueryBuilder('c')
      .innerJoin(TripRunEntity, 'tr', 'tr.id = c.trip_run_id')
      .where('tr.driver_id = :did', { did: driverId })
      .orderBy('c.waybill_code', 'ASC')
      .getMany();
    return rows.map(cargoToDto);
  }

  async listAdmin() {
    const rows = await this.cargos.find({
      order: { id: 'DESC' },
      take: 500,
      relations: ['trip_run'],
    });
    return rows.map(cargoToDto);
  }

  async findOne(id: string) {
    const c = await this.cargos.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Cargo not found');
    return cargoToDto(c);
  }

  async updateStatus(id: string, status: CargoEntity['status']) {
    const c = await this.cargos.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Cargo not found');
    c.status = status;
    const saved = await this.cargos.save(c);
    if (saved.trip_run_id) {
      this.events.emitTripRunUpdated({ id: saved.trip_run_id });
    }
    return cargoToDto(saved);
  }

  async create(data: Partial<CargoEntity>) {
    const row = await this.cargos.save(this.cargos.create(data));
    if (row.trip_run_id) {
      this.events.emitTripRunUpdated({ id: row.trip_run_id });
    }
    return cargoToDto(row);
  }
}
