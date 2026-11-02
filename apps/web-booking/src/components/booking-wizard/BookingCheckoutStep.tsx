'use client';

import React from 'react';
import { Button, Radio, Typography } from 'antd';
import type { PaymentMethod } from '@limousine-workspace/shared-types/legacy';

const OPTIONS: {
  value: PaymentMethod;
  title: string;
  subtitle?: string;
  dot: string;
}[] = [
  {
    value: 'MOMO',
    title: 'Ví MoMo',
    subtitle: 'Thanh toán qua ví MoMo',
    dot: '#a50064',
  },
  {
    value: 'ZALOPAY',
    title: 'ZaloPay',
    subtitle: 'Thanh toán qua ZaloPay',
    dot: '#0068ff',
  },
  {
    value: 'VNPAY',
    title: 'VNPay',
    subtitle: 'Thẻ / QR qua cổng VNPay',
    dot: '#0f4c92',
  },
  {
    value: 'COD',
    title: 'Thanh toán tại nhà xe',
    subtitle: 'Thanh toán khi lên xe / tại quầy',
    dot: '#64748b',
  },
];

export type BookingCheckoutStepProps = {
  payment: PaymentMethod;
  onPaymentChange: (m: PaymentMethod) => void;
  seatSummary: string;
  seatCount: number;
  unitPrice: number;
  pickupAddress: string;
  dropoffAddress: string;
  passengerName: string;
  passengerPhone: string;
  submitting: boolean;
  onBack: () => void;
  onOpenPayment: () => void;
};

export function BookingCheckoutStep({
  payment,
  onPaymentChange,
  seatSummary,
  seatCount,
  unitPrice,
  pickupAddress,
  dropoffAddress,
  passengerName,
  passengerPhone,
  submitting,
  onBack,
  onOpenPayment,
}: BookingCheckoutStepProps) {
  const seatsLine =
    seatCount > 0
      ? `${seatCount} ghế — ${seatSummary.replace(/\s*•\s*/g, ', ')}`
      : seatSummary;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
      <div className="rounded-2xl border border-[#e5e7eb] bg-[#f3f4f6] p-6 shadow-[0_8px_28px_rgba(0,0,0,0.08)] sm:p-7 md:col-span-5 lg:p-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 text-sm font-semibold text-[#64748b] transition-colors hover:text-[#0a0e1a]"
        >
          ← Quay lại
        </button>
        <Typography.Title
          level={4}
          className="!mb-1 !mt-0 !text-lg !font-black !text-[#0a0e1a] sm:!text-xl"
        >
          Phương thức thanh toán
        </Typography.Title>
        <Typography.Paragraph className="!mb-6 !mt-0 !text-sm !font-medium !text-[#64748b]">
          Chọn ví hoặc cổng thanh toán phù hợp
        </Typography.Paragraph>

        <Radio.Group
          value={payment}
          onChange={(e) => onPaymentChange(e.target.value)}
          className="flex w-full flex-col gap-3"
        >
          {OPTIONS.map((o) => {
            const sel = payment === o.value;
            return (
              <Radio
                key={o.value}
                value={o.value}
                className="!m-0 flex w-full items-start rounded-none border-0 bg-transparent !px-0 !py-0 [&_.ant-radio]:mt-1.5 [&_.ant-radio+span]:!flex-1 [&_.ant-radio+span]:!pl-3 [&_.ant-radio+span]:!pr-0"
              >
                <div
                  className={`flex w-full flex-1 items-center justify-between gap-3 rounded-xl border-2 px-4 py-3.5 transition-colors ${
                    sel
                      ? 'border-nova-gold bg-white shadow-sm'
                      : 'border-transparent bg-white/90 hover:bg-white'
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span
                      className="size-3 shrink-0 rounded-full ring-2 ring-white/80 sm:size-3.5"
                      style={{ backgroundColor: o.dot }}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-black text-[#0a0e1a] sm:text-base">
                        {o.title}
                      </div>
                      {o.subtitle ? (
                        <div className="mt-0.5 text-xs font-medium text-[#64748b]">
                          {o.subtitle}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {sel ? (
                    <span className="shrink-0 rounded-md bg-nova-gold/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-nova-gold sm:text-xs">
                      Đang chọn
                    </span>
                  ) : null}
                </div>
              </Radio>
            );
          })}
        </Radio.Group>

        <Button
          type="primary"
          block
          size="large"
          loading={submitting}
          className="mt-8 h-12 rounded-xl !border-0 !bg-nova-gold !text-[15px] !font-black !text-nova-bg hover:!bg-nova-gold-hover"
          onClick={onOpenPayment}
        >
          Đặt vé và thanh toán
        </Button>
      </div>

      <div className="rounded-2xl border border-[#1e293b] bg-[#0f172a] p-6 text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] sm:p-7 md:col-span-7 md:p-8">
        <Typography.Title
          level={4}
          className="!mb-6 !mt-0 !text-lg !font-black !text-white sm:!text-xl"
        >
          Tóm tắt đơn
        </Typography.Title>

        <ul className="space-y-4 text-sm font-medium leading-relaxed text-white/90 sm:text-[15px]">
          <li>
            <span className="font-bold text-white/55">Hành khách:</span>{' '}
            {passengerName || '—'}
          </li>
          <li>
            <span className="font-bold text-white/55">Ghế:</span> {seatsLine}
          </li>
          <li>
            <span className="font-bold text-white/55">Điểm đón:</span>{' '}
            {pickupAddress || '—'}
          </li>
          <li>
            <span className="font-bold text-white/55">Điểm trả:</span>{' '}
            {dropoffAddress || '—'}
          </li>
          {passengerPhone ? (
            <li>
              <span className="font-bold text-white/55">Điện thoại:</span>{' '}
              {passengerPhone}
            </li>
          ) : null}
        </ul>

        <div className="mt-8 flex flex-col items-end gap-1 border-t border-white/10 pt-6">
          <span className="text-xs font-semibold uppercase tracking-wide text-white/50">
            Tổng thanh toán
          </span>
          <p className="text-3xl font-black tracking-tight text-nova-gold sm:text-4xl">
            {unitPrice.toLocaleString('vi-VN')} đ
          </p>
        </div>
      </div>
    </div>
  );
}
