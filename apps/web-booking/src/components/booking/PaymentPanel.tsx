'use client';

import type { PaymentInstructionDto } from '@limousine-workspace/shared-types';
import {
  Button,
  Money,
  Spinner,
  cn,
  useToast,
} from '@limousine-workspace/shared-ui';
import {
  RealtimeCommands,
  RealtimeEvents,
  formatVnd,
} from '@limousine-workspace/utils-core';
import { Check, Copy, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { publicApi } from '../../lib/api';
import { realtime } from '../../lib/socket';
import { useHoldCountdown } from './BookingContext';

function CopyRow({
  label,
  value,
  copyValue,
  strong,
}: {
  label: string;
  value: string;
  copyValue?: string;
  strong?: boolean;
}) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border-subtle py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-xs text-fg-muted">{label}</p>
        <p
          className={cn(
            'truncate tabular-nums',
            strong
              ? 'text-lg font-semibold text-brand-fg'
              : 'text-sm font-medium text-fg',
          )}
        >
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(copyValue ?? value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            toast.error('Không sao chép được, hãy nhập thủ công');
          }
        }}
        className="flex shrink-0 items-center gap-1.5 rounded-control border border-border-default px-2.5 py-1.5 text-xs text-fg-secondary hover:border-brand hover:text-brand-fg"
        aria-label={`Sao chép ${label}`}
      >
        {copied ? (
          <Check className="size-3.5" />
        ) : (
          <Copy className="size-3.5" />
        )}
        {copied ? 'Đã chép' : 'Chép'}
      </button>
    </div>
  );
}

/**
 * A8 — VietQR transfer instructions. Confirmation arrives over the socket (`payment_confirmed`)
 * with a polling fallback, then `onPaid` fires.
 */
export function PaymentPanel({
  code,
  phone,
  payment,
  onPaid,
}: {
  code: string;
  phone: string;
  payment: PaymentInstructionDto;
  onPaid: () => void;
}) {
  const left = useHoldCountdown(payment.expires_at ?? undefined);
  const [checking, setChecking] = useState(false);
  const paidRef = useRef(false);
  const toast = useToast();

  const markPaid = () => {
    if (paidRef.current) return;
    paidRef.current = true;
    onPaid();
  };

  useEffect(() => {
    const socket = realtime();
    const join = () => socket.emit(RealtimeCommands.subscribeBooking, code);
    const onConfirmed = (e: { code: string; payment_status: string }) => {
      if (e.code === code && e.payment_status === 'PAID') markPaid();
    };
    join();
    socket.on('connect', join);
    socket.on(RealtimeEvents.paymentConfirmed, onConfirmed);
    const poll = setInterval(async () => {
      try {
        const r = await publicApi.lookup(code, phone);
        if (r.booking.payment_status === 'PAID') markPaid();
      } catch {
        /* keep waiting */
      }
    }, 10_000);
    return () => {
      socket.off('connect', join);
      socket.off(RealtimeEvents.paymentConfirmed, onConfirmed);
      clearInterval(poll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, phone]);

  const checkNow = async () => {
    setChecking(true);
    try {
      const r = await publicApi.lookup(code, phone);
      if (r.booking.payment_status === 'PAID') markPaid();
      else
        toast.info(
          'Chưa nhận được chuyển khoản. Hệ thống sẽ tự cập nhật ngay khi ngân hàng báo về.',
        );
    } finally {
      setChecking(false);
    }
  };

  const expired = left === 0;
  const mm = String(Math.floor((left ?? 0) / 60)).padStart(2, '0');
  const ss = String((left ?? 0) % 60).padStart(2, '0');

  return (
    <div className="grid gap-6 md:grid-cols-[260px_1fr]">
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-panel bg-white p-3 shadow-e2">
          {payment.bank && (
            // External VietQR image (dynamic per amount/content) — not routed through next/image.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={payment.bank.qr_image_url}
              alt={`Mã VietQR thanh toán ${formatVnd(payment.amount_vnd)}`}
              width={232}
              height={232}
              className={cn(
                'size-[232px] rounded-card',
                expired && 'opacity-20 grayscale',
              )}
            />
          )}
        </div>
        <p className="text-center text-xs text-fg-muted">
          Mở ứng dụng ngân hàng → Quét QR. Số tiền và nội dung đã điền sẵn.
        </p>
      </div>
      <div className="flex flex-col">
        {payment.bank && (
          <div className="rounded-card border border-border-subtle bg-surface-2 px-4">
            <CopyRow
              label="Số tiền"
              value={formatVnd(payment.amount_vnd)}
              copyValue={String(payment.amount_vnd)}
              strong
            />
            <CopyRow
              label="Nội dung chuyển khoản (bắt buộc)"
              value={payment.reference}
              strong
            />
            <CopyRow label="Số tài khoản" value={payment.bank.account_no} />
            <div className="py-3">
              <p className="text-xs text-fg-muted">Chủ tài khoản</p>
              <p className="text-sm font-medium text-fg">
                {payment.bank.account_name}
              </p>
            </div>
          </div>
        )}
        <div
          className={cn(
            'mt-4 flex items-center gap-3 rounded-card border p-4 text-sm',
            expired
              ? 'border-danger-border bg-danger-bg text-danger-fg'
              : 'border-border-subtle bg-surface-2 text-fg-secondary',
          )}
        >
          {expired ? (
            <span>
              Đã hết hạn thanh toán. Vé đã bị hủy để nhả ghế — vui lòng đặt lại
              hoặc gọi hotline nếu bạn đã chuyển khoản.
            </span>
          ) : (
            <>
              <Spinner className="text-brand-fg" />
              <span>
                Đang chờ thanh toán… còn{' '}
                <strong className="tabular-nums text-fg">
                  {mm}:{ss}
                </strong>
                . Trang sẽ tự chuyển khi nhận được tiền.
              </span>
            </>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-xs text-fg-muted">
            <ShieldCheck className="size-4 text-success-fg" /> Đối soát tự động
            qua ngân hàng, không lưu thông tin thẻ
          </p>
          <Button
            variant="secondary"
            onClick={checkNow}
            loading={checking}
            disabled={expired}
          >
            Tôi đã chuyển khoản
          </Button>
        </div>
        <p className="mt-3 text-xs text-fg-muted">
          Tổng thanh toán{' '}
          <Money value={payment.amount_vnd} className="font-semibold text-fg" />
        </p>
      </div>
    </div>
  );
}
