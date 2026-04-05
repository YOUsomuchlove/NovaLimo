'use client';

import React from 'react';
import { Card, Col, Row, Typography } from 'antd';
import { PageSection } from '../../components/blocks/PageSection';
import { BookingPageScaffold } from '../../components/layout/BookingPageScaffold';
import { PEN_BG, PEN_OVERLAY } from '../../lib/booking-pen-assets';

export default function AboutPage() {
  return (
    <div className="bg-[#0B1020]">
      <BookingPageScaffold
        bgSrc={PEN_BG.aboutHero}
        overlayClassName={PEN_OVERLAY.about}
        minHeight="min-h-[480px] md:min-h-[560px]"
        priority
      >
        <div className="relative mx-auto max-w-[1440px] px-4 pb-10 pt-10 sm:px-6 md:px-12 md:pb-14 lg:px-16">
          <Typography.Title
            level={2}
            className="!mb-10 !text-center !text-2xl !font-black !text-white md:!text-left md:!text-4xl"
          >
            Trang Giới thiệu (About Us)
          </Typography.Title>
          <Row gutter={[28, 28]} className="mt-4 md:mt-8">
            <Col xs={24} md={8}>
              <div className="text-center md:text-left">
                <Typography.Text className="text-3xl font-black text-[#D4AF37]">
                  15+
                </Typography.Text>
                <p className="mt-1 text-sm font-semibold text-[#B8BCC8]">Tuyến cố định</p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="text-center md:text-left">
                <Typography.Text className="text-3xl font-black text-[#D4AF37]">
                  120+
                </Typography.Text>
                <p className="mt-1 text-sm font-semibold text-[#B8BCC8]">Xe limousine</p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="text-center md:text-left">
                <Typography.Text className="text-3xl font-black text-[#D4AF37]">
                  24/7
                </Typography.Text>
                <p className="mt-1 text-sm font-semibold text-[#B8BCC8]">Hỗ trợ đặt vé</p>
              </div>
            </Col>
          </Row>
        </div>
      </BookingPageScaffold>

      <PageSection className="bg-[#0B1020] pb-4 pt-2">
        <Typography.Title
          level={2}
          className="!mb-2 !text-xl !font-black !text-white sm:!text-2xl md:!text-3xl"
        >
          Giới thiệu NovaLimo
        </Typography.Title>
        <Typography.Paragraph className="!mb-0 max-w-3xl text-sm font-semibold text-[#B2CCFF] sm:text-base">
          Limousine nội địa, tiêu chuẩn quốc tế — đón trả tận nơi, ghế chọn trực quan.
        </Typography.Paragraph>
      </PageSection>

      <div className="h-px max-w-[1280px] bg-[#FFFFFF14] mx-auto px-4 md:px-12" />

      <PageSection className="bg-[#0B1020] py-10">
        <Typography.Title level={3} className="!text-white !font-black">
          Đội xe NovaLimo
        </Typography.Title>
        <Typography.Paragraph className="!mt-2 !text-[#B8BCC8]">
          Đa dạng dung tích — ghế massage, WiFi 5G, cổng sạc USB trên mọi hành trình.
        </Typography.Paragraph>
        <Row gutter={[24, 24]} className="mt-8">
          {['9 chỗ VIP', '12 chỗ Luxury', 'Limousine D-car'].map((t) => (
            <Col xs={24} md={8} key={t}>
              <Card
                size="small"
                className="h-full border-[#2B283D] bg-[#0D1528] text-[#E8EAEF]"
                title={<span className="font-black text-white">{t}</span>}
              >
                <span className="text-[#B8BCC8]">Demo mô tả dòng xe — cấu hình theo tuyến.</span>
              </Card>
            </Col>
          ))}
        </Row>
      </PageSection>

      <div className="h-px max-w-[1280px] bg-[#FFFFFF14] mx-auto px-4 md:px-12" />

      <PageSection className="bg-[#0B1020] py-12">
        <Typography.Title level={3} className="!text-white !font-black">
          Giá trị cốt lõi
        </Typography.Title>
        <Typography.Paragraph className="!mt-2 !text-[#B8BCC8]">
          Ba cam kết mà đội xe NovaLimo luôn đặt lên hàng đầu.
        </Typography.Paragraph>
        <Row gutter={[28, 28]} className="mt-8">
          {[
            { t: 'An toàn', d: 'Kiểm định định kỳ, tài xế được đào tạo.' },
            { t: 'Đúng giờ', d: 'Điều phối thông minh, giám sát hành trình.' },
            { t: 'Minh bạch', d: 'Giá niêm yết, ghế chọn rõ ràng.' },
          ].map((x) => (
            <Col xs={24} md={8} key={x.t}>
              <Card className="h-full border-[#2B283D] bg-[#0D1528]">
                <Typography.Title level={5} className="!mt-0 !text-[#D4AF37]">
                  {x.t}
                </Typography.Title>
                <p className="text-sm text-[#B8BCC8]">{x.d}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </PageSection>

      <PageSection className="bg-slate-50 py-10">
        <Typography.Paragraph className="!text-sm !leading-relaxed text-[#334155] sm:!text-base">
          NovaLimo vận hành các tuyến limousine cố định với tiêu chuẩn dịch vụ cao: đón
          trả tận nơi, ghế được chọn trực quan, hỗ trợ thanh toán linh hoạt. Đội ngũ tài
          xế được đào tạo, xe được bảo dưỡng định kỳ nhằm đảm bảo an toàn và trải nghiệm
          thoải mái cho hành khách.
        </Typography.Paragraph>
      </PageSection>
    </div>
  );
}
