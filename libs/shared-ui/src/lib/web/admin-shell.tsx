'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import {
  AppstoreOutlined,
  CarOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  InboxOutlined,
  MenuOutlined,
  ScheduleOutlined,
  ShoppingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button, Drawer, Layout, Menu, Typography } from 'antd';

const { Header, Sider, Content } = Layout;

export type AdminNavKey =
  | 'dashboard'
  | 'dispatch'
  | 'trip-runs'
  | 'bookings'
  | 'cargos'
  | 'vehicles'
  | 'users'
  | 'tracking';

const NAV: { key: AdminNavKey; href: string; icon: React.ReactNode; label: string }[] =
  [
    { key: 'dashboard', href: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'dispatch', href: '/dispatch', icon: <AppstoreOutlined />, label: 'Điều phối' },
    { key: 'trip-runs', href: '/trip-runs', icon: <ScheduleOutlined />, label: 'Chuyến xe' },
    { key: 'bookings', href: '/bookings', icon: <ShoppingOutlined />, label: 'Đặt vé' },
    { key: 'cargos', href: '/cargos', icon: <InboxOutlined />, label: 'Hàng hóa' },
    { key: 'vehicles', href: '/vehicles', icon: <CarOutlined />, label: 'Đội xe' },
    { key: 'users', href: '/users', icon: <TeamOutlined />, label: 'Nhân sự' },
    { key: 'tracking', href: '/tracking', icon: <EnvironmentOutlined />, label: 'Bản đồ' },
  ];

function useIsMobileLg() {
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia('(max-width: 991.98px)');
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}

function useSelectedNavKey(pathname: string | null): AdminNavKey {
  return useMemo(() => {
    const p = pathname ?? '/';
    const rows: [string, AdminNavKey][] = [
      ['/dashboard', 'dashboard'],
      ['/dispatch', 'dispatch'],
      ['/trip-runs', 'trip-runs'],
      ['/bookings', 'bookings'],
      ['/cargos', 'cargos'],
      ['/vehicles', 'vehicles'],
      ['/users', 'users'],
      ['/tracking', 'tracking'],
    ];
    for (const [prefix, key] of rows) {
      if (p === prefix || p.startsWith(`${prefix}/`)) return key;
    }
    return 'dashboard';
  }, [pathname]);
}

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const selectedKey = useSelectedNavKey(pathname);
  const isMobile = useIsMobileLg();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const nav = (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      style={{ height: '100%', borderRight: 0 }}
      items={NAV.map((n) => ({
        key: n.key,
        icon: n.icon,
        label: <Link href={n.href}>{n.label}</Link>,
      }))}
      onClick={() => setDrawerOpen(false)}
    />
  );

  return (
    <Layout className="min-h-screen">
      {isMobile ? null : (
        <Sider width={240} theme="light">
          <div className="border-b border-slate-200 p-4">
            <Typography.Title level={5} className="!m-0">
              NovaLimo Admin
            </Typography.Title>
          </div>
          {nav}
        </Sider>
      )}

      <Layout>
        <Header
          className="flex items-center justify-between border-b border-slate-200 bg-white px-4"
          style={{ lineHeight: '64px', height: 'auto', paddingBlock: 12 }}
        >
          <div className="flex items-center gap-3">
            {isMobile ? (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerOpen(true)}
              />
            ) : null}
            <Typography.Text strong>{title}</Typography.Text>
          </div>
        </Header>

        <Content className="bg-slate-50 p-4">{children}</Content>
      </Layout>

      <Drawer
        title="Menu"
        placement="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{ body: { padding: 0 } }}
      >
        {nav}
      </Drawer>
    </Layout>
  );
}
