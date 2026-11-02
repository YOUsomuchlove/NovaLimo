'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Typography,
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { PageSection } from '../../../components/blocks/PageSection';

type CargoForm = {
  route: string;
  sendDate: Dayjs;
  packageType: string;
  weight: string;
  dimensions: string;
  valueVnd: string;
  codVnd: string;
  note: string;
  agree: boolean;
};

const controlClass =
  'cargo-form-field h-12 w-full rounded-xl border-0 bg-[#f0f2f5] shadow-none [&_.ant-select-selector]:!min-h-12 [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!bg-[#f0f2f5] [&_.ant-picker]:!min-h-12 [&_.ant-picker]:!rounded-xl [&_.ant-picker]:!border-0 [&_.ant-picker]:!bg-[#f0f2f5]';

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
    <div className="nova-dark-page-grid min-h-[calc(100vh-80px)]">
      <PageSection className="!pb-6 !pt-10 sm:!pt-12">
        <Typography.Title
          level={2}
          className="!mb-2 !text-3xl !font-black !tracking-tight !text-white sm:!text-4xl md:!text-[40px]"
        >
          Đặt gửi hàng
        </Typography.Title>
        <Typography.Text className="block max-w-2xl text-[15px] font-semibold leading-relaxed text-[#b2ccff]">
          Điền thông tin kiện hàng — hệ thống sẽ báo giá ước tính và điều kiện
          áp dụng.
        </Typography.Text>
      </PageSection>

      <PageSection className="!pt-0 !pb-20">
        <Card
          variant="borderless"
          className="max-w-4xl rounded-[18px] !bg-white !shadow-[0_4px_24px_rgba(0,0,0,0.12)]"
          styles={{
            body: { padding: '28px 24px 32px' },
          }}
        >
          <Typography.Title
            level={4}
            className="!mb-6 !mt-0 !text-lg !font-black !text-[#0a0e18]"
          >
            Thông tin gửi hàng
          </Typography.Title>
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={onFinish}
            initialValues={{
              agree: false,
              sendDate: dayjs(),
            }}
          >
            <Row gutter={[20, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="route"
                  label={
                    <span className="text-[15px] font-bold text-[#0a0e18]">
                      Tuyến
                    </span>
                  }
                  rules={[{ required: true, message: 'Chọn tuyến' }]}
                >
                  <Select
                    size="large"
                    placeholder="Chọn tuyến..."
                    className={controlClass}
                    popupMatchSelectWidth={false}
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
                  name="sendDate"
                  label={
                    <span className="text-[15px] font-bold text-[#0a0e18]">
                      Ngày gửi
                    </span>
                  }
                  rules={[{ required: true, message: 'Chọn ngày gửi' }]}
                >
                  <DatePicker
                    className={`${controlClass} w-full`}
                    format="DD/MM/YYYY"
                    placeholder="Ngày gửi — chọn ngày"
                    disabledDate={(current) =>
                      current ? current < dayjs().startOf('day') : false
                    }
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[20, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="packageType"
                  label={
                    <span className="text-[15px] font-bold text-[#0a0e18]">
                      Loại kiện
                    </span>
                  }
                  rules={[{ required: true, message: 'Chọn loại kiện' }]}
                >
                  <Select
                    size="large"
                    placeholder="Loại kiện..."
                    className={controlClass}
                    options={[
                      { value: 'box', label: 'Thùng / kiện carton' },
                      { value: 'bag', label: 'Bao tải' },
                      { value: 'fragile', label: 'Hàng dễ vỡ (có nhãn)' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="weight"
                  label={
                    <span className="text-[15px] font-bold text-[#0a0e18]">
                      Khối lượng (kg)
                    </span>
                  }
                  rules={[{ required: true, message: 'Nhập khối lượng' }]}
                >
                  <Input
                    size="large"
                    placeholder="Khối lượng (kg)"
                    className="!h-12 !rounded-xl !border-0 !bg-[#f0f2f5] !px-4 !font-medium !text-[#1a1d26]"
                    inputMode="decimal"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[20, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="dimensions"
                  label={
                    <span className="text-[15px] font-bold text-[#0a0e18]">
                      Kích thước (DxRxC cm)
                    </span>
                  }
                >
                  <Input
                    size="large"
                    placeholder="Kích thước (DxRxC cm)"
                    className="!h-12 !rounded-xl !border-0 !bg-[#f0f2f5] !px-4 !font-medium !text-[#1a1d26]"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="valueVnd"
                  label={
                    <span className="text-[15px] font-bold text-[#0a0e18]">
                      Giá trị hàng (VNĐ)
                    </span>
                  }
                >
                  <Input
                    size="large"
                    placeholder="Giá trị hàng (VNĐ)"
                    className="!h-12 !rounded-xl !border-0 !bg-[#f0f2f5] !px-4 !font-medium !text-[#1a1d26]"
                    inputMode="numeric"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="codVnd"
              label={
                <span className="text-[15px] font-bold text-[#0a0e18]">
                  Thu hộ COD (VNĐ)
                </span>
              }
            >
              <Input
                size="large"
                placeholder="Thu hộ COD (VNĐ) — để trống nếu không dùng"
                className="!h-12 !rounded-xl !border-0 !bg-[#f0f2f5] !px-4 !font-medium !text-[#1a1d26]"
                inputMode="numeric"
              />
            </Form.Item>

            <Typography.Title
              level={4}
              className="!mb-4 !mt-10 !text-lg !font-black !text-[#0a0e18]"
            >
              Ghi chú & đồng ý
            </Typography.Title>

            <Form.Item name="note" className="!mb-4">
              <Input.TextArea
                rows={4}
                placeholder="Ghi chú: hàng dễ vỡ, cần xếp riêng..."
                className="!resize-y !rounded-xl !border-0 !bg-[#f0f2f5] !px-4 !py-3 !font-medium !text-[#1a1d26]"
              />
            </Form.Item>

            <Form.Item
              name="agree"
              valuePropName="checked"
              className="!mb-8"
              rules={[
                {
                  validator: (_, v) =>
                    v
                      ? Promise.resolve()
                      : Promise.reject(new Error('Cần xác nhận')),
                },
              ]}
            >
              <Checkbox>
                <span className="text-[14px] font-medium leading-snug text-[#1a1d26]">
                  Tôi đã đọc Điều khoản & Chính sách và xác nhận hàng không thuộc
                  danh mục cấm.
                </span>
              </Checkbox>
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="!h-11 !min-w-[160px] !rounded-[10px] !border-0 !bg-[#d4af37] !px-8 !text-[15px] !font-black !text-[#0a0e18] hover:!bg-[#c9a85c]"
            >
              Xem báo giá
            </Button>
          </Form>
        </Card>
      </PageSection>
    </div>
  );
}
