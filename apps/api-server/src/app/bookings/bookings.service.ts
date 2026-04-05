import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { BookingEntity } from '../entities/booking.entity';
import { TripBatchEntity } from '../entities/trip-batch.entity';
import { bookingToDto } from '../mappers/to-dto';
import { EventsGateway } from '../events/events.gateway';
import type { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookings: Repository<BookingEntity>,
    @InjectRepository(TripBatchEntity)
    private readonly batches: Repository<TripBatchEntity>,
    private readonly events: EventsGateway,
  ) {}

  async takenSeats(trip_batch_id: string): Promise<string[]> {
    const rows = await this.bookings.find({
      where: {
        trip_batch_id,
        status: Not('CANCELLED' as never),
      },
      select: ['seat_label'],
    });
    return rows
      .map((r) => r.seat_label)
      .filter((s): s is string => Boolean(s));
  }

  async listByPhone(passenger_phone: string) {
    const rows = await this.bookings.find({
      where: { passenger_phone },
      order: { id: 'DESC' },
    });
    return rows.map(bookingToDto);
  }

  async create(dto: CreateBookingDto) {
    const batch = await this.batches.findOne({
      where: { id: dto.trip_batch_id },
    });
    if (!batch) throw new NotFoundException('Trip batch not found');

    if (dto.seat_label) {
      const taken = await this.bookings.findOne({
        where: {
          trip_batch_id: dto.trip_batch_id,
          seat_label: dto.seat_label,
          status: Not('CANCELLED' as never),
        },
      });
      if (taken) throw new ConflictException('Seat already taken');
    }

    const unit = dto.unit_price ?? null;
    const total = dto.total_amount ?? unit;
    const row = await this.bookings.save(
      this.bookings.create({
        trip_batch_id: dto.trip_batch_id,
        trip_run_id: null,
        passenger_name: dto.passenger_name,
        passenger_phone: dto.passenger_phone,
        booker_name: dto.booker_name ?? null,
        booker_phone: dto.booker_phone ?? null,
        pickup_address: dto.pickup_address,
        pickup_lat: dto.pickup_location.lat,
        pickup_lng: dto.pickup_location.lng,
        dropoff_address: dto.dropoff_address,
        dropoff_lat: dto.dropoff_location.lat,
        dropoff_lng: dto.dropoff_location.lng,
        pickup_order: null,
        dropoff_order: null,
        status: 'WAITING',
        note: dto.note ?? null,
        seat_label: dto.seat_label ?? null,
        unit_price: unit,
        total_amount: total,
        payment_method: dto.payment_method ?? 'COD',
        payment_status: 'PENDING',
      }),
    );
    const out = bookingToDto(row);
    this.events.emitBookingStatusChanged(out);
    this.events.emitTripBatchUpdated(batch.id, {
      id: batch.id,
      route_name: batch.route_name,
      departure_time: batch.departure_time.toISOString(),
      status: batch.status,
    });
    return out;
  }

  async listAdmin() {
    const rows = await this.bookings.find({ order: { id: 'DESC' }, take: 500 });
    return rows.map(bookingToDto);
  }

  async findOne(id: string) {
    const b = await this.bookings.findOne({ where: { id } });
    if (!b) throw new NotFoundException('Booking not found');
    return bookingToDto(b);
  }

  async updateAdmin(
    id: string,
    patch: Partial<{
      trip_run_id: string | null;
      status: BookingEntity['status'];
      payment_method: BookingEntity['payment_method'];
      payment_status: BookingEntity['payment_status'];
      pickup_order: number | null;
      dropoff_order: number | null;
    }>,
  ) {
    const b = await this.bookings.findOne({ where: { id } });
    if (!b) throw new NotFoundException('Booking not found');
    if (patch.trip_run_id !== undefined) b.trip_run_id = patch.trip_run_id;
    if (patch.status !== undefined) b.status = patch.status;
    if (patch.payment_method !== undefined)
      b.payment_method = patch.payment_method;
    if (patch.payment_status !== undefined)
      b.payment_status = patch.payment_status;
    if (patch.pickup_order !== undefined) b.pickup_order = patch.pickup_order;
    if (patch.dropoff_order !== undefined)
      b.dropoff_order = patch.dropoff_order;
    const saved = await this.bookings.save(b);
    const out = bookingToDto(saved);
    this.events.emitBookingStatusChanged(out);
    if (saved.trip_run_id) {
      this.events.emitTripRunUpdated({ id: saved.trip_run_id });
    }
    const batch = await this.batches.findOne({
      where: { id: saved.trip_batch_id },
    });
    if (batch) {
      this.events.emitTripBatchUpdated(batch.id, {
        id: batch.id,
        route_name: batch.route_name,
        departure_time: batch.departure_time.toISOString(),
        status: batch.status,
      });
    }
    return out;
  }

  async remove(id: string): Promise<void> {
    const r = await this.bookings.delete(id);
    if (!r.affected) throw new NotFoundException('Booking not found');
  }

  async assertSeatAvailable(
    trip_batch_id: string,
    seat_label: string,
    excludeBookingId?: string,
  ): Promise<void> {
    const q = this.bookings
      .createQueryBuilder('b')
      .where('b.trip_batch_id = :tid', { tid: trip_batch_id })
      .andWhere('b.seat_label = :seat', { seat: seat_label })
      .andWhere('b.status != :cancel', { cancel: 'CANCELLED' });
    if (excludeBookingId) {
      q.andWhere('b.id != :bid', { bid: excludeBookingId });
    }
    const exists = await q.getOne();
    if (exists) throw new BadRequestException('Seat already taken');
  }
}
