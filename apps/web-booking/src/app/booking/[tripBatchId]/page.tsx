'use client';

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Button,
  Card,
  Descriptions,
  Form,
  Grid,
  Input,
  Modal,
  Radio,
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
import { PageSection } from '../../../components/blocks/PageSection';
import { BookingPageScaffold } from '../../../components/layout/BookingPageScaffold';
import { PEN_BG, PEN_OVERLAY } from '../../../lib/booking-pen-assets';

type Geo = { lat: number; lng: number };

function bookingDisplayCode(id: string) {
  const tail = id.replace(/-/g, '').slice(0, 4).toUpperCase();
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `NL-${y}${m}${day}-${tail}`;
}

function BookingWizardInner() {
  const screens = Grid.useBreakpoint();
  const isMdUp = Boolean(screens.md);

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
  const [payModalOpen, setPayModalOpen] = useState(false);

  const unitPrice = useMemo(() => {
    if (!selectedSeat) return baseFromUrl;
    return priceForSeat(selectedSeat, baseFromUrl, capacity);
  }, [selectedSeat, baseFromUrl, capacity]);

  const { bgSrc, overlay } = useMemo(() => {
    if (step === 0)
      return { bgSrc: PEN_BG.seatMap, overlay: PEN_OVERLAY.seat };
    if (step === 1)
      return { bgSrc: PEN_BG.bookingInfo, overlay: PEN_OVERLAY.info };
    if (step === 2)
      return { bgSrc: PEN_BG.checkout, overlay: PEN_OVERLAY.checkout };
    return { bgSrc: PEN_BG.bookingSuccess, overlay: PEN_OVERLAY.success };
  }, [step]);

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

  async function openPaymentModal() {
    try {
      await form.validateFields();
      if (!pickup.loc || !dropoff.loc) {
        message.error(
          'Chọn địa chỉ đón và trả từ danh sách gợi ý để lấy tọa độ',
        );
        return;
      }
      setPayModalOpen(true);
    } catch {
      /* validation */
    }
  }

  const steps = [
    { title: 'Ghế' },
    { title: 'Thông tin' },
    { title: 'Thanh toán' },
    { title: 'Xong' },
  ];

  return (
    <div className="bg-[#0B1020]">
      <BookingPageScaffold
        bgSrc={bgSrc}
        overlayClassName={overlay}
        minHeight={step === 3 && doneId ? 'min-h-[calc(100vh-80px)]' : 'min-h-[200px]'}
        priority={step === 0}
      >
        <PageSection className="!py-6 sm:!py-8">
          <Typography.Title
            level={2}
            className="!mb-1 !text-xl !font-black !text-white sm:!text-2xl md:!text-3xl"
          >
            {step === 3 && doneId ? 'Đặt vé thành công' : 'Đặt vé limousine'}
          </Typography.Title>
          {step === 3 && doneId ? (
            <Typography.Text className="text-lg font-black text-[#D4AF37]">
              Mã đơn: {bookingDisplayCode(doneId)}
            </Typography.Text>
          ) : (
            <Typography.Text className="text-[#B2CCFF]">
              Chuyến: <strong className="text-white">{tripBatchId}</strong> · Xe{' '}
              {capacity} chỗ
            </Typography.Text>
          )}
        </PageSection>
      </BookingPageScaffold>

      <PageSection
        className={`max-w-4xl ${step < 3 ? 'bg-[#0B1020] pb-16 pt-2' : 'bg-[#0B1020] pb-16 pt-4'}`}
      >
        {step < 3 ? (
          <Steps
            current={step}
            items={steps}
            direction={isMdUp ? 'horizontal' : 'vertical'}
            size={isMdUp ? 'default' : 'small'}
            className="mb-8 [&_.ant-steps-item-title]:!text-xs [&_.ant-steps-item-title]:!font-bold sm:[&_.ant-steps-item-title]:!text-sm [&_.ant-steps-item-title]:!text-[#E8EAEF]"
          />
        ) : null}

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
              className="!h-12 !font-black !text-[#0B1020]"
            >
              Tiếp tục
            </Button>
          </Space>
        )}

        {step === 1 && (
          <Card className="border-[#E5E7EB] shadow-md">
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
              <div className="mt-4 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button onClick={() => setStep(0)} block className="sm:!w-auto">
                  Quay lại
                </Button>
                <Button
                  type="primary"
                  block
                  className="sm:!w-auto"
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
              </div>
            </Form>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-[#E5E7EB] shadow-md">
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

            <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button onClick={() => setStep(1)} block className="sm:!w-auto">
                Quay lại
              </Button>
              <Button
                type="primary"
                loading={submitting}
                block
                className="sm:!w-auto"
                onClick={() => void openPaymentModal()}
              >
                Hoàn tất đặt vé
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && doneId ? (
          <div className="rounded-xl border border-[#2B283D] bg-[#0B1020]/40 p-6 sm:p-8">
            <div className="flex flex-col gap-8 md:flex-row md:items-start">
              <div
                className="flex h-[200px] w-[200px] shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-center text-xs text-[#64748B]"
                role="img"
                aria-label="Mã QR demo"
              >
                QR thanh toán / vé
                <br />
                (demo)
              </div>
              <div className="min-w-0 flex-1">
                <Typography.Paragraph className="!mb-4 !text-sm font-semibold leading-relaxed text-[#E8EAEF] sm:!text-base">
                  Bước tiếp theo: hoàn tất thanh toán (nếu còn) → nhận vé điện tử qua
                  SMS/email → có mặt trước giờ khởi hành 15 phút.
                </Typography.Paragraph>
                <Typography.Paragraph type="secondary" className="!text-[#B2CCFF]">
                  Mã hệ thống: {doneId}
                </Typography.Paragraph>
                <Space className="mt-6" wrap>
                  <Link href="/my-tickets">
                    <Button
                      type="primary"
                      size="large"
                      className="!font-black !text-[#0B1020]"
                    >
                      Xem vé của tôi
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button size="large">Về trang chủ</Button>
                  </Link>
                </Space>
              </div>
            </div>
          </div>
        ) : null}
      </PageSection>

      <Modal
        title={
          <span className="font-black text-[#0B1020]">
            Popup hoàn tất thanh toán (QR + thông tin)
          </span>
        }
        open={payModalOpen}
        onCancel={() => setPayModalOpen(false)}
        footer={[
          <Button key="b" onClick={() => setPayModalOpen(false)}>
            Đóng
          </Button>,
          <Button
            key="ok"
            type="primary"
            loading={submitting}
            className="!font-black !text-[#0B1020]"
            onClick={() => {
              setPayModalOpen(false);
              void submitBooking();
            }}
          >
            Xác nhận &amp; tạo vé
          </Button>,
        ]}
        width={520}
        centered
        classNames={{ body: '!pt-2' }}
      >
        <Typography.Paragraph className="text-[#616167]">
          {payment === 'COD'
            ? 'Thanh toán COD khi lên xe. Bấm xác nhận để tạo vé.'
            : 'Quét mã QR (demo). Sau đó bấm xác nhận để hoàn tất đặt vé.'}
        </Typography.Paragraph>
        <div className="mx-auto my-4 flex h-48 w-48 items-center justify-center rounded-xl border border-[#E8E8E8] bg-white text-center text-xs text-[#94a3b8]">
          QR demo
          <br />
          {unitPrice.toLocaleString('vi-VN')} ₫
        </div>
      </Modal>
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
