'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PageSection } from '../../components/blocks/PageSection';
import { PricePolicyNote } from '../../components/pricing/PricePolicyNote';
import { PricingHeroSection } from '../../components/pricing/PricingHeroSection';
import { PEN_BG } from '../../lib/booking-pen-assets';

type SeatKind = 'vip' | 'edge';

type PriceRow = {
  key: string;
  vehicle: string;
  seatKind: SeatKind;
  seatLabel: string;
  price: number;
  note: string;
};

const ROUTES: {
  id: string;
  tabLabel: string;
  viewerLine: string;
  rows: PriceRow[];
}[] = [
  {
    id: 'hn-qn',
    tabLabel: 'Hà Nội — Quảng Ninh',
    viewerLine: 'Đang xem — Hà Nội ⇄ Quảng Ninh',
    rows: [
      {
        key: '1',
        vehicle: 'Limousine 9 chỗ',
        seatKind: 'vip',
        seatLabel: 'Ghế VIP (Giữa)',
        price: 300000,
        note: 'Ghế giữa dãy — ưu tiên không gian rộng, phù hợp hành khách cần chỗ ngồi thoải mái.',
      },
      {
        key: '2',
        vehicle: 'Limousine 9 chỗ',
        seatKind: 'edge',
        seatLabel: 'Ghế Đầu / Cuối',
        price: 280000,
        note: 'Hàng ghế đầu hoặc cuối — lối đi thuận tiện, phù hợp di chuyển ngắn.',
      },
      {
        key: '3',
        vehicle: 'Limousine 12 chỗ',
        seatKind: 'vip',
        seatLabel: 'Ghế VIP (Giữa)',
        price: 340000,
        note: 'Khoang rộng — phù hợp gia đình / doanh nhân cần không gian riêng tư.',
      },
      {
        key: '4',
        vehicle: 'Limousine 12 chỗ',
        seatKind: 'edge',
        seatLabel: 'Ghế Đầu / Cuối',
        price: 320000,
        note: 'Phù hợp đoàn nhỏ — giá cố định theo vị trí ghế trên sơ đồ.',
      },
    ],
  },
  {
    id: 'hn-sp',
    tabLabel: 'Hà Nội — Sapa',
    viewerLine: 'Đang xem — Hà Nội ⇄ Sapa',
    rows: [
      {
        key: 's1',
        vehicle: 'Limousine 9 chỗ',
        seatKind: 'vip',
        seatLabel: 'Ghế VIP (Giữa)',
        price: 380000,
        note: 'Tuyến đèo dài — ghế VIP trang bị massage nhẹ, không gian chỗ để chân rộng.',
      },
      {
        key: 's2',
        vehicle: 'Limousine 12 chỗ',
        seatKind: 'edge',
        seatLabel: 'Ghế Đầu / Cuối',
        price: 360000,
        note: 'Ổn định trên cung đường dốc — phù hợp hành khách dễ say xe.',
      },
    ],
  },
  {
    id: 'hn-hp',
    tabLabel: 'Hà Nội — Hải Phòng',
    viewerLine: 'Đang xem — Hà Nội ⇄ Hải Phòng',
    rows: [
      {
        key: 'h1',
        vehicle: 'Limousine 9 chỗ',
        seatKind: 'vip',
        seatLabel: 'Ghế VIP (Giữa)',
        price: 290000,
        note: 'Tuyến ngắn — ghế VIP ưu tiên yên tĩnh và cổng sạc đầy đủ.',
      },
      {
        key: 'h2',
        vehicle: 'Limousine 12 chỗ',
        seatKind: 'edge',
        seatLabel: 'Ghế Đầu / Cuối',
        price: 270000,
        note: 'Giờ chạy linh hoạt — phù hợp công tác / về quê nhanh.',
      },
    ],
  },
];

function SeatBadge({ kind, label }: { kind: SeatKind; label: string }) {
  const cls =
    kind === 'vip'
      ? 'bg-[#fef3c7] text-[#92400e] ring-1 ring-amber-200/80'
      : 'bg-[#e0f2fe] text-[#075985] ring-1 ring-sky-200/80';
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-bold sm:text-[13px] ${cls}`}
    >
      {label}
    </span>
  );
}

export default function PricingPage() {
  const [activeId, setActiveId] = useState(ROUTES[0].id);
  const active = useMemo(
    () => ROUTES.find((r) => r.id === activeId) ?? ROUTES[0],
    [activeId],
  );

  const columns: ColumnsType<PriceRow> = [
    {
      title: 'Loại xe',
      dataIndex: 'vehicle',
      key: 'vehicle',
      width: '22%',
      render: (v: string) => (
        <span className="font-bold text-[#0a0e1a]">{v}</span>
      ),
    },
    {
      title: 'Vị trí ghế',
      dataIndex: 'seatLabel',
      key: 'seat',
      width: '24%',
      render: (_: string, row) => (
        <SeatBadge kind={row.seatKind} label={row.seatLabel} />
      ),
    },
    {
      title: 'Mức giá',
      dataIndex: 'price',
      key: 'price',
      width: '18%',
      render: (p: number) => (
        <span className="text-base font-black text-[#0a0e1a] sm:text-lg">
          {p.toLocaleString('vi-VN')} đ
        </span>
      ),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (t: string) => (
        <span className="text-[13px] leading-relaxed text-[#475569] sm:text-sm">
          {t}
        </span>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#0B121E]">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <Image
          src={PEN_BG.pricing}
          alt=""
          fill
          className="object-cover opacity-[0.22]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#0B121E]/90" aria-hidden />
      </div>

      <div className="relative z-10">
        <PricingHeroSection />

        <PageSection className="pb-16 pt-2 md:pt-4">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-6 flex flex-wrap gap-2 sm:mb-8 sm:gap-3">
              {ROUTES.map((r) => {
                const on = r.id === activeId;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setActiveId(r.id)}
                    className={`rounded-xl border px-4 py-2.5 text-xs font-black transition-colors sm:px-5 sm:py-3 sm:text-sm ${
                      on
                        ? 'border-nova-gold bg-nova-gold text-nova-bg shadow-[0_4px_20px_rgba(234,179,8,0.35)]'
                        : 'border-white/15 bg-[#111a2a] text-white hover:border-white/25 hover:bg-[#162032]'
                    }`}
                  >
                    {r.tabLabel}
                  </button>
                );
              })}
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10 bg-white shadow-[0_16px_48px_rgba(0,0,0,0.35)] sm:rounded-2xl">
              <div className="border-b border-[#e8dfd0] bg-[#f5f0e6] px-4 py-3 text-sm font-bold text-[#3d3428] sm:px-6 sm:py-3.5 sm:text-[15px]">
                <span className="mr-2" aria-hidden>
                  ℹ️
                </span>
                {active.viewerLine}
              </div>
              <Table<PriceRow>
                size="middle"
                pagination={false}
                columns={columns}
                dataSource={active.rows}
                rowKey="key"
                scroll={{ x: 640 }}
                className="pricing-route-table [&_.ant-table]:!bg-white [&_.ant-table-thead>tr>th]:!border-b-[#e5e7eb] [&_.ant-table-thead>tr>th]:!bg-[#faf8f5] [&_.ant-table-thead>tr>th]:!py-4 [&_.ant-table-thead>tr>th]:!text-xs [&_.ant-table-thead>tr>th]:!font-black [&_.ant-table-thead>tr>th]:!uppercase [&_.ant-table-thead>tr>th]:!tracking-wide [&_.ant-table-thead>tr>th]:!text-[#64748b] [&_.ant-table-tbody>tr>td]:!py-4 [&_.ant-table-tbody>tr>td]:!align-top"
                rowClassName={(_, index) =>
                  index % 2 === 1 ? '!bg-[#fafafa]' : '!bg-white'
                }
              />
            </div>

            <PricePolicyNote />
          </div>
        </PageSection>
      </div>
    </div>
  );
}
