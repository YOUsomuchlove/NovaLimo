'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Button,
  Card,
  Checkbox,
  Col,
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
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Typography.Title level={3} className="!mb-1">
        Chuyến phù hợp
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        {route ? `Tuyến: ${route}` : 'Tất cả tuyến'} · Ngày{' '}
        {dayjs(dateStr).format('DD/MM/YYYY')}
      </Typography.Paragraph>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={7}>
          <Card title="Bộ lọc" size="small" loading={loading}>
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
              tooltip={{ formatter: (v) => `${(v ?? 0).toLocaleString('vi-VN')} ₫` }}
            />
          </Card>
        </Col>

        <Col xs={24} md={17}>
          <Space direction="vertical" size="middle" className="w-full">
            {filtered.length === 0 && !loading ? (
              <Empty description="Không có chuyến phù hợp" />
            ) : null}
            {filtered.map((b) => {
              const dep = dayjs(b.departure_time);
              const mockPrice = 350000 + (dep.hour() % 5) * 10000;
              const capacity = 9 + (b.id.charCodeAt(0) % 2) * 3; // 9 hoặc 12 demo
              return (
                <Card
                  key={b.id}
                  size="small"
                  title={
                    <Space wrap>
                      <span>{dep.format('HH:mm')}</span>
                      <Tag color="blue">{b.route_name}</Tag>
                      <Tag>{b.status}</Tag>
                    </Space>
                  }
                  extra={
                    <Typography.Text strong className="text-[#c9a227]">
                      từ {mockPrice.toLocaleString('vi-VN')} ₫
                    </Typography.Text>
                  }
                >
                  <Typography.Paragraph type="secondary" className="!mb-3">
                    Xe {capacity} chỗ · Còn chỗ (demo giá theo giờ)
                  </Typography.Paragraph>
                  <Link
                    href={`/booking/${b.id}?capacity=${capacity}&price=${mockPrice}`}
                  >
                    <Button type="primary">Chọn chuyến</Button>
                  </Link>
                </Card>
              );
            })}
          </Space>
        </Col>
      </Row>
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
