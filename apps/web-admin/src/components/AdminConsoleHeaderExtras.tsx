'use client';

import React from 'react';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

/**
 * Ảnh 2 pen: pill ngày (viền gray-800, icon + chữ trắng) + pill user nền #111827, chấm xanh, Admin Nova đậm.
 */
export function AdminConsoleHeaderExtras() {
  const today = dayjs().format('DD/MM/YYYY');
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 md:gap-3">
      <div
        className={[
          'inline-flex items-center gap-2 rounded-full',
          'border border-white/10 bg-white/5 px-4 py-1.5',
          'text-[12px] font-medium text-white',
          'backdrop-blur',
        ].join(' ')}
        role="status"
        aria-label={`Hôm nay ${today}`}
      >
        <CalendarOutlined className="text-[15px] text-white" aria-hidden />
        <span>Hôm nay · {today}</span>
      </div>
      <div
        className={[
          'inline-flex items-center gap-2 rounded-full',
          'border border-white/10 bg-[#111827]/90 py-1.5 pl-2 pr-4',
          'text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur',
        ].join(' ')}
      >
        <span className="relative size-8 shrink-0" aria-hidden>
          <span className="absolute inset-0 rounded-full bg-blue-600 ring-1 ring-white/10" />
          <span className="absolute bottom-0.5 right-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-[#111827]" />
        </span>
        <span className="text-[12px] font-bold text-white">Admin Nova</span>
      </div>
    </div>
  );
}
