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
import type { Vehicle, VehicleStatus } from '@limousine-workspace/shared-types';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { getApiBaseUrl } from '../../lib/api';

export default function VehiclesPage() {
  const [rows, setRows] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form] = Form.useForm<{
    license_plate: string;
    capacity: number;
    status: VehicleStatus;
  }>();

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/vehicles`);
      if (!res.ok) throw new Error('fail');
      setRows((await res.json()) as Vehicle[]);
    } catch {
      message.error('Không tải được đội xe');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function openCreate() {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  }

  function openEdit(v: Vehicle) {
    setEditing(v);
    form.setFieldsValue({
      license_plate: v.license_plate,
      capacity: v.capacity,
      status: v.status,
    });
    setOpen(true);
  }

  async function submit() {
    const v = await form.validateFields();
    const api = getApiBaseUrl();
    try {
      if (editing) {
        const res = await fetch(`${api}/vehicles/${editing.id}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(v),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        message.success('Đã cập nhật');
      } else {
        const res = await fetch(`${api}/vehicles`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(v),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        message.success('Đã thêm xe');
      }
      setOpen(false);
      await load();
    } catch {
      message.error('Lưu thất bại');
    }
  }

  return (
    <AdminShell title="Đội xe">
      <Space className="mb-4">
        <Button type="primary" onClick={openCreate}>
          Thêm xe
        </Button>
        <Button onClick={() => void load()}>Làm mới</Button>
      </Space>

      <Table<Vehicle>
        rowKey="id"
        loading={loading}
        dataSource={rows}
        pagination={{ pageSize: 8 }}
        columns={[
          { title: 'Biển số', dataIndex: 'license_plate' },
          { title: 'Sức chứa', dataIndex: 'capacity', width: 100 },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (s: VehicleStatus) => <Tag>{s}</Tag>,
          },
          {
            title: '',
            key: 'e',
            render: (_, r) => (
              <Button type="link" size="small" onClick={() => openEdit(r)}>
                Sửa
              </Button>
            ),
          },
        ]}
      />

      <Row gutter={[12, 12]} className="mt-4 md:hidden">
        {rows.map((r) => (
          <Col xs={24} key={r.id}>
            <Card size="small">
              <Typography.Text strong>{r.license_plate}</Typography.Text>
              <div>{r.capacity} chỗ · <Tag>{r.status}</Tag></div>
              <Button block size="small" className="mt-2" onClick={() => openEdit(r)}>
                Sửa
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={editing ? 'Sửa xe' : 'Thêm xe'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="license_plate"
            label="Biển số"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="capacity"
            label="Sức chứa"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'AVAILABLE', label: 'AVAILABLE' },
                { value: 'MAINTENANCE', label: 'MAINTENANCE' },
                { value: 'IN_USE', label: 'IN_USE' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </AdminShell>
  );
}
