'use client';

import type {
  BookingDto,
  PaymentInstructionDto,
} from '@limousine-workspace/shared-types';
import {
  Badge,
  Button,
  Card,
  DescriptionList,
  ErrorState,
  Field,
  Input,
  Money,
  SkeletonText,
  StatusTag,
  buttonClasses,
  useConfirm,
  useToast,
} from '@limousine-workspace/shared-ui';
import {
  formatDateTime,
  formatTime,
  formatVnPhone,
  formatWeekdayDate,
  isValidVnPhone,
  normalizeVnPhone,
} from '@limousine-workspace/utils-core';
import {
  CalendarPlus,
  CheckCircle2,
  Clock4,
  MapPin,
  Search,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ApiError, publicApi } from '../../lib/api';
import { ticketPhones } from '../../lib/session';
import { PaymentPanel } from '../booking/PaymentPanel';

/** Build an .ics so the trip lands in the customer's calendar (pickup = 30 min before departure). */
function downloadIcs(b: BookingDto) {
  const fmt = (iso: string) => iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const start = new Date(
    new Date(b.trip.departure_at).getTime() - 30 * 60_000,
  ).toISOString();
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NovaLimo//Booking//VI',
    'BEGIN:VEVENT',
    `UID:${b.code}@novalimo.vn`,
    `DTSTAMP:${fmt(new Date().toISOString())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(b.trip.arrival_eta)}`,
    `SUMMARY:NovaLimo ${b.trip.route.name} (${b.code})`,
    `LOCATION:${b.pickup.address.replace(/[,;]/g, ' ')}`,
    `DESCRIPTION:Ghế ${b.seats.map((s) => s.seat_label).join(' ')}. Có mặt trước giờ đón 10 phút.`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(
    new Blob([ics], { type: 'text/calendar;charset=utf-8' }),
  );
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: `novalimo-${b.code}.ics`,
  });
  a.click();
  URL.revokeObjectURL(url);
}

function Hero({ booking }: { booking: BookingDto }) {
  const paid =
    booking.payment_status === 'PAID' || booking.payment_method === 'CASH';
  const cancelled = booking.status === 'CANCELLED';
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span
        className={
          cancelled
            ? 'flex size-16 items-center justify-center rounded-full bg-surface-3 text-fg-muted'
            : paid
              ? 'flex size-16 items-center justify-center rounded-full bg-success-bg text-success-fg ring-8 ring-success-bg/40'
              : 'flex size-16 items-center justify-center rounded-full bg-warning-bg text-warning-fg ring-8 ring-warning-bg/40'
        }
      >
        {cancelled ? (
          <XCircle className="size-8" />
        ) : paid ? (
          <CheckCircle2 className="size-8" />
        ) : (
          <Clock4 className="size-8" />
        )}
      </span>
      <div>
        <h1 className="text-2xl font-semibold text-fg sm:text-3xl">
          {cancelled
            ? 'Vé đã hủy'
            : paid
              ? 'Đặt vé thành công!'
              : 'Vé đang chờ thanh toán'}
        </h1>
        <p className="mt-2 text-sm text-fg-muted">
          {cancelled
            ? (booking.cancel_reason ?? 'Vé này không còn hiệu lực.')
            : paid
              ? 'Chúng tôi đã gửi SMS xác nhận. Tài xế sẽ gọi cho bạn trước giờ đón.'
              : 'Hoàn tất chuyển khoản để giữ chỗ. Vé tự hủy nếu quá hạn thanh toán.'}
        </p>
      </div>
      <div className="rounded-card border border-dashed border-brand/50 bg-brand-subtle px-6 py-3">
        <p className="text-xs uppercase tracking-[0.16em] text-fg-muted">
          Mã vé
        </p>
        <p className="font-mono text-3xl font-semibold tracking-[0.12em] text-brand-fg">
          {booking.code}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <StatusTag domain="booking" status={booking.status} />
        <StatusTag domain="payment" status={booking.payment_status} />
      </div>
    </div>
  );
}

export function TicketDetails({ booking }: { booking: BookingDto }) {
  return (
    <DescriptionList
      items={[
        { label: 'Tuyến', value: booking.trip.route.name },
        {
          label: 'Khởi hành',
          value: (
            <span className="capitalize">{`${formatTime(booking.trip.departure_at)} · ${formatWeekdayDate(booking.trip.departure_at)}`}</span>
          ),
        },
        {
          label: 'Người liên hệ',
          value: `${booking.contact_name} · ${formatVnPhone(booking.contact_phone)}`,
        },
        {
          label: 'Thanh toán',
          value:
            booking.payment_method === 'CASH'
              ? 'Tiền mặt khi lên xe'
              : 'Chuyển khoản VietQR',
        },
        {
          label: 'Điểm đón',
          full: true,
          value: (
            <span className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-fg" />{' '}
              {booking.pickup.address}
            </span>
          ),
        },
        { label: 'Điểm trả', full: true, value: booking.dropoff.address },
        {
          label: 'Ghế',
          full: true,
          value: (
            <ul className="mt-1 flex flex-col gap-1.5">
              {booking.seats.map((s) => (
                <li
                  key={s.seat_label}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="flex items-center gap-2">
                    <Badge
                      size="sm"
                      tone={s.tier === 'VIP' ? 'brand' : 'neutral'}
                    >
                      {s.seat_label}
                    </Badge>
                    {s.passenger_name}
                  </span>
                  <Money value={s.price_vnd} />
                </li>
              ))}
              <li className="mt-1 flex items-center justify-between border-t border-border-subtle pt-2 font-semibold">
                <span>Tổng</span>
                <Money value={booking.total_vnd} className="text-brand-fg" />
              </li>
            </ul>
          ),
        },
      ]}
    />
  );
}

export function TicketView({ code }: { code: string }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [phone, setPhone] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [state, setState] = useState<
    | { booking: BookingDto; payment: PaymentInstructionDto | null }
    | 'loading'
    | 'ask'
    | 'error'
    | 'notfound'
  >('loading');

  const load = useCallback(
    async (p: string) => {
      setState('loading');
      try {
        const r = await publicApi.lookup(code, p);
        ticketPhones.set(code, p);
        setState(r);
      } catch (e) {
        setState(
          e instanceof ApiError && e.status === 404 ? 'notfound' : 'error',
        );
      }
    },
    [code],
  );

  useEffect(() => {
    const saved = ticketPhones.get(code);
    /* eslint-disable react-hooks/set-state-in-effect -- read browser storage once */
    if (saved) {
      setPhone(saved);
      void load(saved);
    } else setState('ask');
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [code, load]);

  const cancel = async () => {
    if (typeof state !== 'object' || !phone) return;
    const paid = state.booking.payment_status === 'PAID';
    const ok = await confirm({
      title: `Hủy vé ${code}?`,
      content: paid
        ? 'Vé đã thanh toán: yêu cầu hoàn tiền sẽ được gửi tới bộ phận CSKH theo chính sách hủy vé.'
        : 'Ghế sẽ được nhả cho khách khác.',
      okText: paid ? 'Gửi yêu cầu hủy' : 'Hủy vé',
      danger: true,
    });
    if (!ok) return;
    try {
      const r = await publicApi.cancel(code, phone);
      toast.success(
        r.status === 'CANCELLED'
          ? 'Đã hủy vé'
          : 'Đã gửi yêu cầu hủy & hoàn tiền',
      );
      void load(phone);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Không hủy được vé');
    }
  };

  if (state === 'ask' || state === 'notfound') {
    return (
      <Card padding="lg" className="mx-auto max-w-md">
        <h1 className="text-xl font-semibold text-fg">Xem vé {code}</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Nhập số điện thoại người đặt hoặc hành khách để xem vé.
        </p>
        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isValidVnPhone(phoneInput)) return;
            const p = normalizeVnPhone(phoneInput);
            setPhone(p);
            void load(p);
          }}
        >
          <Field
            label="Số điện thoại"
            error={
              state === 'notfound'
                ? 'Không tìm thấy vé với số điện thoại này'
                : phoneInput && !isValidVnPhone(phoneInput)
                  ? 'Số điện thoại không hợp lệ'
                  : undefined
            }
          >
            {(p) => (
              <Input
                {...p}
                type="tel"
                inputMode="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="0912 345 678"
              />
            )}
          </Field>
          <Button type="submit" leftIcon={<Search className="size-4" />}>
            Xem vé
          </Button>
        </form>
      </Card>
    );
  }
  if (state === 'loading') {
    return (
      <Card padding="lg" className="mx-auto max-w-3xl">
        <SkeletonText lines={6} />
      </Card>
    );
  }
  if (state === 'error') {
    return (
      <Card className="mx-auto max-w-3xl">
        <ErrorState onRetry={() => phone && load(phone)} />
      </Card>
    );
  }

  const { booking, payment } = state;
  const cancellable =
    ['PENDING_PAYMENT', 'CONFIRMED'].includes(booking.status) &&
    new Date(booking.trip.departure_at) > new Date();
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Card padding="lg">
        <Hero booking={booking} />
      </Card>
      {payment &&
        booking.payment_status === 'PENDING' &&
        booking.status !== 'CANCELLED' &&
        phone && (
          <Card padding="lg">
            <h2 className="mb-5 text-lg font-semibold text-fg">
              Thanh toán chuyển khoản
            </h2>
            <PaymentPanel
              code={booking.code}
              phone={phone}
              payment={payment}
              onPaid={() => load(phone)}
            />
          </Card>
        )}
      <Card padding="lg">
        <h2 className="mb-5 text-lg font-semibold text-fg">Chi tiết vé</h2>
        <TicketDetails booking={booking} />
        <p className="mt-6 text-xs text-fg-muted">
          Đặt lúc {formatDateTime(booking.created_at)}. Vui lòng có mặt tại điểm
          đón trước 10 phút.
        </p>
      </Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {booking.status !== 'CANCELLED' && (
            <Button
              variant="secondary"
              leftIcon={<CalendarPlus className="size-4" />}
              onClick={() => downloadIcs(booking)}
            >
              Thêm vào lịch
            </Button>
          )}
          {cancellable && (
            <Button
              variant="ghost"
              onClick={cancel}
              className="text-danger-fg hover:text-danger-fg"
            >
              Hủy vé
            </Button>
          )}
        </div>
        <Link href="/" className={buttonClasses({ variant: 'outline' })}>
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
