'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Carousel,
  Col,
  DatePicker,
  Row,
  Select,
  Space,
  Typography,
} from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/vi';
import type { TripBatch } from '@limousine-workspace/shared-types';
import { getApiBaseUrl } from '../lib/api';

dayjs.locale('vi');

export default function HomePage() {
  const router = useRouter();
  const apiUrl = getApiBaseUrl();
  const [batches, setBatches] = useState<TripBatch[]>([]);
  const [routeName, setRouteName] = useState<string>();
  const [date, setDate] = useState<Dayjs>(() => dayjs());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${apiUrl}/trip-batches`);
        if (!res.ok) throw new Error('load');
        const data = (await res.json()) as TripBatch[];
        if (!cancelled) {
          setBatches(data);
          const routes = [...new Set(data.map((b) => b.route_name))];
          if (routes[0]) setRouteName(routes[0]);
        }
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

  const routeOptions = useMemo(() => {
    const names = [...new Set(batches.map((b) => b.route_name))];
    return names.map((r) => ({ value: r, label: r }));
  }, [batches]);

  function onSearch() {
    if (!routeName || !date) return;
    const q = new URLSearchParams({
      route: routeName,
      date: date.format('YYYY-MM-DD'),
    });
    router.push(`/search?${q.toString()}`);
  }

  return (
    <div>
      <Carousel autoplay className="overflow-hidden rounded-b-2xl text-white">
        <div>
          <div className="flex min-h-[220px] flex-col justify-center bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] px-6 py-12 md:min-h-[280px] md:px-16">
            <Typography.Title level={2} className="!mb-2 !text-white">
              NovaLimo
            </Typography.Title>
            <Typography.Paragraph className="!mb-0 max-w-xl text-slate-200">
              Đặt vé limousine sang trọng — đón trả tận nơi, trải nghiệm VIP.
            </Typography.Paragraph>
          </div>
        </div>
        <div>
          <div className="flex min-h-[220px] flex-col justify-center bg-gradient-to-br from-[#1e293b] to-[#c9a227] px-6 py-12 md:min-h-[280px] md:px-16">
            <Typography.Title level={3} className="!mb-2 !text-white">
              Khuyến mãi mùa hè
            </Typography.Title>
            <Typography.Paragraph className="!mb-0 max-w-xl text-slate-100">
              Ưu đãi cho nhóm khách đặt sớm — xem khung giờ trong mục Tìm chuyến.
            </Typography.Paragraph>
          </div>
        </div>
      </Carousel>

      <div className="mx-auto max-w-4xl px-4 py-10">
        <Card className="shadow-md">
          <Typography.Title level={4} className="!mt-0">
            Tìm chuyến
          </Typography.Title>
          <Typography.Paragraph type="secondary">
            Chọn tuyến và ngày khởi hành — hiển thị khung giờ còn mở vé.
          </Typography.Paragraph>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={10}>
              <Typography.Text className="mb-1 block text-sm">Tuyến</Typography.Text>
              <Select
                className="w-full"
                loading={loading}
                options={routeOptions}
                value={routeName}
                placeholder="Chọn tuyến"
                onChange={setRouteName}
                showSearch
                optionFilterProp="label"
              />
            </Col>
            <Col xs={24} md={10}>
              <Typography.Text className="mb-1 block text-sm">
                Ngày đi
              </Typography.Text>
              <DatePicker
                className="w-full"
                value={date}
                onChange={(d) => d && setDate(d)}
                format="DD/MM/YYYY"
                disabledDate={(current) =>
                  current && current < dayjs().startOf('day')
                }
              />
            </Col>
            <Col xs={24} md={4} className="flex items-end">
              <Button
                type="primary"
                size="large"
                block
                className="!bg-[#c9a227] !border-[#c9a227] hover:!bg-[#d4af37]"
                disabled={!routeName}
                onClick={onSearch}
              >
                Tìm chuyến
              </Button>
            </Col>
          </Row>
        </Card>

        <Space direction="vertical" size="large" className="mt-10 w-full">
          <Typography.Title level={4}>Dịch vụ</Typography.Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small" title="Đón tận nơi">
                Xác định điểm đón/trả trên bản đồ, tối ưu lộ trình.
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" title="Ghế VIP">
                Chọn ghế trực quan — ghế trước có phụ phí theo vị trí.
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" title="Thanh toán linh hoạt">
                COD, ví điện tử hoặc thẻ (theo cấu hình cổng).
              </Card>
            </Col>
          </Row>
        </Space>
      </div>
    </div>
  );
}
