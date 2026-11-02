'use client';

import React, { useState } from 'react';
import { Form, Typography } from 'antd';
import type { Booking } from '@limousine-workspace/shared-types';
import { getApiBaseUrl } from '../../lib/api';
import { BookingPageScaffold } from '../../components/layout/BookingPageScaffold';
import { TicketLookupForm } from '../../components/my-tickets/TicketLookupForm';
import { TicketResultsPanel } from '../../components/my-tickets/TicketResultsPanel';
import { PEN_BG, PEN_OVERLAY } from '../../lib/booking-pen-assets';

export default function MyTicketsPage() {
  const [form] = Form.useForm<{ phone: string }>();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Booking[]>([]);
  const [searched, setSearched] = useState(false);
  const [lastQueryPhone, setLastQueryPhone] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);

  async function onSearch() {
    const { phone } = await form.validateFields();
    const trimmed = phone.trim();
    setLastQueryPhone(trimmed);
    setLoading(true);
    setSearched(true);
    setLookupError(null);
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/bookings?passenger_phone=${encodeURIComponent(trimmed)}`,
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as Booking[];
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
      setLookupError(
        'Không tra cứu được. Kiểm tra API (`nx serve api-server`) và `NEXT_PUBLIC_API_URL`.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-nova-bg">
      <BookingPageScaffold
        bgSrc={PEN_BG.myTickets}
        overlayClassName={PEN_OVERLAY.myTickets}
        minHeight="min-h-[560px]"
        className="pb-16 sm:pb-20"
      >
        <div className="mx-auto max-w-[1200px] px-4 pt-8 sm:pt-10 md:px-6 lg:px-8">
          <Typography.Title
            level={2}
            className="!mb-2 !text-2xl !font-black !tracking-tight !text-white sm:!text-3xl md:!text-4xl"
          >
            Tra cứu vé đã đặt
          </Typography.Title>
          <Typography.Paragraph className="!mb-0 max-w-3xl text-sm font-semibold leading-relaxed text-[#C8D4F0] sm:text-base">
            Nhập SĐT đặt vé · Kết quả hiển thị bên phải — chưa tra cứu thì để
            trống.
          </Typography.Paragraph>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:mt-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <TicketLookupForm
                form={form}
                loading={loading}
                onSubmit={onSearch}
              />
            </div>
            <div className="lg:col-span-7">
              <TicketResultsPanel
                searched={searched}
                loading={loading}
                rows={rows}
                queryPhone={lastQueryPhone}
                lookupError={lookupError}
                onRetryLookup={() => void onSearch()}
              />
            </div>
          </div>
        </div>
      </BookingPageScaffold>
    </div>
  );
}
