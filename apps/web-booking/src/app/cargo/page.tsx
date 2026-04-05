'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Card, Col, Row, Typography } from 'antd';
import { PageSection } from '../../components/blocks/PageSection';
import { BookingPageScaffold } from '../../components/layout/BookingPageScaffold';
import { PEN_BG, PEN_OVERLAY } from '../../lib/booking-pen-assets';

export default function CargoLandingPage() {
  return (
    <div>
      <BookingPageScaffold
        bgSrc={PEN_BG.cargoLanding}
        overlayClassName={PEN_OVERLAY.cargoLanding}
        minHeight="min-h-[420px] md:min-h-[520px]"
        priority
      >
        <PageSection className="py-12 text-center text-white sm:py-16 md:py-20">
          <Typography.Title
            level={1}
            className="!mb-4 !text-2xl !font-black !text-white sm:!text-3xl md:!text-4xl"
          >
            Ký gửi hàng cùng chuyến
          </Typography.Title>
          <Typography.Paragraph className="mx-auto max-w-2xl px-1 !text-sm !font-semibold !text-[#B2CCFF] sm:!text-base">
            Gửi kiện theo tuyến xe limousine — minh bạch phí, hỗ trợ COD, nhận/giao
            tại bến.
          </Typography.Paragraph>
          <Link href="/cargo/book">
            <Button
              type="primary"
              size="large"
              block
              className="mt-6 !h-[52px] max-w-md !rounded-[14px] !px-8 !font-black !text-[#0B1020] sm:!inline-block sm:!w-auto"
            >
              Ước tính / Đặt gửi hàng
            </Button>
          </Link>
          <Typography.Title
            level={4}
            className="!mt-14 !mb-3 !text-left !text-lg !font-black !text-white sm:!text-xl"
          >
            Quy trình gửi nhanh
          </Typography.Title>
          <Typography.Paragraph className="!text-left !text-sm !font-semibold !leading-relaxed !text-[#C9CDD8] sm:!text-base">
            1) Chọn tuyến &amp; ngày → 2) Nhập loại kiện &amp; khối lượng → 3) Xem báo
            giá → 4) Xác nhận &amp; mang hàng ra bến theo mã vận đơn.
          </Typography.Paragraph>
        </PageSection>
      </BookingPageScaffold>

      <PageSection className="bg-slate-50">
        <Typography.Title level={3} className="!text-[#0B1020]">
          Vì sao chọn NovaLimo Cargo
        </Typography.Title>
        <Row gutter={[20, 20]} className="mt-6">
          <Col xs={24} md={8}>
            <Card
              className="h-full border-[#E5E7EB] shadow-sm"
              title="Kích thước & trọng lượng"
            >
              <span className="text-[#616167]">
                Tối đa theo khung kiện chuẩn. Vượt khung sẽ báo phụ phí trước khi xác
                nhận.
              </span>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="h-full border-[#E5E7EB] shadow-sm" title="COD & giá trị hàng">
              <span className="text-[#616167]">
                Thu hộ COD theo thỏa thuận. Khai báo giá trị để áp dụng điều kiện bảo
                quản phù hợp.
              </span>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="h-full border-[#E5E7EB] shadow-sm" title="Nhận / giao tại bến">
              <span className="text-[#616167]">
                Điểm giao nhận rõ ràng. Hàng dễ vỡ hoặc cấm gửi được cảnh báo trên báo
                giá.
              </span>
            </Card>
          </Col>
        </Row>
      </PageSection>
    </div>
  );
}
