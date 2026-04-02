'use client';

import React, { useState } from 'react';
import { Button, Card, Form, Input, Table, Tag, Typography } from 'antd';
import type { Booking, BookingStatus } from '@limousine-workspace/shared-types';
import { getApiBaseUrl } from '../../lib/api';

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

  async function onSearch() {
    const { phone } = await form.validateFields();
    setLoading(true);
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
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Typography.Title level={3}>Vé của tôi</Typography.Title>
      <Typography.Paragraph type="secondary">
        Nhập số điện thoại hành khách để xem lịch sử đặt vé.
      </Typography.Paragraph>

      <Card className="mb-6">
        <Form form={form} layout="inline" onFinish={() => void onSearch()}>
          <Form.Item
            name="phone"
            rules={[{ required: true, message: 'Nhập SĐT' }]}
          >
            <Input placeholder="Số điện thoại" inputMode="tel" style={{ minWidth: 220 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Tra cứu
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Table<Booking>
        rowKey="id"
        loading={loading}
        dataSource={rows}
        pagination={{ pageSize: 8 }}
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
            width: 80,
            render: (s: string | null | undefined) => s ?? '—',
          },
          {
            title: 'Đón',
            dataIndex: 'pickup_address',
            ellipsis: true,
          },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: 140,
            render: (s: BookingStatus) => statusTag(s),
          },
          {
            title: 'Thanh toán',
            key: 'pay',
            width: 120,
            render: (_, r) => (
              <Tag>{r.payment_status ?? '—'}</Tag>
            ),
          },
        ]}
      />
    </div>
  );
}
