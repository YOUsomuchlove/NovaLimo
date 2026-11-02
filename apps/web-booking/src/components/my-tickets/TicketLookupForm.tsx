'use client';

import React from 'react';
import { Button, Form, FormInstance, Input } from 'antd';

export type TicketLookupFormProps = {
  form: FormInstance<{ phone: string }>;
  loading: boolean;
  onSubmit: () => void | Promise<void>;
};

/** Thẻ trái — tra cứu theo SĐT (mockup). */
export function TicketLookupForm({
  form,
  loading,
  onSubmit,
}: TicketLookupFormProps) {
  return (
    <div className="rounded-[18px] border border-[#e8e8e8] bg-white p-8 shadow-[0_8px_32px_rgba(0,0,0,0.18)] sm:rounded-[20px] sm:p-10">
      <h2 className="text-lg font-black text-[#1e293b] sm:text-xl">
        Tra cứu theo số điện thoại
      </h2>
      <Form
        form={form}
        layout="inline"
        className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start"
        onFinish={() => void onSubmit()}
      >
        <Form.Item
          name="phone"
          className="!mb-0 min-w-0 flex-1 sm:min-w-[240px]"
          rules={[{ required: true, message: 'Nhập SĐT' }]}
        >
          <Input
            placeholder="0912 345 678"
            inputMode="tel"
            size="large"
            className="h-11 w-full rounded-lg border border-[#ddd] bg-white px-3.5 text-[15px] font-medium text-[#0a0e1a] shadow-none sm:h-12"
          />
        </Form.Item>
        <Form.Item className="!mb-0 w-full sm:w-auto">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            className="h-11 w-full rounded-lg !border-0 !bg-nova-gold !px-8 !text-sm !font-black !text-nova-bg hover:!bg-nova-gold-hover sm:h-12 sm:min-w-[140px]"
          >
            Tra cứu
          </Button>
        </Form.Item>
      </Form>
      <p className="mb-0 mt-6 text-xs leading-relaxed text-[#94a3b8] sm:text-[13px]">
        Dùng đúng SĐT lúc đặt vé. Có thể gửi OTP khi cần xác minh.
      </p>
    </div>
  );
}
