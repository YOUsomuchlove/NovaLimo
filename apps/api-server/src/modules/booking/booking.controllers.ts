import type {
  BookingDto,
  CreateBookingResponse,
  Paginated,
  SeatHoldDto,
} from '@limousine-workspace/shared-types';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { timingSafeEqual } from 'node:crypto';
import type { AuthUser } from '../../common/auth/auth-user';
import { CurrentUser, Public, Staff } from '../../common/auth/decorators';
import { InjectEnv } from '../../config/config.module';
import type { Env } from '../../config/env';
import {
  AdminCreateBookingDto,
  BookingListQuery,
  CancelBookingDto,
  ChangeBookingStatusDto,
  CreateBookingDto,
  CreateHoldDto,
  LookupBookingQuery,
  RecordPaymentDto,
  RequestOtpDto,
  UpdateBookingDto,
  VerifyOtpDto,
} from './booking.dto';
import { BookingService } from './booking.service';
import { OtpService } from './otp.service';

@ApiTags('public')
@Public()
@Controller('public')
export class BookingPublicController {
  constructor(
    private readonly bookings: BookingService,
    private readonly otp: OtpService,
  ) {}

  /** Reserve seats for a few minutes while the customer fills in details. */
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('seat-holds')
  hold(@Body() dto: CreateHoldDto): Promise<SeatHoldDto> {
    return this.bookings.createHold(dto);
  }

  @Delete('seat-holds/:token')
  @HttpCode(204)
  release(@Param('token') token: string): Promise<void> {
    return this.bookings.releaseHold(token);
  }

  /** Checkout. Prices are computed server side from the price rules. */
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('bookings')
  create(@Body() dto: CreateBookingDto): Promise<CreateBookingResponse> {
    return this.bookings.createFromHold(dto);
  }

  /** Booking by code — phone must match the contact or a passenger. */
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Get('bookings/lookup')
  lookup(@Query() q: LookupBookingQuery) {
    return this.bookings.lookup(q.code, q.phone);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('bookings/:code/cancel')
  @HttpCode(200)
  cancel(@Param('code') code: string, @Body() dto: CancelBookingDto) {
    return this.bookings.cancelByCustomer(code, dto.phone, dto.reason);
  }

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('otp/request')
  @HttpCode(200)
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.otp.request(dto.phone, 'BOOKING_LOOKUP');
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('otp/verify')
  @HttpCode(200)
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.otp.verify(dto.phone, dto.code, 'BOOKING_LOOKUP');
  }

  /** All bookings of the verified phone (token from `otp/verify`). */
  @ApiHeader({ name: 'x-lookup-token', required: true })
  @Get('my-bookings')
  async mine(@Headers('x-lookup-token') token?: string): Promise<BookingDto[]> {
    return this.bookings.listByPhone(await this.otp.phoneFromToken(token));
  }
}

@ApiTags('admin · bookings')
@Controller('admin/bookings')
export class BookingAdminController {
  constructor(private readonly bookings: BookingService) {}

  @Staff('booking.read')
  @Get()
  list(@Query() q: BookingListQuery): Promise<Paginated<BookingDto>> {
    return this.bookings.list(q);
  }

  @Staff('booking.read')
  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookings.get(id);
  }

  /** Call-center / counter booking. */
  @Staff('booking.write')
  @Post()
  create(@Body() dto: AdminCreateBookingDto, @CurrentUser() user: AuthUser) {
    return this.bookings.createByStaff(dto, user.sub);
  }

  @Staff('booking.write')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookingDto,
  ) {
    return this.bookings.update(id, dto);
  }

  @Staff('booking.write')
  @Post(':id/status')
  @HttpCode(200)
  status(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeBookingStatusDto,
  ) {
    return this.bookings.changeStatus(id, dto.status, dto.reason);
  }

  /** Record a cash / manual bank payment. */
  @Staff('booking.write')
  @Post(':id/payments')
  @HttpCode(200)
  pay(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RecordPaymentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.bookings.confirmPayment({
      bookingId: id,
      method: dto.method,
      providerTxnId: dto.provider_txn_id ?? null,
      userId: user.sub,
    });
  }
}

/** SePay-compatible bank-transfer webhook (Casso maps the same fields). */
interface BankWebhookBody {
  id?: number | string;
  content?: string;
  description?: string;
  transferType?: 'in' | 'out';
  transferAmount?: number;
  amount?: number;
  referenceCode?: string;
}

@ApiTags('payments')
@Public()
@Controller('payments')
export class PaymentWebhookController {
  constructor(
    private readonly bookings: BookingService,
    @InjectEnv() private readonly env: Env,
  ) {}

  @Post('webhooks/bank')
  @HttpCode(200)
  async bank(
    @Headers('authorization') auth: string | undefined,
    @Body() body: BankWebhookBody,
  ) {
    const secret = this.env.PAYMENT_WEBHOOK_SECRET;
    const given = (auth ?? '').replace(/^(Apikey|Bearer)\s+/i, '');
    if (
      !secret ||
      given.length !== secret.length ||
      !timingSafeEqual(Buffer.from(given), Buffer.from(secret))
    ) {
      throw new UnauthorizedException({
        code: 'BAD_SIGNATURE',
        message: 'Invalid webhook credentials',
      });
    }
    if (body.transferType && body.transferType !== 'in')
      return { success: true, matched: false };
    const content = body.content ?? body.description ?? '';
    const amount = Number(body.transferAmount ?? body.amount ?? 0);
    const txn = String(body.referenceCode ?? body.id ?? '');
    if (!txn || !amount) return { success: true, matched: false };
    const result = await this.bookings.handleBankTransfer(
      content,
      amount,
      `bank:${txn}`,
      body as Record<string, unknown>,
    );
    return { success: true, ...result };
  }
}
