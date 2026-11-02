'use client';

import React, { useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { AddressSearchInput } from '@limousine-workspace/shared-ui';
import { Button, Form, FormInstance, Input, Typography, message } from 'antd';
import { BookingPassengerMapPanel } from './BookingPassengerMapPanel';

type Geo = { lat: number; lng: number };

export type BookingPassengerFormValues = {
  passenger_name: string;
  passenger_phone: string;
  booker_name?: string;
  booker_phone?: string;
  pickup_address: string;
  dropoff_address: string;
  note?: string;
};

export type BookingPassengerStepProps = {
  form: FormInstance<BookingPassengerFormValues>;
  apiBaseUrl: string;
  pickup: { address: string; loc: Geo | null };
  dropoff: { address: string; loc: Geo | null };
  setPickup: React.Dispatch<
    React.SetStateAction<{ address: string; loc: Geo | null }>
  >;
  setDropoff: React.Dispatch<
    React.SetStateAction<{ address: string; loc: Geo | null }>
  >;
  onBack: () => void;
  onContinue: () => void;
};

const inputCls =
  '!rounded-xl !border-0 !bg-[#f5f5f5] !px-4 !py-2.5 !shadow-none hover:!bg-[#efefef]';

const phoneRules = [
  { required: true, message: 'Vui lòng nhập số điện thoại hợp lệ.' },
  {
    pattern: /^[0-9+\-\s]{10,15}$/,
    message: 'Vui lòng nhập số điện thoại hợp lệ.',
  },
];

export function BookingPassengerStep({
  form,
  apiBaseUrl,
  pickup,
  dropoff,
  setPickup,
  setDropoff,
  onBack,
  onContinue,
}: BookingPassengerStepProps) {
  const [who, setWho] = useState<'p' | 'b'>('p');

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
      <div className="rounded-[15px] border border-[#e8e8e8] bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)] sm:p-7 md:p-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 text-sm font-semibold text-[#64748b] transition-colors hover:text-[#0a0e1a]"
        >
          ← Quay lại
        </button>
        <Typography.Title
          level={4}
          className="!mb-1 !mt-0 !text-xl !font-black !text-[#0a0e1a] sm:!text-2xl"
        >
          Thông tin
        </Typography.Title>
        <Typography.Paragraph className="!mb-6 !mt-0 !text-sm !font-medium !text-[#64748b]">
          Thông tin người đi xe hoặc người đặt hộ (nếu có).
        </Typography.Paragraph>

        <div className="mb-6 inline-flex rounded-full border border-[#e5e7eb] bg-[#f5f5f5] p-1">
          <button
            type="button"
            onClick={() => {
              setWho('p');
              form.setFieldsValue({ booker_name: '', booker_phone: '' });
            }}
            className={`rounded-full px-4 py-2 text-xs font-black transition-colors sm:px-5 sm:text-sm ${
              who === 'p'
                ? 'bg-nova-gold text-nova-bg shadow-sm'
                : 'bg-white text-[#64748b] hover:text-[#0a0e1a]'
            }`}
          >
            Người đi xe
          </button>
          <button
            type="button"
            onClick={() => setWho('b')}
            className={`rounded-full px-4 py-2 text-xs font-black transition-colors sm:px-5 sm:text-sm ${
              who === 'b'
                ? 'bg-nova-gold text-nova-bg shadow-sm'
                : 'bg-white text-[#64748b] hover:text-[#0a0e1a]'
            }`}
          >
            Người đặt hộ
          </button>
        </div>

        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="passenger_name"
            label={
              <span className="text-sm font-bold text-[#0a0e1a]">
                {who === 'p' ? 'Họ và tên' : 'Họ và tên người đi xe'}
              </span>
            }
            rules={[{ required: true, message: 'Vui lòng nhập họ tên.' }]}
          >
            <Input
              size="large"
              placeholder="Nhập họ tên đầy đủ"
              className={inputCls}
            />
          </Form.Item>
          <Form.Item
            name="passenger_phone"
            label={
              <span className="text-sm font-bold text-[#0a0e1a]">
                {who === 'p' ? 'Số điện thoại' : 'Số điện thoại người đi xe'}
              </span>
            }
            validateTrigger={['onBlur', 'onChange']}
            rules={phoneRules}
          >
            <Input
              size="large"
              inputMode="tel"
              placeholder="Ví dụ: 0912 345 678"
              className={inputCls}
            />
          </Form.Item>
          {who === 'b' ? (
            <>
              <Form.Item
                name="booker_name"
                label={
                  <span className="text-sm font-bold text-[#0a0e1a]">
                    Họ và tên người đặt
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng nhập họ tên.' }]}
              >
                <Input
                  size="large"
                  placeholder="Người đặt vé"
                  className={inputCls}
                />
              </Form.Item>
              <Form.Item
                name="booker_phone"
                label={
                  <span className="text-sm font-bold text-[#0a0e1a]">
                    Số điện thoại người đặt
                  </span>
                }
                validateTrigger={['onBlur', 'onChange']}
                rules={phoneRules}
              >
                <Input
                  size="large"
                  inputMode="tel"
                  placeholder="Ví dụ: 0987 654 321"
                  className={inputCls}
                />
              </Form.Item>
            </>
          ) : null}
          <p className="-mt-1 mb-6 text-xs font-medium text-[#94a3b8]">
            Số điện thoại dùng để liên hệ khi có thay đổi chuyến.
          </p>

          <Button
            type="primary"
            block
            size="large"
            className="mt-2 h-12 rounded-[12px] !border-0 !bg-nova-gold !text-[15px] !font-black !text-nova-bg hover:!bg-nova-gold-hover"
            onClick={async () => {
              try {
                const names =
                  who === 'b'
                    ? ([
                        'passenger_name',
                        'passenger_phone',
                        'booker_name',
                        'booker_phone',
                      ] as const)
                    : (['passenger_name', 'passenger_phone'] as const);
                await form.validateFields([...names]);
                if (!pickup.loc || !dropoff.loc) {
                  message.error(
                    'Chọn địa chỉ đón và trả từ danh sách gợi ý để lấy tọa độ',
                  );
                  return;
                }
                onContinue();
              } catch {
                /* validation */
              }
            }}
          >
            Tiếp tục thanh toán
          </Button>
        </Form>
      </div>

      <div className="rounded-[15px] border border-[#e8e8e8] bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)] sm:p-7 md:p-8">
        <Typography.Title
          level={4}
          className="!mb-1 !mt-0 !text-xl !font-black !text-[#0a0e1a] sm:!text-2xl"
        >
          Điểm đón / trả
        </Typography.Title>
        <Typography.Paragraph className="!mb-6 !mt-0 !text-sm !font-medium !text-[#64748b]">
          Chọn địa chỉ từ gợi ý để hệ thống lưu tọa độ chính xác.
        </Typography.Paragraph>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-[#0a0e1a]">
              Điểm đón
            </label>
            <AddressSearchInput
              apiBaseUrl={apiBaseUrl}
              placeholder="Tìm địa chỉ đón…"
              value={pickup.address}
              onAddressChange={(a) => setPickup((p) => ({ ...p, address: a }))}
              onLocationCommit={(x) =>
                setPickup({
                  address: x.address,
                  loc: { lat: x.lat, lng: x.lng },
                })
              }
              inputClassName={inputCls}
              suffix={
                <SearchOutlined className="text-[#94a3b8]" aria-hidden />
              }
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-[#0a0e1a]">
              Điểm trả
            </label>
            <AddressSearchInput
              apiBaseUrl={apiBaseUrl}
              placeholder="Tìm địa chỉ trả…"
              value={dropoff.address}
              onAddressChange={(a) =>
                setDropoff((p) => ({ ...p, address: a }))
              }
              onLocationCommit={(x) =>
                setDropoff({
                  address: x.address,
                  loc: { lat: x.lat, lng: x.lng },
                })
              }
              inputClassName={inputCls}
              suffix={
                <SearchOutlined className="text-[#94a3b8]" aria-hidden />
              }
            />
          </div>
        </div>

        <div className="mt-6">
          <BookingPassengerMapPanel
            pickupLoc={pickup.loc}
            dropoffLoc={dropoff.loc}
          />
        </div>
      </div>
    </div>
  );
}
