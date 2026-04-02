'use client';

import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { User, UserRole, UserStatus } from '@limousine-workspace/shared-types';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { getApiBaseUrl } from '../../lib/api';

export default function UsersPage() {
  const [rows, setRows] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form] = Form.useForm<{
    full_name: string;
    phone: string;
    role: UserRole;
    status: UserStatus;
  }>();

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/users`);
      if (!res.ok) throw new Error('fail');
      setRows((await res.json()) as User[]);
    } catch {
      message.error('Không tải được nhân sự');
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

  function openEdit(u: User) {
    setEditing(u);
    form.setFieldsValue({
      full_name: u.full_name,
      phone: u.phone,
      role: u.role,
      status: u.status,
    });
    setOpen(true);
  }

  async function submit() {
    const v = await form.validateFields();
    const api = getApiBaseUrl();
    try {
      if (editing) {
        const res = await fetch(`${api}/users/${editing.id}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(v),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        message.success('Đã cập nhật');
      } else {
        const res = await fetch(`${api}/users`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(v),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        message.success('Đã thêm người dùng');
      }
      setOpen(false);
      await load();
    } catch {
      message.error('Lưu thất bại');
    }
  }

  return (
    <AdminShell title="Nhân sự">
      <Space className="mb-4">
        <Button type="primary" onClick={openCreate}>
          Thêm tài khoản
        </Button>
        <Button onClick={() => void load()}>Làm mới</Button>
      </Space>

      <Table<User>
        rowKey="id"
        loading={loading}
        dataSource={rows}
        pagination={{ pageSize: 8 }}
        columns={[
          { title: 'Họ tên', dataIndex: 'full_name' },
          { title: 'SĐT', dataIndex: 'phone' },
          { title: 'Vai trò', dataIndex: 'role' },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (s: UserStatus) => <Tag>{s}</Tag>,
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
              <Typography.Text strong>{r.full_name}</Typography.Text>
              <div>
                {r.phone} · {r.role} · <Tag>{r.status}</Tag>
              </div>
              <Button block size="small" className="mt-2" onClick={() => openEdit(r)}>
                Sửa
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={editing ? 'Sửa nhân sự' : 'Thêm nhân sự'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="full_name" label="Họ tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="SĐT" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'ADMIN', label: 'ADMIN' },
                { value: 'DRIVER', label: 'DRIVER' },
              ]}
            />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'ACTIVE', label: 'ACTIVE' },
                { value: 'INACTIVE', label: 'INACTIVE' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </AdminShell>
  );
}
