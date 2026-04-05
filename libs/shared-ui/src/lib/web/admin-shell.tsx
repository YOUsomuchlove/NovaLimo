'use client';

import { NOVA_BRAND } from '@limousine-workspace/utils-core';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import {
  BarChartOutlined,
  CarOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  InboxOutlined,
  MenuOutlined,
  NodeIndexOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  ShoppingOutlined,
  TeamOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { Button, Drawer, Layout, Menu, Typography } from 'antd';

const { Header, Sider, Content } = Layout;

export type AdminNavKey =
  | 'dashboard'
  | 'dispatch'
  | 'trip-runs'
  | 'bookings'
  | 'cargos'
  | 'customers'
  | 'vehicles'
  | 'finance'
  | 'monitor'
  | 'call-center'
  | 'reports'
  | 'settings'
  | 'rbac'
  | 'users';

/**
 * Thứ tự và nhãn khớp web-admin.pen (sidebar script).
 * @see PEN_ADMIN_ROUTE_MAP trong apps/web-admin (nếu có).
 */
const NAV: {
  key: AdminNavKey;
  href: string;
  icon: React.ReactNode;
  label: string;
}[] = [
  { key: 'dashboard', href: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: 'dispatch', href: '/dispatch', icon: <NodeIndexOutlined />, label: 'Điều phối' },
  { key: 'trip-runs', href: '/trip-runs', icon: <ClockCircleOutlined />, label: 'Chuyến' },
  { key: 'bookings', href: '/bookings', icon: <ShoppingOutlined />, label: 'Đơn hàng' },
  { key: 'cargos', href: '/cargos', icon: <InboxOutlined />, label: 'Hàng hóa' },
  { key: 'customers', href: '/customers', icon: <UserOutlined />, label: 'Khách hàng' },
  { key: 'users', href: '/users', icon: <TeamOutlined />, label: 'Người dùng NB' },
  { key: 'vehicles', href: '/vehicles', icon: <CarOutlined />, label: 'Đội xe & Tài xế' },
  { key: 'finance', href: '/finance', icon: <WalletOutlined />, label: 'Tài chính' },
  { key: 'monitor', href: '/monitor', icon: <EnvironmentOutlined />, label: 'Giám sát' },
  {
    key: 'call-center',
    href: '/call-center',
    icon: <CustomerServiceOutlined />,
    label: 'Tổng đài/CS',
  },
  { key: 'reports', href: '/reports', icon: <BarChartOutlined />, label: 'Báo cáo' },
  { key: 'settings', href: '/settings', icon: <SettingOutlined />, label: 'Cấu hình' },
  {
    key: 'rbac',
    href: '/rbac',
    icon: <SafetyCertificateOutlined />,
    label: 'Phân quyền',
  },
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
      ['/customers', 'customers'],
      ['/users', 'users'],
      ['/vehicles', 'vehicles'],
      ['/finance', 'finance'],
      ['/monitor', 'monitor'],
      ['/tracking', 'monitor'],
      ['/call-center', 'call-center'],
      ['/reports', 'reports'],
      ['/settings', 'settings'],
      ['/rbac', 'rbac'],
      ['/audit', 'rbac'],
    ];
    for (const [prefix, key] of rows) {
      if (p === prefix || p.startsWith(`${prefix}/`)) return key;
    }
    return 'dashboard';
  }, [pathname]);
}

/** web-admin.pen: Sidebar 260px, fill #050814, stroke #1F2937 */
const siderStyle: React.CSSProperties = {
  background: NOVA_BRAND.adminSiderBg,
  borderRight: `1px solid ${NOVA_BRAND.adminSiderStroke}`,
  overflow: 'auto',
  height: '100vh',
  position: 'sticky',
  top: 0,
  left: 0,
};

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
      theme="dark"
      selectedKeys={[selectedKey]}
      style={{ borderRight: 0, background: 'transparent' }}
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
        <Sider width={260} theme="dark" style={siderStyle}>
          <div className="border-b border-white/10 px-4 py-4">
            <Typography.Title level={5} className="!m-0 !text-[15px] !font-extrabold !text-white">
              NovaLimo Admin
            </Typography.Title>
            <Typography.Text className="text-xs text-[#9CA6C4]">Điều hành & vận hành</Typography.Text>
          </div>
          {nav}
        </Sider>
      )}

      <Layout className="min-w-0">
        <Header
          className="flex min-h-14 items-center justify-between gap-3 border-b border-slate-200/80 bg-white px-3 sm:px-4"
          style={{ lineHeight: 'unset', paddingBlock: 12 }}
        >
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {isMobile ? (
              <Button
                type="text"
                className="!inline-flex !min-h-11 !min-w-11 items-center justify-center"
                icon={<MenuOutlined className="text-lg" />}
                onClick={() => setDrawerOpen(true)}
                aria-label="Mở menu"
              />
            ) : null}
            <Typography.Text strong className="truncate text-sm sm:text-base">
              {title}
            </Typography.Text>
          </div>
        </Header>

        <Content
          className="p-3 sm:p-4 md:p-6"
          style={{ background: NOVA_BRAND.slateLayoutBg }}
        >
          {children}
        </Content>
      </Layout>

      <Drawer
        title={<span className="font-bold text-white">Menu</span>}
        placement="left"
        width={280}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{
          body: { padding: 0, background: NOVA_BRAND.adminSiderBg },
          header: {
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: NOVA_BRAND.adminSiderBg,
          },
        }}
        className="[&_.ant-drawer-title]:text-white"
      >
        <div className="border-b border-white/10 px-4 py-3">
          <Typography.Title level={5} className="!m-0 !text-[15px] !font-extrabold !text-white">
            NovaLimo Admin
          </Typography.Title>
        </div>
        {nav}
      </Drawer>
    </Layout>
  );
}
