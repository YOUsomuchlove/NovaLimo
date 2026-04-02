'use client';

import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { Booking, BookingStatus, TripBatch } from '@limousine-workspace/shared-types';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { getApiBaseUrl } from '../../lib/api';

export default function BookingsPage() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [batches, setBatches] = useState<TripBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [filterBatch, setFilterBatch] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [form] = Form.useForm<{
    trip_batch_id: string;
    passenger_name: string;
    passenger_phone: string;
    pickup_address: string;
    pickup_lat: number;
    pickup_lng: number;
    dropoff_address: string;
    dropoff_lat: number;
    dropoff_lng: number;
  }>();

  async function load() {
    setLoading(true);
    try {
      const api = getApiBaseUrl();
      const [rb, tb] = await Promise.all([
        fetch(
          `${api}/bookings?${new URLSearchParams({
            ...(filterBatch ? { trip_batch_id: filterBatch } : {}),
            ...(filterStatus ? { status: filterStatus } : {}),
          }).toString()}`,
        ),
        fetch(`${api}/trip-batches`),
      ]);
      if (rb.ok) setRows((await rb.json()) as Booking[]);
      if (tb.ok) setBatches((await tb.json()) as TripBatch[]);
    } catch {
      message.error('Không tải được đặt vé');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [filterBatch, filterStatus]);

  async function submit() {
    const v = await form.validateFields();
    try {
      const res = await fetch(`${getApiBaseUrl()}/bookings`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          trip_batch_id: v.trip_batch_id,
          passenger_name: v.passenger_name,
          passenger_phone: v.passenger_phone,
          pickup_address: v.pickup_address,
          pickup_location: { lat: v.pickup_lat, lng: v.pickup_lng },
          dropoff_address: v.dropoff_address,
          dropoff_location: { lat: v.dropoff_lat, lng: v.dropoff_lng },
          payment_method: 'COD',
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t);
      }
      message.success('Đã tạo vé');
      setOpen(false);
      form.resetFields();
      await load();
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Lỗi');
    }
  }

  return (
    <AdminShell title="Đặt vé">
      <Space className="mb-4" wrap>
        <Select
          allowClear
          placeholder="Lọc batch"
          style={{ minWidth: 200 }}
          options={batches.map((b) => ({
            value: b.id,
            label: `${b.route_name} ${new Date(b.departure_time).toLocaleString('vi-VN')}`,
          }))}
          value={filterBatch}
          onChange={setFilterBatch}
        />
        <Select
          allowClear
          placeholder="Trạng thái"
          style={{ width: 140 }}
          options={[
            'WAITING',
            'PICKED_UP',
            'DROPPED_OFF',
            'CANCELLED',
          ].map((s) => ({ value: s, label: s }))}
          value={filterStatus}
          onChange={setFilterStatus}
        />
        <Button type="primary" onClick={() => setOpen(true)}>
          Tạo vé thủ công
        </Button>
        <Button onClick={() => void load()}>Làm mới</Button>
      </Space>

      <Table<Booking>
        rowKey="id"
        loading={loading}
        dataSource={rows}
        pagination={{ pageSize: 10 }}
        scroll={{ x: true }}
        columns={[
          {
            title: 'Khách',
            dataIndex: 'passenger_name',
            width: 140,
          },
          { title: 'SĐT', dataIndex: 'passenger_phone', width: 120 },
          {
            title: 'Ghế',
            dataIndex: 'seat_label',
            width: 70,
            render: (s: string | null | undefined) => s ?? '—',
          },
          {
            title: 'TT',
            dataIndex: 'status',
            width: 100,
            render: (s: BookingStatus) => <Tag>{s}</Tag>,
          },
          {
            title: 'Đón',
            dataIndex: 'pickup_address',
            ellipsis: true,
          },
        ]}
      />

      <Row gutter={[12, 12]} className="mt-4 md:hidden">
        {rows.map((r) => (
          <Col xs={24} key={r.id}>
            <Card size="small">
              <Typography.Text strong>{r.passenger_name}</Typography.Text>
              <div className="text-xs text-slate-500">{r.pickup_address}</div>
              <Tag className="mt-1">{r.status}</Tag>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title="Tạo vé thủ công (tổng đài)"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void submit()}
        width={560}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="trip_batch_id"
            label="Khung giờ"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              options={batches
                .filter((b) => b.status === 'OPEN')
                .map((b) => ({
                  value: b.id,
                  label: `${b.route_name} • ${new Date(b.departure_time).toLocaleString('vi-VN')}`,
                }))}
            />
          </Form.Item>
          <Form.Item name="passenger_name" label="Họ tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="passenger_phone" label="SĐT" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="pickup_address" label="Đón" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Tọa độ đón">
            <Space>
              <Form.Item name="pickup_lat" noStyle rules={[{ required: true }]}>
                <InputNumber placeholder="lat" />
              </Form.Item>
              <Form.Item name="pickup_lng" noStyle rules={[{ required: true }]}>
                <InputNumber placeholder="lng" />
              </Form.Item>
            </Space>
          </Form.Item>
          <Form.Item name="dropoff_address" label="Trả" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Tọa độ trả">
            <Space>
              <Form.Item name="dropoff_lat" noStyle rules={[{ required: true }]}>
                <InputNumber placeholder="lat" />
              </Form.Item>
              <Form.Item name="dropoff_lng" noStyle rules={[{ required: true }]}>
                <InputNumber placeholder="lng" />
              </Form.Item>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </AdminShell>
  );
}
