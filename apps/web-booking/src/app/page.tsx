'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Row,
  Select,
  Typography,
} from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/vi';
import type { TripBatch } from '@limousine-workspace/shared-types';
import { getApiBaseUrl } from '../lib/api';
import { PageSection } from '../components/blocks/PageSection';
import { BookingPageScaffold } from '../components/layout/BookingPageScaffold';
import { PEN_BG, PEN_OVERLAY } from '../lib/booking-pen-assets';

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
      {/* Frame sMJzD — Trang Chủ: Hero + (dưới) Featured */}
      <BookingPageScaffold
        bgSrc={PEN_BG.homeHero}
        overlayClassName={PEN_OVERLAY.homeHero}
        minHeight="min-h-[480px] md:min-h-[560px]"
        priority
      >
        <PageSection className="flex flex-col items-center py-12 text-center sm:py-16 md:py-24">
          <Typography.Title
            level={1}
            className="!mb-2 !text-3xl !font-black !text-white sm:!text-4xl md:!text-5xl"
          >
            Hành trình đẳng cấp
          </Typography.Title>
          <Typography.Title
            level={2}
            className="!mt-0 !mb-4 !text-2xl !font-black !text-[#D4AF37] sm:!text-3xl md:!text-4xl"
          >
            Trải nghiệm tiên phong
          </Typography.Title>
          <Typography.Paragraph className="!mb-8 max-w-2xl text-sm font-semibold text-[#E8EAEF] sm:!mb-10 sm:text-base">
            NovaLimo — limousine nội địa, tiêu chuẩn quốc tế. Đặt vé nhanh,
            chọn ghế trực quan, đón trả tận nơi.
          </Typography.Paragraph>

          <Card
            className="w-full max-w-3xl border border-[#E5E7EB] text-left shadow-lg"
            classNames={{
              body: '!px-4 !py-4 sm:!px-6 sm:!py-6 md:!px-7 md:!py-7',
            }}
          >
            <Typography.Title level={4} className="!mt-0 !text-[#0B1020]">
              Tìm chuyến
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="!mb-6">
              Chọn tuyến và ngày khởi hành — hiển thị khung giờ còn mở vé.
            </Typography.Paragraph>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={10}>
                <Typography.Text className="mb-1 block text-sm font-bold text-[#0B1020]">
                  Tuyến
                </Typography.Text>
                <Select
                  className="w-full"
                  size="large"
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
                <Typography.Text className="mb-1 block text-sm font-bold text-[#0B1020]">
                  Ngày đi
                </Typography.Text>
                <DatePicker
                  className="w-full"
                  size="large"
                  value={date}
                  onChange={(d) => d && setDate(d)}
                  format="DD/MM/YYYY"
                  disabledDate={(current) =>
                    current ? current < dayjs().startOf('day') : false
                  }
                />
              </Col>
              <Col xs={24} md={4} className="flex items-end">
                <Button
                  type="primary"
                  size="large"
                  block
                  className="!h-12 !border-0 !bg-[#D4AF37] !font-black !text-[#0B1020] hover:!bg-[#c9a85c]"
                  disabled={!routeName}
                  onClick={onSearch}
                >
                  Tìm chuyến
                </Button>
              </Col>
            </Row>
          </Card>
        </PageSection>
      </BookingPageScaffold>

      <PageSection className="bg-slate-50">
        <Typography.Title level={3} className="!text-[#0B1020]">
          Dịch vụ
        </Typography.Title>
        <Row gutter={[20, 20]} className="mt-6">
          <Col xs={24} md={8}>
            <Card
              size="small"
              className="h-full border-[#E5E7EB] shadow-sm"
              title={<span className="font-black text-[#0B1020]">Đón tận nơi</span>}
            >
              <span className="text-[#616167]">
                Xác định điểm đón/trả trên bản đồ, tối ưu lộ trình.
              </span>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              size="small"
              className="h-full border-[#E5E7EB] shadow-sm"
              title={<span className="font-black text-[#0B1020]">Ghế VIP</span>}
            >
              <span className="text-[#616167]">
                Chọn ghế trực quan — ghế trước có phụ phí theo vị trí.
              </span>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              size="small"
              className="h-full border-[#E5E7EB] shadow-sm"
              title={
                <span className="font-black text-[#0B1020]">Thanh toán linh hoạt</span>
              }
            >
              <span className="text-[#616167]">
                COD, ví điện tử hoặc thẻ (theo cấu hình cổng).
              </span>
            </Card>
          </Col>
        </Row>
      </PageSection>
    </div>
  );
}
