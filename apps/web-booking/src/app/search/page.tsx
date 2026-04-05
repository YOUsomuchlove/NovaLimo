'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Drawer,
  Empty,
  Row,
  Slider,
  Space,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import type { TripBatch } from '@limousine-workspace/shared-types';
import { getApiBaseUrl } from '../../lib/api';
import { PageSection } from '../../components/blocks/PageSection';
import { BookingPageScaffold } from '../../components/layout/BookingPageScaffold';
import { PEN_BG, PEN_OVERLAY } from '../../lib/booking-pen-assets';

const HOUR_PRESETS: { label: string; value: [number, number] }[] = [
  { label: 'Sáng (6–12h)', value: [6, 12] },
  { label: 'Chiều (12–18h)', value: [12, 18] },
  { label: 'Tối (18–22h)', value: [18, 22] },
];

function SearchPageInner() {
  const searchParams = useSearchParams();
  const route = searchParams.get('route') ?? '';
  const dateStr = searchParams.get('date') ?? dayjs().format('YYYY-MM-DD');
  const apiUrl = getApiBaseUrl();

  const [batches, setBatches] = useState<TripBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [hourFilter, setHourFilter] = useState<[number, number]>([0, 24]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 800000]);
  const [presetHours, setPresetHours] = useState<string[]>([]);
  const [drawerBatch, setDrawerBatch] = useState<TripBatch | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${apiUrl}/trip-batches`);
        if (!res.ok) throw new Error('load');
        const data = (await res.json()) as TripBatch[];
        if (!cancelled) setBatches(data);
      } catch {
        if (!cancelled) setBatches([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiUrl]);

  const filtered = useMemo(() => {
    return batches.filter((b) => {
      if (route && b.route_name !== route) return false;
      const d = dayjs(b.departure_time);
      if (!d.isSame(dayjs(dateStr), 'day')) return false;
      const h = d.hour() + d.minute() / 60;
      if (h < hourFilter[0] || h > hourFilter[1]) return false;
      const mockPrice = 350000 + (d.hour() % 5) * 10000;
      if (mockPrice < priceRange[0] || mockPrice > priceRange[1]) return false;
      return b.status === 'OPEN';
    });
  }, [batches, route, dateStr, hourFilter, priceRange]);

  function applyPresetHours(values: string[]) {
    setPresetHours(values);
    if (values.length === 0) {
      setHourFilter([0, 24]);
      return;
    }
    const ranges = HOUR_PRESETS.filter((p) => values.includes(p.label)).map(
      (p) => p.value,
    );
    const min = Math.min(...ranges.map((r) => r[0]));
    const max = Math.max(...ranges.map((r) => r[1]));
    setHourFilter([min, max]);
  }

  return (
    <div className="bg-[#0B1020]">
      {/* Frame Kl9cQ — nền ảnh + overlay; Drawer (Mở hé) khi xem nhanh */}
      <BookingPageScaffold
        bgSrc={PEN_BG.searchResults}
        overlayClassName={PEN_OVERLAY.search}
        minHeight="min-h-[240px]"
      >
        <PageSection className="!py-8 sm:!py-10">
          <Typography.Title
            level={2}
            className="!mb-2 !text-2xl !font-black !text-white sm:!text-3xl md:!text-4xl"
          >
            Kết quả tìm kiếm chuyến xe
          </Typography.Title>
          <Typography.Paragraph className="!mb-0 text-sm font-semibold text-[#B2CCFF] sm:text-base">
            {route ? `Tuyến: ${route}` : 'Tất cả tuyến'} · Ngày{' '}
            {dayjs(dateStr).format('DD/MM/YYYY')}
          </Typography.Paragraph>
        </PageSection>
      </BookingPageScaffold>

      <PageSection className="bg-[#0B1020] pb-16 pt-2 sm:pt-4">
        <Typography.Title
          level={4}
          className="!mb-1 !text-base !text-white sm:!text-lg md:!text-xl"
        >
          Chuyến phù hợp
        </Typography.Title>
        <Typography.Paragraph className="!mb-8 text-[#C8D4F0]">
          Lọc theo khung giờ và mức giá (demo).
        </Typography.Paragraph>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={7} className="min-w-0">
            <Card
              title={
                <span className="font-black text-[#0B1020]">Bộ lọc</span>
              }
              size="small"
              loading={loading}
              className="border-[#E5E7EB] shadow-sm"
            >
              <Typography.Text strong>Khung giờ</Typography.Text>
              <Checkbox.Group
                className="mt-2 flex flex-col gap-2"
                value={presetHours}
                onChange={applyPresetHours}
                options={HOUR_PRESETS.map((p) => ({
                  label: p.label,
                  value: p.label,
                }))}
              />
              <Typography.Text strong className="mb-2 mt-4 block">
                Giờ (chi tiết)
              </Typography.Text>
              <Slider
                range
                min={0}
                max={24}
                step={0.5}
                value={hourFilter}
                onChange={(v) => setHourFilter(v as [number, number])}
              />
              <Typography.Text strong className="mb-2 mt-4 block">
                Giá (₫) — demo
              </Typography.Text>
              <Slider
                range
                min={0}
                max={800000}
                step={10000}
                value={priceRange}
                onChange={(v) => setPriceRange(v as [number, number])}
                tooltip={{
                  formatter: (v) => `${(v ?? 0).toLocaleString('vi-VN')} ₫`,
                }}
              />
            </Card>
          </Col>

          <Col xs={24} md={17}>
            <Space direction="vertical" size="middle" className="w-full">
              {filtered.length === 0 && !loading ? (
                <Empty
                  className="rounded-lg border border-[#2B283D] bg-[#0B1020]/60 py-12"
                  description={
                    <span className="text-[#B2CCFF]">
                      Không có chuyến phù hợp
                    </span>
                  }
                />
              ) : null}
              {filtered.map((b) => {
                const dep = dayjs(b.departure_time);
                const mockPrice = 350000 + (dep.hour() % 5) * 10000;
                const capacity = 9 + (b.id.charCodeAt(0) % 2) * 3;
                return (
                  <Card
                    key={b.id}
                    size="small"
                    className="border-[#E5E7EB] shadow-sm"
                    title={
                      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <Space wrap size="small">
                          <span className="font-bold">{dep.format('HH:mm')}</span>
                          <Tag color="blue">{b.route_name}</Tag>
                          <Tag>{b.status}</Tag>
                        </Space>
                        <Typography.Text
                          strong
                          className="shrink-0 text-base text-[#D4AF37] sm:text-right"
                        >
                          từ {mockPrice.toLocaleString('vi-VN')} ₫
                        </Typography.Text>
                      </div>
                    }
                  >
                    <Typography.Paragraph type="secondary" className="!mb-3">
                      Xe {capacity} chỗ · Còn chỗ (demo giá theo giờ)
                    </Typography.Paragraph>
                    <Space wrap>
                      <Button
                        type="default"
                        className="border-[#2B283D] !text-[#0B1020]"
                        onClick={() => setDrawerBatch(b)}
                      >
                        Xem nhanh (mở hé)
                      </Button>
                      <Link
                        href={`/booking/${b.id}?capacity=${capacity}&price=${mockPrice}`}
                      >
                        <Button
                          type="primary"
                          className="!bg-[#D4AF37] !font-black !text-[#0B1020] hover:!bg-[#c9a85c]"
                        >
                          Chọn chuyến
                        </Button>
                      </Link>
                    </Space>
                  </Card>
                );
              })}
            </Space>
          </Col>
        </Row>
      </PageSection>

      <Drawer
        title={<span className="font-black text-[#0B1020]">Chi tiết chuyến</span>}
        placement="right"
        width={360}
        open={drawerBatch !== null}
        onClose={() => setDrawerBatch(null)}
        styles={{
          body: { background: '#0B1020', padding: 20 },
          header: { background: '#0B1020', borderBottom: '1px solid #2B283D' },
        }}
        className="[&_.ant-drawer-title]:!text-white"
      >
        {drawerBatch ? (
          <div className="text-[#E8EAEF]">
            <p className="text-lg font-black text-[#D4AF37]">
              {dayjs(drawerBatch.departure_time).format('HH:mm')}
            </p>
            <p className="mt-2 font-semibold text-white">{drawerBatch.route_name}</p>
            <p className="mt-2 text-sm text-[#B2CCFF]">Trạng thái: {drawerBatch.status}</p>
            <Link
              href={`/booking/${drawerBatch.id}?capacity=${9 + (drawerBatch.id.charCodeAt(0) % 2) * 3}&price=${350000 + (dayjs(drawerBatch.departure_time).hour() % 5) * 10000}`}
              onClick={() => setDrawerBatch(null)}
            >
              <Button
                type="primary"
                block
                className="mt-6 !bg-[#D4AF37] !font-black !text-[#0B1020]"
              >
                Đặt vé chuyến này
              </Button>
            </Link>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-600">Đang tải…</div>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}
