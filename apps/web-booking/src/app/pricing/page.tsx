'use client';

import React, { useState } from 'react';
import { Alert, Card, Table, Tabs, Typography } from 'antd';
import { PageSection } from '../../components/blocks/PageSection';
import { BookingPageScaffold } from '../../components/layout/BookingPageScaffold';
import { PEN_BG, PEN_OVERLAY } from '../../lib/booking-pen-assets';

const columns = [
  { title: 'Khung giờ', dataIndex: 'slot', key: 'slot' },
  {
    title: 'Giá một chiều (từ)',
    dataIndex: 'price',
    key: 'price',
    render: (p: number) => (
      <span className="font-black text-[#D4AF37]">{p.toLocaleString('vi-VN')} ₫</span>
    ),
  },
  { title: 'Ghi chú', dataIndex: 'note', key: 'note' },
];

const DATA: Record<string, { slot: string; price: number; note: string }[]> = {
  'HN — HP': [
    { slot: '06:00 – 09:00', price: 350000, note: 'Cao điểm sáng' },
    { slot: '09:00 – 16:00', price: 330000, note: 'Giờ thường' },
    { slot: '16:00 – 22:00', price: 370000, note: 'Cao điểm chiều' },
  ],
  'HN — NB': [
    { slot: '06:00 – 22:00', price: 280000, note: 'Demo' },
    { slot: 'Ưu đãi cuối tuần', price: 260000, note: 'Theo chính sách' },
  ],
};

export default function PricingPage() {
  const [tab, setTab] = useState('HN — HP');

  return (
    <div className="bg-[#0B1020]">
      <BookingPageScaffold
        bgSrc={PEN_BG.pricing}
        overlayClassName={PEN_OVERLAY.pricing}
        minHeight="min-h-[260px]"
      >
        <PageSection className="!py-8 sm:!py-10">
          <Typography.Title
            level={2}
            className="!mb-2 !text-2xl !font-black tracking-tight !text-white sm:!text-3xl md:!text-4xl"
          >
            Bảng giá tuyến đường
          </Typography.Title>
          <Typography.Paragraph className="!mb-0 text-sm font-semibold text-[#C8D4F0] sm:text-base">
            Niêm yết theo tuyến · Giá một chiều · Chọn tab để xem từng tuyến.
          </Typography.Paragraph>
        </PageSection>
      </BookingPageScaffold>

      <PageSection className="bg-[#0B1020] pb-16 pt-2">
        <Tabs
          activeKey={tab}
          onChange={setTab}
          items={['HN — HP', 'HN — NB'].map((k) => ({
            key: k,
            label: k,
            children: null,
          }))}
          className="pricing-tabs [&_.ant-tabs-nav]:mb-6 [&_.ant-tabs-nav]:rounded-[14px] [&_.ant-tabs-nav]:border [&_.ant-tabs-nav]:border-[#FFFFFF18] [&_.ant-tabs-nav]:bg-[#0D1528] [&_.ant-tabs-nav]:p-1 [&_.ant-tabs-tab]:!text-[#E8EAEF] [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-[#D4AF37]"
        />
        <Card className="overflow-hidden rounded-[20px] border-[#E8E8E8] shadow-xl">
          <Table
            size="middle"
            pagination={false}
            columns={columns}
            dataSource={DATA[tab] ?? []}
            rowKey="slot"
          />
        </Card>
        <Alert
          className="mt-6 border-[#E8D4A0] bg-[#FFF9E8] text-[#0B1020]"
          message="Chính sách giá"
          description="Giá vé có thể thay đổi theo ngày lễ và vị trí ghế — giá thực tế khi chọn chuyến là chính xác nhất."
          type="warning"
          showIcon
        />
      </PageSection>
    </div>
  );
}
