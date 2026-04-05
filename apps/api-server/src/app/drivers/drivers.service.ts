import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, IsNull, Not, Repository } from 'typeorm';
import { DriverLocationEntity } from '../entities/driver-location.entity';
import { DriverShiftEntity } from '../entities/driver-shift.entity';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(DriverShiftEntity)
    private readonly shifts: Repository<DriverShiftEntity>,
    @InjectRepository(DriverLocationEntity)
    private readonly locations: Repository<DriverLocationEntity>,
    private readonly events: EventsGateway,
  ) {}

  async startShift(driverId: string): Promise<DriverShiftEntity> {
    const open = await this.shifts.findOne({
      where: { driver_id: driverId, ended_at: IsNull() },
    });
    if (open) {
      open.ended_at = new Date();
      await this.shifts.save(open);
    }
    const row = this.shifts.create({
      driver_id: driverId,
      started_at: new Date(),
      ended_at: null,
    });
    const saved = await this.shifts.save(row);
    this.events.emitShiftStarted({
      driver_id: driverId,
      shift_id: saved.id,
      at: saved.started_at.toISOString(),
    });
    return saved;
  }

  async endShift(driverId: string): Promise<{
    shift: DriverShiftEntity;
    location_pings: number;
  }> {
    const open = await this.shifts.findOne({
      where: { driver_id: driverId, ended_at: IsNull() },
    });
    if (!open) throw new BadRequestException('no active shift');
    const end = new Date();
    open.ended_at = end;
    await this.shifts.save(open);
    const location_pings = await this.locations.count({
      where: {
        driver_id: driverId,
        recorded_at: Between(open.started_at, end),
      },
    });
    this.events.emitShiftEnded({
      driver_id: driverId,
      shift_id: open.id,
      at: end.toISOString(),
      location_pings,
    });
    return { shift: open, location_pings };
  }

  async getCurrentShift(driverId: string): Promise<DriverShiftEntity | null> {
    return this.shifts.findOne({
      where: { driver_id: driverId, ended_at: IsNull() },
    });
  }

  async postLocation(
    driverId: string,
    lat: number,
    lng: number,
  ): Promise<{ ok: true }> {
    const recorded_at = new Date();
    await this.locations.save(
      this.locations.create({
        driver_id: driverId,
        lat,
        lng,
        recorded_at,
      }),
    );
    this.events.emitDriverLocation({
      driver_id: driverId,
      lat,
      lng,
      recorded_at: recorded_at.toISOString(),
    });
    return { ok: true };
  }

  async postChatMessage(driverId: string, message: string): Promise<void> {
    const at = new Date().toISOString();
    this.events.emitDriverChat({
      from: 'driver',
      driver_id: driverId,
      message,
      at,
    });
  }

  async listRecentLocations(limit: number): Promise<
    Array<{
      driver_id: string;
      lat: number;
      lng: number;
      recorded_at: Date;
    }>
  > {
    const rows = await this.locations.find({
      order: { recorded_at: 'DESC' },
      take: limit,
    });
    return rows.map((r) => ({
      driver_id: r.driver_id,
      lat: r.lat,
      lng: r.lng,
      recorded_at: r.recorded_at,
    }));
  }

  async getShiftSummary(driverId: string): Promise<{
    active: boolean;
    shift: DriverShiftEntity | null;
    location_pings: number;
  }> {
    const activeShift = await this.getCurrentShift(driverId);
    if (activeShift) {
      const location_pings = await this.locations.count({
        where: {
          driver_id: driverId,
          recorded_at: Between(activeShift.started_at, new Date()),
        },
      });
      return { active: true, shift: activeShift, location_pings };
    }
    const lastEnded = await this.shifts.findOne({
      where: { driver_id: driverId, ended_at: Not(IsNull()) },
      order: { ended_at: 'DESC' },
    });
    if (!lastEnded?.ended_at)
      return { active: false, shift: null, location_pings: 0 };
    const location_pings = await this.locations.count({
      where: {
        driver_id: driverId,
        recorded_at: Between(lastEnded.started_at, lastEnded.ended_at),
      },
    });
    return { active: false, shift: lastEnded, location_pings };
  }
}
