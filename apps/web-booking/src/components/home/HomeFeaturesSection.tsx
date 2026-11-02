'use client';

import React from 'react';
import { Card, Col, Row, Typography } from 'antd';
import {
  AimOutlined,
  CalendarOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { PageSection } from '../blocks/PageSection';

/**
 * Frame 1LLR6 — 3 thẻ trắng “Trải nghiệm đặt vé limousine sang trọng”.
 */
export function HomeFeaturesSection() {
  return (
    <PageSection className="bg-white pb-14 pt-12 md:pb-20 md:pt-16">
      <div className="flex flex-col gap-2 text-center md:text-left">
        <div className="flex items-center justify-center gap-2 md:justify-start">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full bg-nova-gold"
            aria-hidden
          />
          <Typography.Text className="text-sm font-semibold text-nova-gold">
            Hành trình được yêu thích
          </Typography.Text>
        </div>
        <Typography.Title
          level={2}
          className="mb-12 mt-0 text-[28px] font-extrabold leading-tight text-nova-bg md:text-3xl"
        >
          Trải nghiệm đặt vé limousine sang trọng
        </Typography.Title>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card
            variant="borderless"
            className="h-full min-h-[212px] overflow-hidden rounded-(--radius-nova-lg) border border-[#E5E7EB] shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_14px_30px_rgba(15,23,42,0.10)]"
            styles={{ body: { padding: '24px 22px 28px' } }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-nova-gold bg-nova-bg text-nova-gold shadow-[0_6px_18px_rgba(11,16,32,0.28)] [&_svg]:fill-current [&_svg]:text-inherit">
                <SafetyOutlined className="text-[22px]! text-nova-gold!" />
              </div>
              <Typography.Title
                level={4}
                className="mb-2 mt-0 text-[18px] font-extrabold leading-snug text-nova-bg"
              >
                An toàn &amp; Chuẩn mực
              </Typography.Title>
              <p className="mb-0 max-w-[382px] text-sm leading-relaxed text-[#616167]">
                Quy trình kiểm tra chất lượng trước chuyến đi, lái xe chuyên
                nghiệp.
              </p>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            variant="borderless"
            className="h-full min-h-[212px] overflow-hidden rounded-(--radius-nova-lg) border border-[#E5E7EB] shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_14px_30px_rgba(15,23,42,0.10)]"
            styles={{ body: { padding: '24px 22px 28px' } }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-nova-gold bg-nova-bg text-nova-gold shadow-[0_6px_18px_rgba(11,16,32,0.28)] [&_svg]:fill-current [&_svg]:text-inherit">
                <AimOutlined className="text-[22px]! text-nova-gold!" />
              </div>
              <Typography.Title
                level={4}
                className="mb-2 mt-0 text-[18px] font-extrabold leading-snug text-nova-bg"
              >
                Đặt nhanh, xác nhận liền
              </Typography.Title>
              <p className="mb-0 max-w-[382px] text-sm leading-relaxed text-[#616167]">
                Chọn điểm đi/điểm đến, lịch trình rõ ràng và thao tác gọn nhẹ.
              </p>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            variant="borderless"
            className="h-full min-h-[212px] overflow-hidden rounded-(--radius-nova-lg) border border-[#E5E7EB] shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_14px_30px_rgba(15,23,42,0.10)]"
            styles={{ body: { padding: '24px 22px 28px' } }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-nova-gold bg-nova-bg text-nova-gold shadow-[0_6px_18px_rgba(11,16,32,0.28)] [&_svg]:fill-current [&_svg]:text-inherit">
                <CalendarOutlined className="text-[22px]! text-nova-gold!" />
              </div>
              <Typography.Title
                level={4}
                className="mb-2 mt-0 text-[18px] font-extrabold leading-snug text-nova-bg"
              >
                Đúng giờ, đúng yêu cầu
              </Typography.Title>
              <p className="mb-0 max-w-[382px] text-sm leading-relaxed text-[#616167]">
                Hỗ trợ cập nhật chuyến đi và phối hợp lịch trình theo nhu cầu.
              </p>
            </div>
          </Card>
        </Col>
      </Row>
    </PageSection>
  );
}
