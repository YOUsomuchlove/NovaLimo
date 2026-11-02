'use client';

import React from 'react';
import { Card, Col, Row, Typography } from 'antd';
import { PageSection } from '../blocks/PageSection';

const cardBodyClass =
  '!text-[15px] !font-semibold !leading-relaxed !text-white/90';

export function CargoInfoCards() {
  return (
    <PageSection className="!py-14 md:!py-20">
      <Row gutter={[20, 20]}>
        <Col xs={24} md={8}>
          <Card
            variant="borderless"
            className="h-full rounded-[14px] border border-white/12 bg-white/[0.07] shadow-none backdrop-blur-md"
            styles={{ body: { padding: '22px 22px 24px' } }}
            title={
              <span className="text-[16px] font-black text-[#d4af37]">
                Kích thước & trọng lượng
              </span>
            }
          >
            <Typography.Paragraph className={`${cardBodyClass} !mb-0`}>
              Tối đa theo khung kiện chuẩn. Vượt khung sẽ báo phụ phí trước khi
              xác nhận.
            </Typography.Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            variant="borderless"
            className="h-full rounded-[14px] border border-white/12 bg-white/[0.07] shadow-none backdrop-blur-md"
            styles={{ body: { padding: '22px 22px 24px' } }}
            title={
              <span className="text-[16px] font-black text-[#d4af37]">
                COD & giá trị hàng
              </span>
            }
          >
            <Typography.Paragraph className={`${cardBodyClass} !mb-0`}>
              Thu hộ COD theo thỏa thuận. Khai báo giá trị để áp dụng điều kiện
              bảo quản phù hợp.
            </Typography.Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            variant="borderless"
            className="h-full rounded-[14px] border border-white/12 bg-white/[0.07] shadow-none backdrop-blur-md"
            styles={{ body: { padding: '22px 22px 24px' } }}
            title={
              <span className="text-[16px] font-black text-[#d4af37]">
                Nhận / giao tại bến
              </span>
            }
          >
            <Typography.Paragraph className={`${cardBodyClass} !mb-0`}>
              Điểm giao nhận rõ ràng. Hàng dễ vỡ hoặc cấm gửi được cảnh báo trên
              báo giá.
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>

      <Typography.Title
        level={3}
        className="!mb-5 !mt-14 !text-xl !font-black !text-white sm:!text-2xl"
      >
        Quy trình gửi nhanh
      </Typography.Title>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-[14px] font-semibold text-white sm:text-[15px]">
        <span>1) Chọn tuyến &amp; ngày</span>
        <span className="text-white/45" aria-hidden>
          →
        </span>
        <span>2) Nhập loại kiện &amp; khối lượng</span>
        <span className="text-white/45" aria-hidden>
          →
        </span>
        <span>3) Xem báo giá</span>
        <span className="text-white/45" aria-hidden>
          →
        </span>
        <span>4) Xác nhận &amp; mang hàng ra bến theo mã vận đơn.</span>
      </div>
    </PageSection>
  );
}
