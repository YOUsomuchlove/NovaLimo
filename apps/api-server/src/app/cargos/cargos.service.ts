import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Cargo } from '@limousine-workspace/shared-types';
import { CargoEntity } from '../entities/cargo.entity';
import { TripRunEntity } from '../entities/trip-run.entity';
import { cargoToDomain } from '../mappers/to-domain';

export type CreateCargoInput = {
  waybill_code: string;
  trip_run_id?: string | null;
  sender_name: string;
  sender_phone: string;
  receiver_name: string;
  receiver_phone: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  status: Cargo['status'];
};

@Injectable()
export class CargosService {
  constructor(
    @InjectRepository(CargoEntity)
    private readonly cargos: Repository<CargoEntity>,
    @InjectRepository(TripRunEntity)
    private readonly tripRuns: Repository<TripRunEntity>,
  ) {}

  async list(): Promise<Cargo[]> {
    const rows = await this.cargos.find({ order: { waybill_code: 'ASC' } });
    return rows.map(cargoToDomain);
  }

  async create(body: CreateCargoInput): Promise<Cargo> {
    const e = this.cargos.create({
      waybill_code: body.waybill_code.trim(),
      trip_run_id: body.trip_run_id ?? null,
      sender_name: body.sender_name,
      sender_phone: body.sender_phone,
      receiver_name: body.receiver_name,
      receiver_phone: body.receiver_phone,
      pickup_lat: body.pickup_lat,
      pickup_lng: body.pickup_lng,
      dropoff_lat: body.dropoff_lat,
      dropoff_lng: body.dropoff_lng,
      status: body.status,
    });
    const saved = await this.cargos.save(e);
    return cargoToDomain(saved);
  }

  async update(id: string, body: Partial<CreateCargoInput>): Promise<Cargo> {
    const e = await this.cargos.findOne({ where: { id } });
    if (!e) throw new NotFoundException('cargo not found');
    if (body.waybill_code !== undefined)
      e.waybill_code = body.waybill_code.trim();
    if (body.trip_run_id !== undefined) e.trip_run_id = body.trip_run_id;
    if (body.sender_name !== undefined) e.sender_name = body.sender_name;
    if (body.sender_phone !== undefined) e.sender_phone = body.sender_phone;
    if (body.receiver_name !== undefined) e.receiver_name = body.receiver_name;
    if (body.receiver_phone !== undefined)
      e.receiver_phone = body.receiver_phone;
    if (body.pickup_lat !== undefined) e.pickup_lat = body.pickup_lat;
    if (body.pickup_lng !== undefined) e.pickup_lng = body.pickup_lng;
    if (body.dropoff_lat !== undefined) e.dropoff_lat = body.dropoff_lat;
    if (body.dropoff_lng !== undefined) e.dropoff_lng = body.dropoff_lng;
    if (body.status !== undefined) e.status = body.status;
    const saved = await this.cargos.save(e);
    return cargoToDomain(saved);
  }

  async patchStatusByDriver(
    cargoId: string,
    driverId: string,
    status: Cargo['status'],
  ): Promise<Cargo> {
    const e = await this.cargos.findOne({ where: { id: cargoId } });
    if (!e) throw new NotFoundException('cargo not found');
    if (!e.trip_run_id)
      throw new BadRequestException('cargo not assigned to a trip run');
    const run = await this.tripRuns.findOne({ where: { id: e.trip_run_id } });
    if (!run || run.driver_id !== driverId) throw new ForbiddenException();

    const cur = e.status;
    if (status === 'PICKED_UP') {
      if (cur !== 'PENDING')
        throw new BadRequestException('invalid cargo transition');
    } else if (status === 'DELIVERED') {
      if (cur !== 'PICKED_UP')
        throw new BadRequestException('invalid cargo transition');
    } else {
      throw new BadRequestException('invalid status for driver');
    }

    e.status = status;
    const saved = await this.cargos.save(e);
    return cargoToDomain(saved);
  }
}
