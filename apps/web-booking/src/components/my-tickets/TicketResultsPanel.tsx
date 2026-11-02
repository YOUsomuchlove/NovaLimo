'use client';

import React from 'react';
import { Alert, Button } from 'antd';
import type { Booking, BookingStatus } from '@limousine-workspace/shared-types';
import { bookingDisplayCode } from '../booking-wizard/booking-display-code';
import { maskPhoneDisplay } from './phone-mask';

function statusBadge(status: BookingStatus) {
  const styles: Record<
    BookingStatus,
    { cls: string; label: string }
  > = {
    WAITING: {
      cls: 'bg-[#fef9c3] text-[#854d0e] ring-1 ring-amber-200/90',
      label: 'Đang chờ xe',
    },
    PICKED_UP: {
      cls: 'bg-[#e0f2fe] text-[#075985] ring-1 ring-sky-200/90',
      label: 'Đã lên xe',
    },
    DROPPED_OFF: {
      cls: 'bg-[#dcfce7] text-[#166534] ring-1 ring-emerald-200/90',
      label: 'Đã hoàn thành',
    },
    CANCELLED: {
      cls: 'bg-[#fee2e2] text-[#991b1b] ring-1 ring-red-200/80',
      label: 'Đã hủy',
    },
  };
  const s = styles[status];
  return (
    <span
      className={`inline-flex shrink-0 rounded-lg px-3 py-1.5 text-xs font-black sm:text-[13px] ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

function routeLine(b: Booking): string {
  const a = b.pickup_address?.split(',')[0]?.trim() || 'Điểm đón';
  const c = b.dropoff_address?.split(',')[0]?.trim() || 'Điểm trả';
  return `${a} → ${c}`;
}

function TicketIcon() {
  return (
    <svg
      className="mx-auto h-14 w-14 text-nova-gold"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 20h40v24H12V20z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M20 20v-4a4 4 0 014-4h16a4 4 0 014 4v4M20 44v4a4 4 0 004 4h16a4 4 0 004-4v-4"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M28 32h8M32 28v8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export type TicketResultsPanelProps = {
  searched: boolean;
  loading: boolean;
  rows: Booking[];
  /** SĐT vừa tra (để hiển thị dạng che). */
  queryPhone?: string;
  /** Lỗi mạng / API khi đã gửi tra cứu. */
  lookupError?: string | null;
  onRetryLookup?: () => void;
};

/** Thẻ phải — empty / danh sách vé (mockup). */
export function TicketResultsPanel({
  searched,
  loading,
  rows,
  queryPhone = '',
  lookupError = null,
  onRetryLookup,
}: TicketResultsPanelProps) {
  const masked = queryPhone.trim() ? maskPhoneDisplay(queryPhone) : '—';

  const innerEmpty = (
    <div className="flex flex-col items-center justify-center rounded-xl bg-[#f1f5f9] px-6 py-14 sm:py-16">
      <TicketIcon />
      <p className="mt-5 text-center text-base font-black text-[#334155] sm:text-lg">
        Chưa có vé để hiển thị
      </p>
      <p className="mt-2 max-w-sm text-center text-sm leading-relaxed text-[#64748b]">
        Nhập SĐT và nhấn Tra cứu. Nếu không có vé, khu vực này giữ trống.
      </p>
    </div>
  );

  return (
    <div className="rounded-[18px] border border-[#e8e8e8] bg-white p-8 shadow-[0_8px_32px_rgba(0,0,0,0.18)] sm:rounded-[20px] sm:p-10">
      <h2 className="text-lg font-black text-[#1e293b] sm:text-xl">
        {searched
          ? `Kết quả tra cứu (${masked})`
          : 'Kết quả tra cứu'}
      </h2>
      <p className="mt-1 text-sm font-medium text-[#94a3b8]">
        {!searched
          ? 'Danh sách vé xuất hiện tại đây sau khi tra cứu.'
          : `${rows.length} vé · ${rows.length > 0 ? 'có dữ liệu' : 'không có dữ liệu'}`}
      </p>

      <div className="mt-6">
        {loading ? (
          <div className="rounded-xl bg-[#f1f5f9] py-14 text-center text-sm font-semibold text-[#64748b]">
            Đang tra cứu…
          </div>
        ) : lookupError ? (
          <Alert
            type="error"
            showIcon
            message="Lỗi tra cứu"
            description={lookupError}
            action={
              onRetryLookup ? (
                <Button size="small" type="primary" onClick={onRetryLookup}>
                  Thử lại
                </Button>
              ) : undefined
            }
          />
        ) : !searched ? (
          innerEmpty
        ) : rows.length === 0 ? (
          <div className="rounded-xl bg-[#f1f5f9] px-6 py-12 text-center">
            <p className="text-base font-black text-[#334155]">
              Không tìm thấy vé với SĐT này
            </p>
            <p className="mt-2 text-sm text-[#64748b]">
              Kiểm tra lại số điện thoại đã dùng khi đặt vé.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((b) => (
              <li
                key={b.id}
                className="flex flex-col gap-4 rounded-xl border border-[#e2e8f0] bg-[#fafafa] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:p-5"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm font-black text-[#0a0e1a] sm:text-base">
                    {bookingDisplayCode(b.id)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#475569]">
                    {routeLine(b)}
                  </p>
                  <p className="mt-1 text-xs font-medium text-[#94a3b8] sm:hidden">
                    Ghế {b.seat_label ?? '—'}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-0.5 sm:min-w-[132px] sm:text-center">
                  <span className="text-sm font-semibold text-[#64748b]">—</span>
                  <span className="text-lg font-black leading-tight text-[#0a0e1a] sm:text-xl">
                    {(b.total_amount ?? b.unit_price ?? 0).toLocaleString('vi-VN')}{' '}
                    đ
                  </span>
                  <span className="hidden text-xs font-medium text-[#94a3b8] sm:block">
                    Ghế {b.seat_label ?? '—'}
                  </span>
                </div>
                <div className="flex shrink-0 justify-start sm:justify-end sm:pl-1">
                  {statusBadge(b.status)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
