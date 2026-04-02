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
import type { Cargo, CargoStatus } from '@limousine-workspace/shared-types';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { getApiBaseUrl } from '../../lib/api';

export default function CargosPage() {
  const [rows, setRows] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<{
    waybill_code: string;
    sender_name: string;
    sender_phone: string;
    receiver_name: string;
    receiver_phone: string;
    pickup_lat: number;
    pickup_lng: number;
    dropoff_lat: number;
    dropoff_lng: number;
    status: CargoStatus;
  }>();

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/cargos`);
      if (!res.ok) throw new Error('fail');
      setRows((await res.json()) as Cargo[]);
    } catch {
      message.error('Không tải được hàng hóa');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function submit() {
    const v = await form.validateFields();
    try {
      const res = await fetch(`${getApiBaseUrl()}/cargos`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          trip_run_id: null,
          ...v,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      message.success('Đã tạo vận đơn');
      setOpen(false);
      form.resetFields();
      await load();
    } catch {
      message.error('Lưu thất bại');
    }
  }

  return (
    <AdminShell title="Hàng hóa">
      <Space className="mb-4">
        <Button type="primary" onClick={() => setOpen(true)}>
          Thêm vận đơn
        </Button>
        <Button onClick={() => void load()}>Làm mới</Button>
      </Space>

      <Table<Cargo>
        rowKey="id"
        loading={loading}
        dataSource={rows}
        pagination={{ pageSize: 8 }}
        columns={[
          { title: 'Mã vận đơn', dataIndex: 'waybill_code', width: 140 },
          {
            title: 'Người gửi',
            key: 's',
            render: (_, r) => r.sender_info.name,
          },
          {
            title: 'Người nhận',
            key: 'r',
            render: (_, r) => r.receiver_info.name,
          },
          {
            title: 'TT',
            dataIndex: 'status',
            width: 100,
            render: (s: CargoStatus) => <Tag>{s}</Tag>,
          },
        ]}
      />

      <Row gutter={[12, 12]} className="mt-4 md:hidden">
        {rows.map((r) => (
          <Col xs={24} key={r.id}>
            <Card size="small">
              <Typography.Text strong>{r.waybill_code}</Typography.Text>
              <div className="text-xs">
                {r.sender_info.name} → {r.receiver_info.name}
              </div>
              <Tag className="mt-1">{r.status}</Tag>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title="Thêm vận đơn"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void submit()}
        width={520}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ status: 'PENDING' }}>
          <Form.Item name="waybill_code" label="Mã vận đơn" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sender_name" label="Người gửi" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sender_phone" label="SĐT gửi" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="receiver_name" label="Người nhận" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="receiver_phone" label="SĐT nhận" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Điểm lấy (lat/lng)">
            <Space>
              <Form.Item name="pickup_lat" noStyle rules={[{ required: true }]}>
                <InputNumber placeholder="lat" />
              </Form.Item>
              <Form.Item name="pickup_lng" noStyle rules={[{ required: true }]}>
                <InputNumber placeholder="lng" />
              </Form.Item>
            </Space>
          </Form.Item>
          <Form.Item label="Điểm giao (lat/lng)">
            <Space>
              <Form.Item name="dropoff_lat" noStyle rules={[{ required: true }]}>
                <InputNumber placeholder="lat" />
              </Form.Item>
              <Form.Item name="dropoff_lng" noStyle rules={[{ required: true }]}>
                <InputNumber placeholder="lng" />
              </Form.Item>
            </Space>
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'PENDING', label: 'PENDING' },
                { value: 'PICKED_UP', label: 'PICKED_UP' },
                { value: 'DELIVERED', label: 'DELIVERED' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </AdminShell>
  );
}
