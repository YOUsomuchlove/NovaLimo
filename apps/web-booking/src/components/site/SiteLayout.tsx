'use client';

import React from 'react';
import { Layout } from 'antd';
import { BookingStickyHeader } from '../layout/BookingStickyHeader';
import { SiteFooter } from './SiteFooter';

const { Content } = Layout;

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout className="min-h-screen !bg-transparent">
      <BookingStickyHeader />
      <Content className="flex-1">{children}</Content>
      <SiteFooter />
    </Layout>
  );
}
