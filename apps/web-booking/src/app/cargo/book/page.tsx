'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  Row,
  Select,
  Typography,
} from 'antd';
import { PageSection } from '../../../components/blocks/PageSection';
import { BookingPageScaffold } from '../../../components/layout/BookingPageScaffold';
import { PEN_BG, PEN_OVERLAY } from '../../../lib/booking-pen-assets';

type CargoForm = {
  route: string;
  weight: string;
  note: string;
  agree: boolean;
};

export default function CargoBookPage() {
  const router = useRouter();
  const [form] = Form.useForm<CargoForm>();

  function onFinish(values: CargoForm) {
    const q = new URLSearchParams({
      route: values.route,
      w: values.weight,
      note: values.note || '',
    });
    router.push(`/cargo/results?${q.toString()}`);
  }

  return (
    <div className="bg-[#0B1020]">
      <BookingPageScaffold
        bgSrc={PEN_BG.cargoBook}
        overlayClassName={PEN_OVERLAY.cargoBook}
        minHeight="min-h-[220px]"
      >
        <PageSection className="!py-8 sm:!py-10">
          <Typography.Title
            level={2}
            className="!mb-1 !text-2xl !font-black !text-white sm:!text-3xl md:!text-4xl"
          >
            Đặt gửi hàng
          </Typography.Title>
          <Typography.Text className="text-sm font-semibold text-[#B2CCFF] sm:text-base">
            Điền thông tin kiện hàng — hệ thống sẽ báo giá ước tính và điều kiện áp dụng.
          </Typography.Text>
        </PageSection>
      </BookingPageScaffold>

      <PageSection className="bg-[#0B1020] pb-16 pt-4">
        <Card className="max-w-4xl rounded-3xl border-[#E5E7EB] shadow-md">
          <Typography.Title level={4} className="!mt-0 !text-[#0B1020]">
            Thông tin gửi hàng
          </Typography.Title>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ agree: false }}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="route"
                  label="Tuyến"
                  rules={[{ required: true, message: 'Chọn tuyến' }]}
                >
                  <Select
                    size="large"
                    placeholder="Chọn tuyến"
                    options={[
                      { value: 'HN — HP', label: 'Hà Nội — Hải Phòng' },
                      { value: 'HN — NB', label: 'Hà Nội — Ninh Bình' },
                      { value: 'HN — QB', label: 'Hà Nội — Quảng Bình (demo)' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="weight"
                  label="Khối lượng (kg)"
                  rules={[{ required: true, message: 'Nhập khối lượng' }]}
                >
                  <Input size="large" placeholder="Ví dụ: 12" inputMode="decimal" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="note" label="Ghi chú / loại hàng">
              <Input.TextArea rows={3} placeholder="Mô tả ngắn (demo)" />
            </Form.Item>
            <Form.Item
              name="agree"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, v) =>
                    v ? Promise.resolve() : Promise.reject(new Error('Cần đồng ý')),
                },
              ]}
            >
              <Checkbox>Tôi xác nhận thông tin khai báo trung thực (demo).</Checkbox>
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="!font-black !text-[#0B1020]"
            >
              Xem báo giá
            </Button>
          </Form>
        </Card>
      </PageSection>
    </div>
  );
}
