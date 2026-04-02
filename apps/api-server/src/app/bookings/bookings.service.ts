import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import type { Booking } from '@limousine-workspace/shared-types';
import { BookingEntity } from '../entities/booking.entity';
import { TripBatchEntity } from '../entities/trip-batch.entity';
import { TripRunEntity } from '../entities/trip-run.entity';
import { EventsGateway } from '../events/events.gateway';
import { bookingToDomain } from '../mappers/to-domain';
import { syncBookingGeoms } from '../utils/sync-booking-geom';

export type CreateBookingInput = {
  trip_batch_id: string;
  passenger_name: string;
  passenger_phone: string;
  booker_name?: string | null;
  booker_phone?: string | null;
  pickup_address: string;
  pickup_location: { lat: number; lng: number };
  dropoff_address: string;
  dropoff_location: { lat: number; lng: number };
  note?: string | null;
  seat_label?: string | null;
  unit_price?: number;
  total_amount?: number;
  payment_method?: 'COD' | 'MOMO' | 'ZALOPAY' | 'VNPAY' | null;
};

@Injectable()
export class BookingsService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(BookingEntity)
    private readonly bookings: Repository<BookingEntity>,
    @InjectRepository(TripBatchEntity)
    private readonly tripBatches: Repository<TripBatchEntity>,
    @InjectRepository(TripRunEntity)
    private readonly tripRuns: Repository<TripRunEntity>,
    private readonly events: EventsGateway,
  ) {}

  async listAdmin(filters: {
    trip_batch_id?: string;
    status?: Booking['status'];
  }): Promise<Booking[]> {
    const qb = this.bookings.createQueryBuilder('b').orderBy('b.id', 'DESC');
    if (filters.trip_batch_id?.trim()) {
      qb.andWhere('b.trip_batch_id = :tb', {
        tb: filters.trip_batch_id.trim(),
      });
    }
    if (filters.status?.trim()) {
      qb.andWhere('b.status = :st', { st: filters.status.trim() });
    }
    const rows = await qb.getMany();
    return rows.map(bookingToDomain);
  }

  async findByPassengerPhone(phone: string): Promise<Booking[]> {
    const normalized = phone.trim();
    if (!normalized) return [];
    const rows = await this.bookings.find({
      where: { passenger_phone: normalized },
      order: { id: 'DESC' },
    });
    return rows.map(bookingToDomain);
  }

  async findOccupiedSeatLabels(tripBatchId: string): Promise<string[]> {
    if (!tripBatchId?.trim()) return [];
    const rows = await this.bookings.find({
      where: {
        trip_batch_id: tripBatchId,
        status: In(['WAITING', 'PICKED_UP', 'DROPPED_OFF']),
      },
      select: ['seat_label'],
    });
    return rows
      .map((r) => r.seat_label)
      .filter((s): s is string => !!s?.trim());
  }

  async create(body: CreateBookingInput): Promise<Booking> {
    if (!body?.trip_batch_id)
      throw new BadRequestException('trip_batch_id is required');

    const batch = await this.tripBatches.findOne({
      where: { id: body.trip_batch_id },
    });
    if (!batch) throw new BadRequestException('trip_batch_id not found');
    if (batch.status !== 'OPEN')
      throw new BadRequestException('trip batch is not OPEN');

    const seat = body.seat_label?.trim() || null;
    if (seat) {
      const taken = await this.bookings.findOne({
        where: {
          trip_batch_id: body.trip_batch_id,
          seat_label: seat,
          status: In(['WAITING', 'PICKED_UP', 'DROPPED_OFF']),
        },
      });
      if (taken)
        throw new ConflictException('seat already taken for this trip batch');
    }

    const method = body.payment_method ?? 'COD';
    const payment_status =
      method === 'COD' ? ('PENDING' as const) : ('PAID' as const);

    const unit = body.unit_price ?? 0;
    const total = body.total_amount ?? unit;

    const entity = this.bookings.create({
      trip_batch_id: body.trip_batch_id,
      trip_run_id: null,
      passenger_name: body.passenger_name ?? '',
      passenger_phone: body.passenger_phone ?? '',
      booker_name: body.booker_name ?? null,
      booker_phone: body.booker_phone ?? null,
      pickup_address: body.pickup_address ?? '',
      pickup_lat: body.pickup_location?.lat ?? 0,
      pickup_lng: body.pickup_location?.lng ?? 0,
      dropoff_address: body.dropoff_address ?? '',
      dropoff_lat: body.dropoff_location?.lat ?? 0,
      dropoff_lng: body.dropoff_location?.lng ?? 0,
      pickup_order: null,
      dropoff_order: null,
      status: 'WAITING',
      note: body.note ?? null,
      seat_label: seat,
      unit_price: unit,
      total_amount: total,
      payment_method: method,
      payment_status,
    });
    const saved = await this.bookings.save(entity);
    await syncBookingGeoms(this.dataSource, saved.id);
    return bookingToDomain(saved);
  }

  async patchStatusByDriver(
    bookingId: string,
    driverId: string,
    status: Booking['status'],
  ): Promise<Booking> {
    const booking = await this.bookings.findOne({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('booking not found');
    if (!booking.trip_run_id)
      throw new BadRequestException('booking not assigned to a trip run');

    const run = await this.tripRuns.findOne({
      where: { id: booking.trip_run_id },
    });
    if (!run || run.driver_id !== driverId) throw new ForbiddenException();

    const cur = booking.status;
    if (status === 'PICKED_UP') {
      if (cur !== 'WAITING')
        throw new BadRequestException('invalid transition to PICKED_UP');
    } else if (status === 'DROPPED_OFF') {
      if (cur !== 'PICKED_UP')
        throw new BadRequestException('invalid transition to DROPPED_OFF');
    } else {
      throw new BadRequestException('drivers can only set PICKED_UP or DROPPED_OFF');
    }

    booking.status = status;
    const saved = await this.bookings.save(booking);
    const domain = bookingToDomain(saved);
    this.events.emitBookingStatusChanged(domain);
    return domain;
  }
}
