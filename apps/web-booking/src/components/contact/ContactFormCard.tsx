'use client';

import React from 'react';
import { Button, Form, Input, message } from 'antd';

type Values = {
  fullName: string;
  phone: string;
  subject: string;
  detail: string;
};

/** Form phản hồi — thẻ trắng, nút navy (mockup). */
export function ContactFormCard() {
  const [form] = Form.useForm<Values>();

  function onFinish() {
    message.success('Đã ghi nhận yêu cầu (demo). Chúng tôi sẽ phản hồi sớm.');
    form.resetFields();
  }

  return (
    <div className="rounded-xl border border-black/[0.06] bg-white p-6 shadow-[0_16px_48px_rgba(0,0,0,0.18)] sm:rounded-2xl sm:p-8 md:p-9">
      <h2 className="text-xl font-black text-[#0a0e1a] sm:text-2xl">
        Gửi phản hồi / khiếu nại
      </h2>
      <p className="mt-2 text-sm font-medium text-[#a0a0a0]">
        Chúng tôi phản hồi trong vòng 24 giờ làm việc.
      </p>

      <Form
        form={form}
        layout="vertical"
        className="mt-7"
        onFinish={onFinish}
        requiredMark={false}
      >
        <Form.Item
          name="fullName"
          label={
            <span className="text-sm font-bold text-[#0a0e1a]">Họ và tên</span>
          }
          rules={[{ required: true, message: 'Nhập họ tên' }]}
        >
          <Input
            size="large"
            placeholder="Nhập họ tên đầy đủ"
            className="rounded-lg border-[#e2e8f0] bg-white px-3 py-2.5"
          />
        </Form.Item>
        <Form.Item
          name="phone"
          label={
            <span className="text-sm font-bold text-[#0a0e1a]">
              Số điện thoại
            </span>
          }
          rules={[{ required: true, message: 'Nhập SĐT' }]}
        >
          <Input
            size="large"
            inputMode="tel"
            placeholder="Ví dụ: 0912 345 678"
            className="rounded-lg border-[#e2e8f0] bg-white px-3 py-2.5"
          />
        </Form.Item>
        <Form.Item
          name="subject"
          label={
            <span className="text-sm font-bold text-[#0a0e1a]">Tiêu đề</span>
          }
          rules={[{ required: true, message: 'Nhập tiêu đề' }]}
        >
          <Input
            size="large"
            placeholder="Tóm tắt nội dung cần hỗ trợ"
            className="rounded-lg border-[#e2e8f0] bg-white px-3 py-2.5"
          />
        </Form.Item>
        <Form.Item
          name="detail"
          label={
            <span className="text-sm font-bold text-[#0a0e1a]">
              Nội dung chi tiết
            </span>
          }
          rules={[{ required: true, message: 'Nhập nội dung' }]}
        >
          <Input.TextArea
            rows={5}
            placeholder="Mô tả chi tiết: mã vé, giờ chạy, hoặc nội dung cần xử lý..."
            className="rounded-lg border-[#e2e8f0] bg-white px-3 py-3"
          />
        </Form.Item>
        <Form.Item className="!mb-0">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            className="h-12 rounded-lg !border-0 !bg-[#0a0e1a] !text-[15px] !font-bold !text-white hover:!bg-[#141a2e]"
          >
            Gửi Yêu Cầu
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
