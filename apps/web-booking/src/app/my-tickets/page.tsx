'use client';

import React, { useState } from 'react';
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Row,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { Booking, BookingStatus } from '@limousine-workspace/shared-types';
import { getApiBaseUrl } from '../../lib/api';
import { PageSection } from '../../components/blocks/PageSection';
import { BookingPageScaffold } from '../../components/layout/BookingPageScaffold';
import { PEN_BG, PEN_OVERLAY } from '../../lib/booking-pen-assets';

function statusTag(status: BookingStatus) {
  const map: Record<
    BookingStatus,
    { color: string; label: string }
  > = {
    WAITING: { color: 'gold', label: 'Đang chờ xe' },
    PICKED_UP: { color: 'blue', label: 'Đã lên xe' },
    DROPPED_OFF: { color: 'green', label: 'Đã hoàn thành' },
    CANCELLED: { color: 'red', label: 'Đã hủy' },
  };
  const m = map[status];
  return <Tag color={m.color}>{m.label}</Tag>;
}

export default function MyTicketsPage() {
  const [form] = Form.useForm<{ phone: string }>();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Booking[]>([]);
  const [searched, setSearched] = useState(false);

  async function onSearch() {
    const { phone } = await form.validateFields();
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/bookings?passenger_phone=${encodeURIComponent(phone.trim())}`,
      );
      if (!res.ok) throw new Error('fetch');
      const data = (await res.json()) as Booking[];
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#0B1020]">
      {/* Frames 43Hd5 / 43TrKq2 */}
      <BookingPageScaffold
        bgSrc={PEN_BG.myTickets}
        overlayClassName={PEN_OVERLAY.myTickets}
        minHeight="min-h-[280px]"
      >
        <PageSection className="!py-8 sm:!py-10">
          <Typography.Title
            level={2}
            className="!mb-2 !text-2xl !font-black !text-white sm:!text-3xl md:!text-4xl"
          >
            Tra cứu vé đã đặt
          </Typography.Title>
          <Typography.Paragraph className="!mb-0 text-sm font-semibold text-[#C8D4F0] sm:text-base">
            Nhập SĐT đặt vé — kết quả hiển thị bên phải khi tra cứu thành công.
          </Typography.Paragraph>
        </PageSection>
      </BookingPageScaffold>

      <PageSection className="bg-[#0B1020] pb-16 pt-4">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={10}>
            <Card
              className="w-full border-[#E5E7EB] shadow-md"
              title={
                <span className="font-black text-[#0B1020]">
                  Tra cứu theo số điện thoại
                </span>
              }
            >
              <Form form={form} layout="vertical" onFinish={() => void onSearch()}>
                <Form.Item
                  name="phone"
                  label={<span className="font-bold">Số điện thoại</span>}
                  rules={[{ required: true, message: 'Nhập SĐT' }]}
                >
                  <Input
                    placeholder="0912 345 678"
                    inputMode="tel"
                    size="large"
                    className="w-full max-w-full sm:max-w-[320px]"
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    className="!min-w-[136px] !font-black !text-[#0B1020]"
                  >
                    Tra cứu
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
          <Col xs={24} lg={14}>
            {searched && !loading && rows.length === 0 ? (
              <Card className="border-[#E5E7EB] shadow-sm">
                <Empty
                  description={
                    <span className="text-[#B2CCFF]">
                      Không tìm thấy vé với SĐT này
                    </span>
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </Card>
            ) : null}

            {rows.length > 0 ? (
              <Card className="border-[#E5E7EB] shadow-sm">
                <Typography.Title level={5} className="!mt-0 !text-[#0B1020]">
                  Danh sách vé
                </Typography.Title>
                <Table<Booking>
                  rowKey="id"
                  loading={loading}
                  dataSource={rows}
                  pagination={{ pageSize: 8 }}
                  scroll={{ x: 720 }}
                  columns={[
                    {
                      title: 'Mã vé',
                      dataIndex: 'id',
                      ellipsis: true,
                      width: 120,
                      render: (id: string) => id.slice(0, 8) + '…',
                    },
                    {
                      title: 'Ghế',
                      dataIndex: 'seat_label',
                      width: 72,
                      render: (s: string | null | undefined) => s ?? '—',
                    },
                    {
                      title: 'Đón',
                      dataIndex: 'pickup_address',
                      ellipsis: true,
                      responsive: ['sm'],
                    },
                    {
                      title: 'Trạng thái',
                      dataIndex: 'status',
                      width: 130,
                      render: (s: BookingStatus) => statusTag(s),
                    },
                    {
                      title: 'Thanh toán',
                      key: 'pay',
                      width: 110,
                      responsive: ['md'],
                      render: (_, r: Booking) => (
                        <Tag>{r.payment_status ?? '—'}</Tag>
                      ),
                    },
                  ]}
                />
              </Card>
            ) : null}

            {!searched && !loading && rows.length === 0 ? (
              <Typography.Paragraph className="text-[#B2CCFF]">
                Nhập SĐT và bấm Tra cứu để xem vé.
              </Typography.Paragraph>
            ) : null}
          </Col>
        </Row>
      </PageSection>
    </div>
  );
}
