import {
  BOOKING_TRANSITIONS,
  type BookingDto,
  type BookingSource,
  type BookingStatus,
  type CreateBookingResponse,
  type Paginated,
  type PaymentMethod,
  type SeatHoldDto,
} from '@limousine-workspace/shared-types';
import {
  RealtimeEvents,
  formatDate,
  formatTime,
} from '@limousine-workspace/utils-core';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'node:crypto';
import {
  type EntityManager,
  In,
  IsNull,
  LessThan,
  type Repository,
} from 'typeorm';
import { bookingCode, ticketCode, transferReference } from '../../common/codes';
import { DomainError } from '../../common/http/exception.filter';
import { likeTerm, paginate } from '../../common/http/pagination';
import { assertTransition } from '../../common/state';
import { addMinutes, vnDateString, vnDayRange } from '../../common/time';
import { InjectEnv } from '../../config/config.module';
import type { Env } from '../../config/env';
import {
  BookingEntity,
  BookingSeatEntity,
  CustomerEntity,
  FinanceTransactionEntity,
  PaymentEntity,
  SeatHoldEntity,
  StopEntity,
  SupportTicketEntity,
  TripBatchEntity,
  toPoint,
} from '../../database/entities';
import { PricingService, seatPrice } from '../catalog/pricing.service';
import { NotifyService } from '../notify/notify.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { SettingsService } from '../settings/settings.service';
import { SeatAvailabilityService } from '../trips/seat-availability.service';
import type {
  AdminCreateBookingDto,
  BookingListQuery,
  CreateBookingDto,
  CreateHoldDto,
  PassengerDto,
  PlaceDto,
  UpdateBookingDto,
} from './booking.dto';
import { toBookingDto, toPaymentInstruction } from './booking.mappers';
import {
  type AllocatedSeat,
  allocateSeats,
  assertBookable,
  lockBatch,
} from './seat-allocator';

const ONLINE_METHODS: PaymentMethod[] = ['BANK_TRANSFER'];
const RELATIONS = { trip_batch: { route: true }, seats: true } as const;

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookings: Repository<BookingEntity>,
    @InjectRepository(PaymentEntity)
    private readonly payments: Repository<PaymentEntity>,
    @InjectRepository(SeatHoldEntity)
    private readonly holds: Repository<SeatHoldEntity>,
    private readonly pricing: PricingService,
    private readonly settings: SettingsService,
    private readonly availability: SeatAvailabilityService,
    private readonly notify: NotifyService,
    private readonly realtime: RealtimeGateway,
    @InjectEnv() private readonly env: Env,
  ) {}

  private bank() {
    return {
      bin: this.env.BANK_BIN,
      account_no: this.env.BANK_ACCOUNT_NO,
      account_name: this.env.BANK_ACCOUNT_NAME,
    };
  }

  /* =================== Seat holds =================== */

  async createHold(dto: CreateHoldDto): Promise<SeatHoldDto> {
    const policy = await this.settings.get('booking.policy');
    if (dto.seat_labels.length > policy.max_seats_per_booking) {
      throw new DomainError(
        400,
        'TOO_MANY_SEATS',
        `Tối đa ${policy.max_seats_per_booking} ghế mỗi lần đặt`,
      );
    }
    const token = randomBytes(24).toString('base64url');
    const expires = addMinutes(new Date(), policy.seat_hold_minutes);
    await this.bookings.manager.transaction(async (m) => {
      await lockBatch(m, dto.trip_batch_id);
      const batch = await this.loadBatch(m, dto.trip_batch_id);
      assertBookable(batch);
      if (dto.hold_token)
        await m.delete(SeatHoldEntity, {
          hold_token: dto.hold_token,
          trip_batch_id: batch.id,
        });
      const seats = await allocateSeats(m, batch, dto.seat_labels);
      await m.insert(
        SeatHoldEntity,
        seats.map((s) => ({
          trip_batch_id: batch.id,
          seat_label: s.seat_label,
          seat_unit: s.seat_unit,
          hold_token: token,
          expires_at: expires,
        })),
      );
    });
    void this.availability.broadcast(dto.trip_batch_id);
    return {
      hold_token: token,
      trip_batch_id: dto.trip_batch_id,
      seat_labels: dto.seat_labels,
      expires_at: expires.toISOString(),
    };
  }

  async releaseHold(token: string): Promise<void> {
    const rows = await this.holds.findBy({ hold_token: token });
    if (!rows.length) return;
    await this.holds.delete({ hold_token: token });
    void this.availability.broadcast(rows[0].trip_batch_id);
  }

  /* =================== Create booking =================== */

  /** Public checkout: converts a hold into a booking. Prices come only from the server. */
  async createFromHold(dto: CreateBookingDto): Promise<CreateBookingResponse> {
    if (
      !ONLINE_METHODS.includes(dto.payment_method) &&
      dto.payment_method !== 'CASH'
    ) {
      throw new DomainError(
        400,
        'METHOD_UNAVAILABLE',
        'Phương thức thanh toán này chưa được hỗ trợ',
      );
    }
    const policy = await this.settings.get('booking.policy');
    const booking = await this.bookings.manager.transaction(async (m) => {
      await lockBatch(m, dto.trip_batch_id);
      const batch = await this.loadBatch(m, dto.trip_batch_id);
      assertBookable(batch);
      const holds = await m
        .createQueryBuilder(SeatHoldEntity, 'h')
        .where(
          'h.hold_token = :t AND h.trip_batch_id = :b AND h.expires_at > now()',
          { t: dto.hold_token, b: batch.id },
        )
        .getMany();
      if (!holds.length)
        throw new DomainError(
          410,
          'HOLD_EXPIRED',
          'Thời gian giữ ghế đã hết, vui lòng chọn lại ghế',
        );
      const heldLabels = holds.map((h) => h.seat_label).sort();
      const paxLabels = dto.passengers.map((p) => p.seat_label).sort();
      if (heldLabels.join() !== paxLabels.join()) {
        throw new DomainError(
          400,
          'SEATS_MISMATCH',
          'Thông tin hành khách không khớp với ghế đã giữ',
        );
      }
      const tiers = new Map(
        batch.vehicle_type.seat_layout
          .flat()
          .flatMap((c) => (c ? [[c.label, c.tier] as const] : [])),
      );
      const seats = holds.map((h) => ({
        seat_label: h.seat_label,
        seat_unit: h.seat_unit,
        tier: tiers.get(h.seat_label) ?? 'STANDARD',
      }));
      const isCash = dto.payment_method === 'CASH';
      const b = await this.insertBooking(m, batch, dto, seats, {
        source: 'WEB',
        status: isCash ? 'CONFIRMED' : 'PENDING_PAYMENT',
        payment_due_at: isCash
          ? null
          : addMinutes(new Date(), policy.payment_due_minutes),
      });
      await m.delete(SeatHoldEntity, { hold_token: dto.hold_token });
      return b;
    });
    return this.afterCreate(booking);
  }

  /** Staff (call center / admin): allocates seats directly under the batch lock. */
  async createByStaff(
    dto: AdminCreateBookingDto,
    userId: string,
  ): Promise<CreateBookingResponse> {
    const booking = await this.bookings.manager.transaction(async (m) => {
      await lockBatch(m, dto.trip_batch_id);
      const batch = await this.loadBatch(m, dto.trip_batch_id);
      assertBookable(batch, { staff: true });
      const seats = await allocateSeats(
        m,
        batch,
        dto.passengers.map((p) => p.seat_label),
      );
      return this.insertBooking(m, batch, dto, seats, {
        source: dto.source ?? 'CALL_CENTER',
        status: 'CONFIRMED',
        payment_due_at: null,
        discount_vnd: dto.discount_vnd ?? 0,
        created_by_id: userId,
      });
    });
    return this.afterCreate(booking);
  }

  private async insertBooking(
    m: EntityManager,
    batch: TripBatchEntity,
    dto: Pick<
      CreateBookingDto,
      | 'contact_name'
      | 'contact_phone'
      | 'contact_email'
      | 'pickup'
      | 'dropoff'
      | 'note'
      | 'payment_method'
    > & { passengers: PassengerDto[] },
    seats: AllocatedSeat[],
    opts: {
      source: BookingSource;
      status: BookingStatus;
      payment_due_at: Date | null;
      discount_vnd?: number;
      created_by_id?: string;
    },
  ): Promise<BookingEntity> {
    const fare = await this.pricing.fareFor(
      batch.route_id,
      batch.vehicle_type_id,
      vnDateString(batch.departure_at),
    );
    const pickup = await this.resolvePlace(
      m,
      batch.route_id,
      dto.pickup,
      'PICKUP',
    );
    const dropoff = await this.resolvePlace(
      m,
      batch.route_id,
      dto.dropoff,
      'DROPOFF',
    );
    const pax = new Map(dto.passengers.map((p) => [p.seat_label, p]));
    const seatRows = seats.map((s) => ({
      trip_batch_id: batch.id,
      seat_label: s.seat_label,
      seat_unit: s.seat_unit,
      tier: s.tier,
      price_vnd: seatPrice(fare, s.tier),
      passenger_name: pax.get(s.seat_label)?.name ?? dto.contact_name,
      passenger_phone: pax.get(s.seat_label)?.phone ?? null,
    }));
    const subtotal = seatRows.reduce((sum, s) => sum + s.price_vnd, 0);
    const discount = Math.min(opts.discount_vnd ?? 0, subtotal);

    const customer = await this.upsertCustomer(
      m,
      dto.contact_name,
      dto.contact_phone,
      dto.contact_email,
    );
    let code = bookingCode();
    while (await m.existsBy(BookingEntity, { code })) code = bookingCode();

    const booking = await m.save(
      m.create(BookingEntity, {
        code,
        trip_batch_id: batch.id,
        customer_id: customer.id,
        contact_name: dto.contact_name.trim(),
        contact_phone: dto.contact_phone,
        contact_email: dto.contact_email ?? null,
        pickup_stop_id: pickup.stop_id,
        pickup_address: pickup.address,
        pickup_point: toPoint(pickup.lat, pickup.lng),
        dropoff_stop_id: dropoff.stop_id,
        dropoff_address: dropoff.address,
        dropoff_point: toPoint(dropoff.lat, dropoff.lng),
        note: dto.note ?? null,
        subtotal_vnd: subtotal,
        discount_vnd: discount,
        total_vnd: subtotal - discount,
        payment_method: dto.payment_method,
        payment_status: 'UNPAID',
        status: opts.status,
        source: opts.source,
        payment_due_at: opts.payment_due_at,
        created_by_id: opts.created_by_id ?? null,
        seats: seatRows.map((s) => m.create(BookingSeatEntity, s)),
      }),
    );

    if (dto.payment_method !== 'CASH') {
      await m.insert(PaymentEntity, {
        booking_id: booking.id,
        method: dto.payment_method,
        amount_vnd: booking.total_vnd,
        reference: transferReference(code),
        expires_at: opts.payment_due_at,
      });
      if (dto.payment_method === 'BANK_TRANSFER')
        await m.update(BookingEntity, booking.id, {
          payment_status: 'PENDING',
        });
    }
    return booking;
  }

  private async afterCreate(
    booking: BookingEntity,
  ): Promise<CreateBookingResponse> {
    const full = await this.findOr404(booking.id);
    const dto = toBookingDto(full);
    const payment = await this.payments.findOne({
      where: { booking_id: booking.id },
      order: { created_at: 'DESC' },
    });
    void this.availability.broadcast(full.trip_batch_id);
    this.realtime.toOps(RealtimeEvents.bookingUpdated, dto);
    if (full.status === 'CONFIRMED') void this.sendConfirmation(full);
    return {
      booking: dto,
      payment: payment ? toPaymentInstruction(payment, this.bank()) : null,
    };
  }

  /* =================== Read =================== */

  async findOr404(
    id: string,
    m: EntityManager = this.bookings.manager,
  ): Promise<BookingEntity> {
    const b = await m.findOne(BookingEntity, {
      where: { id },
      relations: RELATIONS,
    });
    if (!b) throw new NotFoundException('Không tìm thấy vé');
    return b;
  }

  /** Public lookup needs code + a phone on the booking (contact or passenger). */
  async lookup(code: string, phone: string) {
    const b = await this.bookings.findOne({
      where: { code: code.toUpperCase() },
      relations: RELATIONS,
    });
    const owns =
      b &&
      (b.contact_phone === phone ||
        b.seats?.some((s) => s.passenger_phone === phone));
    if (!b || !owns)
      throw new NotFoundException(
        'Không tìm thấy vé với mã và số điện thoại này',
      );
    const payment =
      b.payment_status === 'PENDING'
        ? await this.payments.findOne({
            where: { booking_id: b.id, status: 'PENDING' },
          })
        : null;
    return {
      booking: toBookingDto(b),
      payment: payment ? toPaymentInstruction(payment, this.bank()) : null,
    };
  }

  async listByPhone(phone: string): Promise<BookingDto[]> {
    const rows = await this.bookings
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.trip_batch', 'tb')
      .leftJoinAndSelect('tb.route', 'r')
      .leftJoinAndSelect('b.seats', 's')
      .where('b.contact_phone = :phone', { phone })
      .orWhere(
        'b.id IN (SELECT booking_id FROM booking_seats WHERE passenger_phone = :phone)',
        { phone },
      )
      .orderBy('tb.departure_at', 'DESC')
      .take(50)
      .getMany();
    return rows.map(toBookingDto);
  }

  async list(q: BookingListQuery): Promise<Paginated<BookingDto>> {
    const qb = this.bookings
      .createQueryBuilder('b')
      .innerJoinAndSelect('b.trip_batch', 'tb')
      .innerJoinAndSelect('tb.route', 'r')
      .leftJoinAndSelect('b.seats', 's');
    if (q.trip_batch_id)
      qb.andWhere('b.trip_batch_id = :tb', { tb: q.trip_batch_id });
    if (q.trip_run_id)
      qb.andWhere('b.trip_run_id = :tr', { tr: q.trip_run_id });
    if (q.route_id) qb.andWhere('tb.route_id = :route', { route: q.route_id });
    if (q.status) qb.andWhere('b.status = :status', { status: q.status });
    if (q.payment_status)
      qb.andWhere('b.payment_status = :ps', { ps: q.payment_status });
    if (q.source) qb.andWhere('b.source = :src', { src: q.source });
    if (q.unassigned) qb.andWhere('b.trip_run_id IS NULL');
    if (q.from)
      qb.andWhere('tb.departure_at >= :from', {
        from: vnDayRange(q.from.slice(0, 10)).from,
      });
    if (q.to)
      qb.andWhere('tb.departure_at < :to', {
        to: vnDayRange(q.to.slice(0, 10)).to,
      });
    if (q.q) {
      qb.andWhere(
        '(b.code ILIKE :q OR b.contact_name ILIKE :q OR b.contact_phone ILIKE :q OR b.pickup_address ILIKE :q)',
        { q: likeTerm(q.q) },
      );
    }
    return paginate(qb, q, toBookingDto, {
      created_at: 'b.created_at',
      departure_at: 'tb.departure_at',
      total: 'b.total_vnd',
      code: 'b.code',
    });
  }

  async get(
    id: string,
  ): Promise<
    BookingDto & { payments: ReturnType<typeof toPaymentInstruction>[] }
  > {
    const b = await this.findOr404(id);
    const payments = await this.payments.find({
      where: { booking_id: id },
      order: { created_at: 'DESC' },
    });
    return {
      ...toBookingDto(b),
      payments: payments.map((p) => toPaymentInstruction(p, this.bank())),
    };
  }

  /* =================== Update / status =================== */

  async update(id: string, dto: UpdateBookingDto): Promise<BookingDto> {
    const b = await this.findOr404(id);
    if (!['PENDING_PAYMENT', 'CONFIRMED'].includes(b.status)) {
      throw new DomainError(409, 'LOCKED', 'Chỉ sửa được vé chưa đón khách');
    }
    const patch: Partial<BookingEntity> = {
      contact_name: dto.contact_name ?? b.contact_name,
      contact_phone: dto.contact_phone ?? b.contact_phone,
      contact_email: dto.contact_email ?? b.contact_email,
      note: dto.note ?? b.note,
    };
    if (dto.pickup) {
      const p = await this.resolvePlace(
        this.bookings.manager,
        b.trip_batch.route_id,
        dto.pickup,
        'PICKUP',
      );
      Object.assign(patch, {
        pickup_stop_id: p.stop_id,
        pickup_address: p.address,
        pickup_point: toPoint(p.lat, p.lng),
      });
    }
    if (dto.dropoff) {
      const p = await this.resolvePlace(
        this.bookings.manager,
        b.trip_batch.route_id,
        dto.dropoff,
        'DROPOFF',
      );
      Object.assign(patch, {
        dropoff_stop_id: p.stop_id,
        dropoff_address: p.address,
        dropoff_point: toPoint(p.lat, p.lng),
      });
    }
    await this.bookings.update(id, patch);
    return this.emitUpdated(id);
  }

  /** Status change by staff or driver, enforcing the shared transition map. */
  async changeStatus(
    id: string,
    status: BookingStatus,
    reason?: string,
    m: EntityManager = this.bookings.manager,
  ): Promise<BookingDto> {
    const b = await this.findOr404(id, m);
    assertTransition(BOOKING_TRANSITIONS, b.status, status, 'vé');
    if (status === b.status) return toBookingDto(b);
    const now = new Date();
    const patch: Partial<BookingEntity> = { status };
    if (status === 'PICKED_UP') patch.picked_up_at = now;
    if (status === 'DROPPED_OFF') patch.dropped_off_at = now;
    if (status === 'CANCELLED')
      Object.assign(patch, {
        cancelled_at: now,
        cancel_reason: reason ?? null,
        trip_run_id: null,
        pickup_order: null,
        dropoff_order: null,
      });
    await m.update(BookingEntity, id, patch);
    if (status === 'CANCELLED') {
      await m.update(
        BookingSeatEntity,
        { booking_id: id },
        { is_active: false },
      );
      await m.update(
        PaymentEntity,
        { booking_id: id, status: 'PENDING' },
        { status: 'EXPIRED' },
      );
      void this.availability.broadcast(b.trip_batch_id);
    }
    return this.emitUpdated(id, m);
  }

  /** Customer self-service cancel. Paid bookings become a refund request for CS. */
  async cancelByCustomer(
    code: string,
    phone: string,
    reason?: string,
  ): Promise<{
    status: 'CANCELLED' | 'REFUND_REQUESTED';
    booking: BookingDto;
  }> {
    const { booking } = await this.lookup(code, phone);
    if (!['PENDING_PAYMENT', 'CONFIRMED'].includes(booking.status))
      throw new DomainError(409, 'NOT_CANCELLABLE', 'Vé này không thể hủy');
    if (new Date(booking.trip.departure_at) <= new Date())
      throw new DomainError(409, 'DEPARTED', 'Chuyến đã khởi hành');
    if (booking.payment_status === 'PAID') {
      const policy = await this.settings.get('booking.policy');
      const hours =
        (new Date(booking.trip.departure_at).getTime() - Date.now()) /
        3_600_000;
      const pct =
        hours >= policy.free_cancel_hours ? 100 : policy.late_cancel_refund_pct;
      await this.bookings.manager.insert(SupportTicketEntity, {
        code: ticketCode(),
        kind: 'CANCEL_REQUEST',
        name: booking.contact_name,
        phone,
        email: booking.contact_email,
        subject: `Yêu cầu hủy vé ${booking.code}`,
        message: `${reason ?? 'Khách yêu cầu hủy vé.'}\nHoàn tiền dự kiến: ${pct}% (${Math.round((booking.total_vnd * pct) / 100)} ₫).`,
        booking_id: booking.id,
      });
      return { status: 'REFUND_REQUESTED', booking };
    }
    return {
      status: 'CANCELLED',
      booking: await this.changeStatus(
        booking.id,
        'CANCELLED',
        reason ?? 'Khách tự hủy',
      ),
    };
  }

  /* =================== Payments =================== */

  /** Marks a booking paid (webhook or staff). Idempotent per provider transaction id. */
  async confirmPayment(opts: {
    paymentId?: string;
    bookingId?: string;
    method: PaymentMethod;
    providerTxnId?: string | null;
    raw?: Record<string, unknown>;
    userId?: string;
  }): Promise<BookingDto> {
    const result = await this.bookings.manager.transaction(async (m) => {
      if (
        opts.providerTxnId &&
        (await m.existsBy(PaymentEntity, {
          provider_txn_id: opts.providerTxnId,
        }))
      ) {
        const p = await m.findOneByOrFail(PaymentEntity, {
          provider_txn_id: opts.providerTxnId,
        });
        return {
          booking: await this.findOr404(p.booking_id ?? '', m),
          changed: false,
        };
      }
      let payment = opts.paymentId
        ? await m.findOneBy(PaymentEntity, { id: opts.paymentId })
        : null;
      const bookingId = payment?.booking_id ?? opts.bookingId;
      if (!bookingId) throw new NotFoundException('Không tìm thấy thanh toán');
      const b = await this.findOr404(bookingId, m);
      if (b.payment_status === 'PAID') return { booking: b, changed: false };

      if (!payment || payment.status !== 'PENDING') {
        payment = m.create(PaymentEntity, {
          booking_id: b.id,
          method: opts.method,
          amount_vnd: b.total_vnd,
          reference: `${transferReference(b.code)}-${Date.now().toString(36).toUpperCase()}`,
        });
      }
      Object.assign(payment, {
        status: 'SUCCEEDED',
        paid_at: new Date(),
        provider_txn_id: opts.providerTxnId ?? null,
        raw: opts.raw ?? null,
        recorded_by_id: opts.userId ?? null,
        method: opts.method,
      });
      await m.save(payment);
      await m.insert(FinanceTransactionEntity, {
        kind: 'INCOME',
        category: 'TICKET',
        amount_vnd: payment.amount_vnd,
        occurred_at: new Date(),
        reference_type: 'booking',
        reference_id: b.id,
        memo: `Vé ${b.code}`,
        created_by_id: opts.userId ?? null,
      });

      if (b.status === 'CANCELLED') {
        // Paid after expiry: money received but seats were released → refund ticket for CS.
        await m.update(BookingEntity, b.id, { payment_status: 'PAID' });
        await m.insert(SupportTicketEntity, {
          code: ticketCode(),
          kind: 'CANCEL_REQUEST',
          name: b.contact_name,
          phone: b.contact_phone,
          subject: `Thanh toán sau khi vé ${b.code} đã hết hạn`,
          message: `Đã nhận ${payment.amount_vnd} ₫ nhưng vé đã hủy do quá hạn. Cần liên hệ khách để xếp chuyến khác hoặc hoàn tiền.`,
          booking_id: b.id,
        });
      } else {
        await m.update(BookingEntity, b.id, {
          payment_status: 'PAID',
          status: b.status === 'PENDING_PAYMENT' ? 'CONFIRMED' : b.status,
          payment_due_at: null,
        });
      }
      return { booking: await this.findOr404(b.id, m), changed: true };
    });
    const dto = toBookingDto(result.booking);
    if (result.changed) {
      this.realtime.paymentConfirmed(dto.code, dto.payment_status);
      this.realtime.toOps(RealtimeEvents.bookingUpdated, dto);
      if (dto.status === 'CONFIRMED')
        void this.sendConfirmation(result.booking);
    }
    return dto;
  }

  /** Bank webhook: find the pending payment whose reference appears in the transfer content. */
  async handleBankTransfer(
    content: string,
    amount: number,
    providerTxnId: string,
    raw: Record<string, unknown>,
  ): Promise<{ matched: boolean }> {
    const refs: string[] =
      content.toUpperCase().match(/(NL|CG)[0-9A-Z]{6}/g) ?? [];
    if (!refs.length) return { matched: false };
    const payment = await this.payments.findOne({
      where: { reference: In(refs), status: In(['PENDING', 'EXPIRED']) },
    });
    if (!payment?.booking_id) return { matched: false };
    if (amount < payment.amount_vnd) {
      this.logger.warn(
        `Underpaid transfer ${providerTxnId}: ${amount} < ${payment.amount_vnd} for ${payment.reference}`,
      );
      return { matched: false };
    }
    await this.confirmPayment({
      paymentId: payment.id,
      method: 'BANK_TRANSFER',
      providerTxnId,
      raw,
    });
    return { matched: true };
  }

  /* =================== Jobs =================== */

  /** Every minute: cancel unpaid online bookings past their deadline, drop expired holds. */
  @Cron(CronExpression.EVERY_MINUTE, { name: 'expire-unpaid-bookings' })
  async expireUnpaid(): Promise<number> {
    const due = await this.bookings.find({
      where: {
        status: 'PENDING_PAYMENT',
        payment_due_at: LessThan(new Date()),
        cancelled_at: IsNull(),
      },
      select: { id: true, trip_batch_id: true },
      take: 200,
    });
    for (const b of due) {
      try {
        await this.changeStatus(b.id, 'CANCELLED', 'Quá hạn thanh toán');
      } catch (e) {
        this.logger.warn(
          `expire ${b.id}: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }
    await this.holds
      .createQueryBuilder()
      .delete()
      .where('expires_at <= now()')
      .execute();
    return due.length;
  }

  /* =================== helpers =================== */

  private async loadBatch(
    m: EntityManager,
    id: string,
  ): Promise<TripBatchEntity> {
    const batch = await m.findOne(TripBatchEntity, {
      where: { id },
      relations: { vehicle_type: true, route: true },
    });
    if (!batch) throw new NotFoundException('Không tìm thấy chuyến');
    return batch;
  }

  /** A stop on the route overrides free-text coordinates; otherwise the geocoded point is used. */
  private async resolvePlace(
    m: EntityManager,
    routeId: string,
    place: PlaceDto,
    kind: 'PICKUP' | 'DROPOFF',
  ) {
    if (!place.stop_id)
      return {
        stop_id: null,
        address: place.address.trim(),
        lat: place.lat,
        lng: place.lng,
      };
    const stop = await m.findOneBy(StopEntity, {
      id: place.stop_id,
      route_id: routeId,
      is_active: true,
    });
    if (!stop || (stop.kind !== 'BOTH' && stop.kind !== kind)) {
      throw new DomainError(
        400,
        'BAD_STOP',
        kind === 'PICKUP'
          ? 'Điểm đón không thuộc tuyến này'
          : 'Điểm trả không thuộc tuyến này',
      );
    }
    return {
      stop_id: stop.id,
      address: `${stop.name} — ${stop.address}`,
      lat: stop.location.coordinates[1],
      lng: stop.location.coordinates[0],
    };
  }

  private async upsertCustomer(
    m: EntityManager,
    name: string,
    phone: string,
    email?: string,
  ): Promise<CustomerEntity> {
    const existing = await m.findOneBy(CustomerEntity, { phone });
    if (existing) {
      if (email && !existing.email)
        await m.update(CustomerEntity, existing.id, { email });
      return existing;
    }
    return m.save(
      m.create(CustomerEntity, {
        full_name: name.trim(),
        phone,
        email: email ?? null,
      }),
    );
  }

  private async emitUpdated(
    id: string,
    m: EntityManager = this.bookings.manager,
  ): Promise<BookingDto> {
    const dto = toBookingDto(await this.findOr404(id, m));
    this.realtime.toOps(RealtimeEvents.bookingUpdated, dto);
    return dto;
  }

  private async sendConfirmation(b: BookingEntity): Promise<void> {
    try {
      const d = b.trip_batch.departure_at;
      await this.notify.sms(b.contact_phone, 'booking_confirmed', {
        code: b.code,
        route: b.trip_batch.route.name,
        time: formatTime(d),
        date: formatDate(d),
        seats: (b.seats ?? []).map((s) => s.seat_label).join(','),
        link: `novalimo.vn/ve/${b.code}`,
      });
    } catch (e) {
      this.logger.warn(
        `confirmation sms failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }
}
