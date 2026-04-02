'use client';

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  Radio,
  Result,
  Row,
  Space,
  Steps,
  Tabs,
  Typography,
  message,
} from 'antd';
import type { PaymentMethod } from '@limousine-workspace/shared-types';
import {
  AddressSearchInput,
  SeatMap,
  priceForSeat,
  type SeatCapacity,
} from '@limousine-workspace/shared-ui';
import { getApiBaseUrl } from '../../../lib/api';

type Geo = { lat: number; lng: number };

function BookingWizardInner() {
  const params = useParams<{ tripBatchId: string }>();
  const searchParams = useSearchParams();
  const tripBatchId = params.tripBatchId;
  const capacity = (Number(searchParams.get('capacity')) || 9) as SeatCapacity;
  const baseFromUrl = Number(searchParams.get('price')) || 350000;

  const apiUrl = getApiBaseUrl();
  const [form] = Form.useForm<{
    passenger_name: string;
    passenger_phone: string;
    booker_name?: string;
    booker_phone?: string;
    pickup_address: string;
    dropoff_address: string;
    note?: string;
  }>();

  const [step, setStep] = useState(0);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [takenSeats, setTakenSeats] = useState<string[]>([]);
  const [pickup, setPickup] = useState<{ address: string; loc: Geo | null }>({
    address: '',
    loc: null,
  });
  const [dropoff, setDropoff] = useState<{ address: string; loc: Geo | null }>({
    address: '',
    loc: null,
  });
  const [payment, setPayment] = useState<PaymentMethod>('COD');
  const [submitting, setSubmitting] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);

  const unitPrice = useMemo(() => {
    if (!selectedSeat) return baseFromUrl;
    return priceForSeat(selectedSeat, baseFromUrl, capacity);
  }, [selectedSeat, baseFromUrl, capacity]);

  const loadTaken = useCallback(async () => {
    try {
      const res = await fetch(
        `${apiUrl}/bookings/taken-seats?trip_batch_id=${encodeURIComponent(tripBatchId)}`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as string[];
      setTakenSeats(Array.isArray(data) ? data : []);
    } catch {
      setTakenSeats([]);
    }
  }, [apiUrl, tripBatchId]);

  useEffect(() => {
    void loadTaken();
  }, [loadTaken]);

  async function submitBooking() {
    const v = await form.validateFields();
    if (!selectedSeat) {
      message.error('Chọn ghế');
      return;
    }
    if (!pickup.loc || !dropoff.loc) {
      message.error('Chọn địa chỉ đón và trả từ gợi ý để có tọa độ');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/bookings`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          trip_batch_id: tripBatchId,
          passenger_name: v.passenger_name,
          passenger_phone: v.passenger_phone,
          booker_name: v.booker_name || null,
          booker_phone: v.booker_phone || null,
          pickup_address: pickup.address,
          pickup_location: pickup.loc,
          dropoff_address: dropoff.address,
          dropoff_location: dropoff.loc,
          note: v.note ?? null,
          seat_label: selectedSeat,
          unit_price: unitPrice,
          total_amount: unitPrice,
          payment_method: payment,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || res.statusText);
      }
      const booking = (await res.json()) as { id: string };
      setDoneId(booking.id);
      setStep(3);
      message.success('Đặt vé thành công');
    } catch (e) {
      message.error(
        e instanceof Error ? e.message : 'Không thể hoàn tất đặt vé',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const steps = [
    { title: 'Ghế' },
    { title: 'Thông tin' },
    { title: 'Thanh toán' },
    { title: 'Xong' },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Steps current={step} items={steps} className="mb-8" />

      {step === 0 && (
        <Space direction="vertical" size="large" className="w-full">
          <SeatMap
            capacity={capacity}
            basePriceVnd={baseFromUrl}
            selectedSeat={selectedSeat}
            takenSeats={takenSeats}
            onSelect={setSelectedSeat}
          />
          <Button
            type="primary"
            size="large"
            disabled={!selectedSeat}
            onClick={() => setStep(1)}
            block
          >
            Tiếp tục
          </Button>
        </Space>
      )}

      {step === 1 && (
        <Card>
          <Form form={form} layout="vertical" requiredMark>
            <Tabs
              items={[
                {
                  key: 'p',
                  label: 'Người đi xe',
                  children: (
                    <>
                      <Form.Item
                        name="passenger_name"
                        label="Họ tên"
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        name="passenger_phone"
                        label="Số điện thoại"
                        rules={[
                          { required: true },
                          {
                            pattern: /^[0-9+\s]{9,14}$/,
                            message: 'Số điện thoại không hợp lệ',
                          },
                        ]}
                      >
                        <Input inputMode="tel" />
                      </Form.Item>
                    </>
                  ),
                },
                {
                  key: 'b',
                  label: 'Người đặt hộ',
                  children: (
                    <>
                      <Form.Item name="booker_name" label="Họ tên">
                        <Input />
                      </Form.Item>
                      <Form.Item name="booker_phone" label="Số điện thoại">
                        <Input inputMode="tel" />
                      </Form.Item>
                    </>
                  ),
                },
              ]}
            />
            <Typography.Title level={5}>Điểm đón</Typography.Title>
            <AddressSearchInput
              apiBaseUrl={apiUrl}
              placeholder="Nhập địa chỉ đón"
              value={pickup.address}
              onAddressChange={(a) => setPickup((p) => ({ ...p, address: a }))}
              onLocationCommit={(x) =>
                setPickup({ address: x.address, loc: { lat: x.lat, lng: x.lng } })
              }
            />
            <Typography.Title level={5} className="mt-4">
              Điểm trả
            </Typography.Title>
            <AddressSearchInput
              apiBaseUrl={apiUrl}
              placeholder="Nhập địa chỉ trả"
              value={dropoff.address}
              onAddressChange={(a) => setDropoff((p) => ({ ...p, address: a }))}
              onLocationCommit={(x) =>
                setDropoff({ address: x.address, loc: { lat: x.lat, lng: x.lng } })
              }
            />
            <Form.Item name="note" label="Ghi chú" className="mt-4">
              <Input.TextArea rows={2} />
            </Form.Item>
            <Space>
              <Button onClick={() => setStep(0)}>Quay lại</Button>
              <Button
                type="primary"
                onClick={async () => {
                  try {
                    await form.validateFields();
                    if (!pickup.loc || !dropoff.loc) {
                      message.error(
                        'Chọn địa chỉ đón và trả từ danh sách gợi ý để lấy tọa độ',
                      );
                      return;
                    }
                    setStep(2);
                  } catch {
                    /* validation */
                  }
                }}
              >
                Tiếp tục
              </Button>
            </Space>
          </Form>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <Typography.Title level={5}>Phương thức thanh toán</Typography.Title>
          <Radio.Group
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            className="w-full"
          >
            <Space direction="vertical" className="w-full">
              {(
                [
                  ['COD', 'Thanh toán tại nhà xe / tài xế'],
                  ['MOMO', 'Ví MoMo (demo: đã thanh toán)'],
                  ['ZALOPAY', 'ZaloPay (demo)'],
                  ['VNPAY', 'VNPay thẻ (demo)'],
                ] as const
              ).map(([m, label]) => (
                <Radio key={m} value={m} className="w-full">
                  <Card size="small" className="!mt-1 w-full">
                    {label}
                  </Card>
                </Radio>
              ))}
            </Space>
          </Radio.Group>

          <Descriptions
            bordered
            size="small"
            column={1}
            className="mt-6"
            title="Tóm tắt"
          >
            <Descriptions.Item label="Ghế">{selectedSeat}</Descriptions.Item>
            <Descriptions.Item label="Giá vé">
              {unitPrice.toLocaleString('vi-VN')} ₫
            </Descriptions.Item>
            <Descriptions.Item label="Đón">{pickup.address}</Descriptions.Item>
            <Descriptions.Item label="Trả">{dropoff.address}</Descriptions.Item>
          </Descriptions>

          <Space className="mt-6">
            <Button onClick={() => setStep(1)}>Quay lại</Button>
            <Button
              type="primary"
              loading={submitting}
              onClick={() => void submitBooking()}
            >
              Hoàn tất đặt vé
            </Button>
          </Space>
        </Card>
      )}

      {step === 3 && doneId && (
        <Result
          status="success"
          title="Đặt vé thành công"
          subTitle={`Mã vé: ${doneId} — Vé ở trạng thái chờ xếp xe.`}
          extra={[
            <Button type="primary" key="t" href="/my-tickets">
              Xem vé của tôi
            </Button>,
            <Button key="h" href="/">
              Về trang chủ
            </Button>,
          ]}
        />
      )}
    </div>
  );
}

export default function BookingWizardPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-600">
          Đang tải…
        </div>
      }
    >
      <BookingWizardInner />
    </Suspense>
  );
}
