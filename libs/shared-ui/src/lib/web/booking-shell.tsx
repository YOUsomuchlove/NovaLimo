'use client';

import { NOVA_BRAND } from '@limousine-workspace/utils-core';
import React from 'react';
import Link from 'next/link';
import { Layout, Typography } from 'antd';
import { CarOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

export function BookingShell({ children }: { children: React.ReactNode }) {
  return (
    <Layout className="min-h-screen bg-slate-50">
      <Header
        className="flex items-center justify-between px-4 md:px-8"
        style={{
          background: NOVA_BRAND.navy,
          lineHeight: '64px',
          height: 'auto',
          paddingBlock: 12,
        }}
      >
        <Link href="/" className="flex items-center gap-2 text-white no-underline">
          <CarOutlined className="text-xl" style={{ color: NOVA_BRAND.gold }} />
          <span className="text-lg font-semibold tracking-wide">NovaLimo</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-3 md:gap-6 text-sm">
          <Link
            href="/search"
            className="text-slate-200 no-underline hover:text-[#c9a227]"
          >
            Tìm chuyến
          </Link>
          <Link
            href="/my-tickets"
            className="text-slate-200 no-underline hover:text-[#c9a227]"
          >
            Vé của tôi
          </Link>
        </nav>
      </Header>

      <Content className="flex-1">{children}</Content>

      <Footer className="border-t border-slate-200 bg-white text-center text-slate-500">
        <Typography.Text type="secondary">
          NovaLimo — Đặt vé limousine · Hotline{' '}
          <a href="tel:19003528" style={{ color: NOVA_BRAND.gold }}>
            1900 xxxx
          </a>
        </Typography.Text>
      </Footer>
    </Layout>
  );
}
