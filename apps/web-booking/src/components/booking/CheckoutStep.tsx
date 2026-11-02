'use client';

import type {
  PaymentInstructionDto,
  PaymentMethod,
} from '@limousine-workspace/shared-types';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  DescriptionList,
  Money,
  cn,
  useToast,
} from '@limousine-workspace/shared-ui';
import {
  formatTime,
  formatVnPhone,
  formatWeekdayDate,
} from '@limousine-workspace/utils-core';
import { Modal } from 'antd';
import { ArrowLeft, Banknote, Lock, QrCode, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { ApiError, publicApi } from '../../lib/api';
import { ticketPhones } from '../../lib/session';
import { useBooking } from './BookingContext';
import { PaymentPanel } from './PaymentPanel';

const METHODS: {
  value: PaymentMethod | 'SOON';
  title: string;
  body: string;
  icon: ReactNode;
  badge?: string;
  disabled?: boolean;
}[] = [
  {
    value: 'BANK_TRANSFER',
    title: 'Chuyển khoản VietQR',
    body: 'Quét mã bằng app ngân hàng, xác nhận tự động.',
    icon: <QrCode className="size-5" />,
    badge: 'Khuyên dùng',
  },
  {
    value: 'CASH',
    title: 'Tiền mặt khi lên xe',
    body: 'Thanh toán cho tài xế khi được đón.',
    icon: <Banknote className="size-5" />,
  },
  {
    value: 'SOON',
    title: 'Ví MoMo · ZaloPay · VNPay',
    body: 'Sắp ra mắt.',
    icon: <Wallet className="size-5" />,
    disabled: true,
  },
];

export function CheckoutStep() {
  const { trip, draft, ready, reset } = useBooking();
  const router = useRouter();
  const toast = useToast();
  const [method, setMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pending, setPending] = useState<{
    code: string;
    payment: PaymentInstructionDto;
  } | null>(null);
  /** Set once the booking exists — stops the "missing draft" redirect from racing the success navigation. */
  const leaving = useRef(false);

  useEffect(() => {
    if (!ready || leaving.current) return;
    if (!draft.hold_token || !draft.seats.length)
      router.replace(`/booking/${trip.id}`);
    else if (!draft.contact || !draft.pickup || !draft.dropoff)
      router.replace(`/booking/${trip.id}/info`);
  }, [ready, draft, trip.id, router]);

  if (!ready || !draft.contact || !draft.pickup || !draft.dropoff) return null;
  const { contact, pickup, dropoff } = draft;
  const prices = draft.seat_prices ?? {};
  const total = draft.seats.reduce(
    (s, l) => s + (prices[l] ?? trip.price_vnd),
    0,
  );

  const goSuccess = (code: string) => {
    leaving.current = true;
    router.push(`/booking/success/${code}`);
    reset();
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await publicApi.createBooking({
        trip_batch_id: trip.id,
        hold_token: draft.hold_token ?? '',
        contact_name: contact.name,
        contact_phone: contact.phone,
        contact_email: contact.email,
        pickup: {
          stop_id: pickup.stop_id,
          address: pickup.address,
          lat: pickup.lat ?? 0,
          lng: pickup.lng ?? 0,
        },
        dropoff: {
          stop_id: dropoff.stop_id,
          address: dropoff.address,
          lat: dropoff.lat ?? 0,
          lng: dropoff.lng ?? 0,
        },
        passengers: draft.seats.map((l) => ({
          seat_label: l,
          name: draft.passengers?.[l]?.name || contact.name,
          phone: draft.passengers?.[l]?.phone,
        })),
        payment_method: method,
        note: draft.note,
      });
      ticketPhones.set(res.booking.code, contact.phone);
      if (res.payment && res.booking.payment_status !== 'PAID')
        setPending({ code: res.booking.code, payment: res.payment });
      else goSuccess(res.booking.code);
    } catch (e) {
      if (
        e instanceof ApiError &&
        (e.code === 'HOLD_EXPIRED' || e.code === 'SEAT_TAKEN')
      ) {
        toast.error(e.message);
        router.replace(`/booking/${trip.id}`);
        return;
      }
      toast.error(
        e instanceof ApiError
          ? e.message
          : 'Không tạo được vé, vui lòng thử lại',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card padding="lg">
        <h1 className="text-2xl font-semibold text-fg">
          Xác nhận & thanh toán
        </h1>
        <DescriptionList
          className="mt-6"
          items={[
            {
              label: 'Chuyến',
              value: `${trip.route.name} · ${formatTime(trip.departure_at)}, ${formatWeekdayDate(trip.departure_at)}`,
            },
            {
              label: 'Người liên hệ',
              value: `${contact.name} · ${formatVnPhone(contact.phone)}`,
            },
            { label: 'Điểm đón', value: pickup.address, full: true },
            { label: 'Điểm trả', value: dropoff.address, full: true },
            {
              label: 'Ghế & hành khách',
              full: true,
              value: (
                <ul className="mt-1 flex flex-col gap-1.5">
                  {[...draft.seats].sort().map((l) => (
                    <li
                      key={l}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="flex items-center gap-2">
                        <Badge size="sm">{l}</Badge>{' '}
                        {draft.passengers?.[l]?.name || contact.name}
                      </span>
                      <Money value={prices[l] ?? trip.price_vnd} />
                    </li>
                  ))}
                </ul>
              ),
            },
            ...(draft.note
              ? [{ label: 'Ghi chú', value: draft.note, full: true }]
              : []),
          ]}
        />
      </Card>

      <Card padding="lg">
        <h2 className="text-lg font-semibold text-fg">
          Phương thức thanh toán
        </h2>
        <div
          role="radiogroup"
          aria-label="Phương thức thanh toán"
          className="mt-5 grid gap-3"
        >
          {METHODS.map((m) => {
            const active = m.value === method;
            return (
              <button
                key={m.value}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={m.disabled}
                onClick={() => m.value !== 'SOON' && setMethod(m.value)}
                className={cn(
                  'flex items-center gap-4 rounded-card border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45',
                  active
                    ? 'border-brand bg-brand-subtle'
                    : 'border-border-default bg-surface-2 hover:border-border-strong',
                )}
              >
                <span
                  className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-control',
                    active
                      ? 'bg-brand text-on-brand'
                      : 'bg-surface-3 text-fg-secondary',
                  )}
                >
                  {m.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-medium text-fg">
                    {m.title}{' '}
                    {m.badge && (
                      <Badge tone="brand" size="sm">
                        {m.badge}
                      </Badge>
                    )}
                  </span>
                  <span className="block text-sm text-fg-muted">{m.body}</span>
                </span>
                <span
                  className={cn(
                    'size-5 shrink-0 rounded-full border-2',
                    active
                      ? 'border-brand bg-brand shadow-[inset_0_0_0_3px_var(--nl-surface-2)]'
                      : 'border-border-strong',
                  )}
                />
              </button>
            );
          })}
        </div>
      </Card>

      <Card padding="lg" className="flex flex-col gap-5">
        <div className="flex items-end justify-between">
          <span className="text-fg-muted">Tổng thanh toán</span>
          <Money
            value={total}
            className="text-3xl font-semibold text-brand-fg"
          />
        </div>
        <Checkbox
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          label={
            <>
              Tôi đồng ý với{' '}
              <Link
                href="/terms"
                target="_blank"
                className="text-brand-fg underline underline-offset-4"
              >
                điều khoản
              </Link>{' '}
              và{' '}
              <Link
                href="/faq"
                target="_blank"
                className="text-brand-fg underline underline-offset-4"
              >
                chính sách hủy vé
              </Link>
            </>
          }
        />
        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/booking/${trip.id}/info`}
            className="inline-flex items-center justify-center gap-1.5 text-sm text-fg-muted hover:text-fg"
          >
            <ArrowLeft className="size-4" /> Sửa thông tin
          </Link>
          <Button
            size="lg"
            disabled={!agree}
            loading={submitting}
            onClick={submit}
            leftIcon={<Lock className="size-4" />}
          >
            {method === 'CASH' ? 'Xác nhận đặt vé' : 'Đặt vé & thanh toán'}
          </Button>
        </div>
      </Card>

      <Modal
        open={!!pending}
        title="Thanh toán chuyển khoản VietQR"
        footer={null}
        width={760}
        centered
        maskClosable={false}
        onCancel={() => pending && goSuccess(pending.code)}
        destroyOnHidden
      >
        {pending && (
          <>
            <p className="mb-5 text-sm text-fg-muted">
              Mã vé <strong className="text-fg">{pending.code}</strong> đã được
              tạo và ghế đang được giữ. Đóng cửa sổ này nếu bạn muốn thanh toán
              sau — mã QR vẫn có ở trang vé.
            </p>
            <PaymentPanel
              code={pending.code}
              phone={contact.phone}
              payment={pending.payment}
              onPaid={() => goSuccess(pending.code)}
            />
          </>
        )}
      </Modal>
    </div>
  );
}
