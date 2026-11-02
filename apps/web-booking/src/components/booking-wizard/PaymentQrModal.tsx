'use client';

import React, { useMemo } from 'react';
import { Button, Modal, Typography } from 'antd';
import dayjs from 'dayjs';
import type { PaymentMethod } from '@limousine-workspace/shared-types/legacy';

function paymentLabel(m: PaymentMethod): string {
  switch (m) {
    case 'MOMO':
      return 'Ví MoMo';
    case 'ZALOPAY':
      return 'ZaloPay';
    case 'VNPAY':
      return 'VNPay';
    default:
      return 'Thanh toán tại nhà xe';
  }
}

export type PaymentQrModalProps = {
  open: boolean;
  payment: PaymentMethod;
  unitPrice: number;
  submitting: boolean;
  passengerName: string;
  passengerPhone: string;
  pickupAddress: string;
  dropoffAddress: string;
  seatSummary: string;
  seatCount: number;
  tripBatchId: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function PaymentQrModal({
  open,
  payment,
  unitPrice,
  submitting,
  passengerName,
  passengerPhone,
  pickupAddress,
  dropoffAddress,
  seatSummary,
  seatCount,
  tripBatchId,
  onCancel,
  onConfirm,
}: PaymentQrModalProps) {
  const transferRef = useMemo(
    () => `NL-${dayjs().format('YYYYMMDD')}-001 | NOVALIMO`,
    [],
  );

  const seatsLine =
    seatCount > 0
      ? `${seatCount} ghế (${seatSummary.replace(/\s*•\s*/g, ', ')})`
      : seatSummary;

  const isOnline = payment !== 'COD';

  return (
    <Modal
      title={
        <span className="text-lg font-black text-[#0a0e1a] sm:text-xl">
          Hoàn tất thanh toán
        </span>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button
          key="b"
          onClick={onCancel}
          className="font-semibold text-[#64748b]"
        >
          Đóng
        </Button>,
        <Button
          key="ok"
          type="primary"
          loading={submitting}
          className="!h-10 !rounded-lg !border-0 !bg-nova-gold !px-6 !font-black !text-nova-bg hover:!bg-nova-gold-hover"
          onClick={onConfirm}
        >
          Xác nhận &amp; tạo vé
        </Button>,
      ]}
      width={560}
      centered
      rootClassName="[&_.ant-modal-content]:!rounded-2xl"
      classNames={{
        header: '!border-b !border-[#e5e7eb] !pb-4 !pt-1',
        body: '!pt-4',
        footer: '!border-t !border-[#e5e7eb] !pt-4',
      }}
    >
      {isOnline ? (
        <>
          <div className="mx-auto flex aspect-square w-full max-w-[260px] items-center justify-center rounded-xl border-2 border-dashed border-[#cbd5e1] bg-[#f8fafc] text-center sm:max-w-[280px]">
            <div>
              <p className="text-sm font-black text-[#64748b]">QR thanh toán</p>
              <p className="mt-2 text-2xl font-black text-[#0a0e1a]">
                {unitPrice.toLocaleString('vi-VN')} đ
              </p>
            </div>
          </div>
          <p className="mt-3 text-center text-xs font-semibold text-[#64748b]">
            VietQR — Chuyển khoản 24/7
          </p>

          <div className="mt-5 rounded-xl bg-[#f1f5f9] px-4 py-3 text-sm text-[#0a0e1a]">
            <p className="font-bold">
              <span className="text-[#64748b]">STK:</span> 0123 4567 890 —
              Vietcombank — CTCP NovaLimo
            </p>
            <p className="mt-2 font-mono text-[13px] font-bold">
              <span className="font-sans font-bold text-[#64748b]">
                Nội dung CK:
              </span>{' '}
              {transferRef}
            </p>
          </div>

          <div className="mt-5 space-y-2 border-t border-[#e5e7eb] pt-4 text-sm text-[#334155]">
            <p>
              <span className="font-bold text-[#64748b]">Đón:</span>{' '}
              {pickupAddress}
            </p>
            <p>
              <span className="font-bold text-[#64748b]">Trả:</span>{' '}
              {dropoffAddress}
            </p>
            <p>
              <span className="font-bold text-[#64748b]">Chuyến:</span> Mã{' '}
              <span className="font-mono font-bold">{tripBatchId}</span> —{' '}
              {dayjs().format('DD/MM/YYYY — HH:mm')}
            </p>
            <p>
              <span className="font-bold text-[#64748b]">Ghế:</span> {seatsLine}
            </p>
            <p>
              <span className="font-bold text-[#64748b]">Hành khách:</span>{' '}
              {passengerName} · {passengerPhone}
            </p>
            <p>
              <span className="font-bold text-[#64748b]">Cổng:</span>{' '}
              {paymentLabel(payment)}
            </p>
          </div>

          <div className="mt-5 flex flex-col items-end gap-1 border-t border-[#e5e7eb] pt-4">
            <span className="text-xs font-bold uppercase tracking-wide text-[#64748b]">
              Số tiền cần thanh toán
            </span>
            <p className="text-3xl font-black text-nova-gold">
              {unitPrice.toLocaleString('vi-VN')} đ
            </p>
          </div>

          <Typography.Paragraph className="!mb-0 !mt-4 !text-center !text-xs !leading-relaxed !text-[#94a3b8]">
            Vé sẽ được xác nhận tự động sau khi chuyển khoản thành công (thời
            gian xử lý có thể vài phút).
          </Typography.Paragraph>
        </>
      ) : (
        <>
          <Typography.Paragraph className="!text-[15px] !leading-relaxed !text-[#334155]">
            Bạn chọn thanh toán khi lên xe / tại nhà xe. Bấm xác nhận để tạo vé
            với phương thức COD.
          </Typography.Paragraph>
          <div className="mt-4 rounded-xl bg-[#f1f5f9] px-4 py-3 text-sm font-bold text-[#0a0e1a]">
            Tổng: {unitPrice.toLocaleString('vi-VN')} đ
          </div>
        </>
      )}
    </Modal>
  );
}
