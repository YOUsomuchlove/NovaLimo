'use client';

import React from 'react';
import { Card, Col, Row, Typography } from 'antd';
import { PageSection } from '../../components/blocks/PageSection';

export default function ContactPage() {
  return (
    <div className="min-h-[60vh] bg-[#0B1020]">
      {/* Frame A1Ssg — không full-bg ảnh; nền solid #0B1020 */}
      <header className="border-b border-[#D4AF37] shadow-[0_2px_18px_rgba(0,0,0,0.13)]">
        <div
          className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-8 sm:px-6 md:px-12 md:py-10 lg:px-16"
          style={{ background: 'rgba(11, 16, 32, 0.9)' }}
        >
          <Typography.Title
            level={2}
            className="!mb-0 !text-2xl !font-black !text-white sm:!text-3xl md:!text-4xl"
          >
            Liên hệ &amp; Hỗ trợ
          </Typography.Title>
          <Typography.Paragraph className="!mb-0 text-sm font-semibold text-[#B8BCC8] sm:text-base">
            Hỗ trợ đặt vé, tư vấn tuyến, phản hồi — cùng hotline/email như khi xác nhận đặt
            vé.
          </Typography.Paragraph>
        </div>
      </header>

      <PageSection className="py-10 md:py-14">
        <Row gutter={[40, 40]}>
          <Col xs={24} lg={12}>
            <Card className="border-[#2B283D] bg-[#0D1528] shadow-md">
              <p className="text-sm font-bold text-[#D4AF37]">Hotline</p>
              <p className="mt-2 text-2xl font-black text-white">1900 3528</p>
              <p className="mt-6 text-sm font-bold text-[#D4AF37]">Email</p>
              <p className="mt-2 text-[#E8EAEF]">support@novalimo.vn</p>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card className="border-[#2B283D] bg-[#0D1528] shadow-md">
              <p className="text-sm font-bold text-[#D4AF37]">Địa chỉ VP</p>
              <p className="mt-2 text-[#E8EAEF]">
                Tầng 8, 123 Nguyễn Trãi, Q. Thanh Xuân, Hà Nội
              </p>
              <p className="mt-6 text-sm text-[#B8BCC8]">
                Giờ làm việc: 8:00 – 22:00 hàng ngày (kể cả ngày lễ — đặt vé online 24/7).
              </p>
            </Card>
          </Col>
        </Row>
      </PageSection>
    </div>
  );
}
