'use client';

import { NOVA_BRAND } from '@limousine-workspace/utils-core';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { App, Button, Card, Form, Input, Typography } from 'antd';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { loginAdmin, setAdminToken } from '../../lib/api';

export function AdminLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/dashboard';
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-10"
      style={{
        background: `linear-gradient(160deg, ${NOVA_BRAND.navyDeep} 0%, ${NOVA_BRAND.navy} 45%, #0f172a 100%)`,
      }}
    >
      <div className="mb-8 text-center">
        <Typography.Title level={2} className="!mb-1 !text-white">
          NovaLimo Admin
        </Typography.Title>
        <Typography.Text className="text-slate-300">
          Đăng nhập quản trị — khớp frame pen/login khi có thiết kế chi tiết.
        </Typography.Text>
      </div>

      <Card className="w-full max-w-[400px] border-slate-700/40 shadow-xl" styles={{ body: { padding: 28 } }}>
        <Form
          layout="vertical"
          requiredMark={false}
          onFinish={async (v: { phone: string; password: string }) => {
            setLoading(true);
            try {
              const { access_token } = await loginAdmin(v.phone.trim(), v.password);
              setAdminToken(access_token);
              message.success('Đăng nhập thành công');
              router.push(nextPath.startsWith('/') ? nextPath : '/dashboard');
            } catch (e) {
              message.error(e instanceof Error ? e.message : 'Không đăng nhập được');
            } finally {
              setLoading(false);
            }
          }}
        >
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true, message: 'Nhập số điện thoại' }]}
          >
            <Input
              size="large"
              prefix={<UserOutlined className="text-slate-400" />}
              placeholder="VD: 0000000000"
              autoComplete="username"
            />
          </Form.Item>
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Nhập mật khẩu' }]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined className="text-slate-400" />}
              placeholder="Mật khẩu"
              autoComplete="current-password"
            />
          </Form.Item>
          <Form.Item className="!mb-0">
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Typography.Text className="mt-8 text-center text-xs text-slate-500">
        <Link href="/dashboard" className="text-slate-400 underline-offset-2 hover:text-white hover:underline">
          Về Dashboard
        </Link>
        {' · '}
        Demo API: <code className="text-slate-400">0000000000</code> / <code className="text-slate-400">demo</code>
      </Typography.Text>
    </div>
  );
}
