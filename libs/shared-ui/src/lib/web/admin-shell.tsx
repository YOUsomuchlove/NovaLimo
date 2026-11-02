'use client';

import { NOVA_BRAND } from '@limousine-workspace/utils-core';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  BarChartOutlined,
  CarOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
  AppstoreOutlined,
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

/** Page background. */
const ADMIN_CONSOLE_BG = '#0b1020';
/** Sidebar background. */
const ADMIN_SIDEBAR_BG = '#050814';

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

const NAV: {
  key: AdminNavKey;
  href: string;
  icon: React.ReactNode;
  label: string;
}[] = [
  { key: 'dashboard', href: '/dashboard', icon: <AppstoreOutlined />, label: 'Dashboard' },
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

const siderStyle: React.CSSProperties = {
  background: ADMIN_SIDEBAR_BG,
  borderRight: '1px solid rgba(255, 255, 255, 0.06)',
  overflow: 'visible',
  minHeight: '100vh',
};

export type AdminShellProps = {
  title: string;
  /** Dòng phụ dưới tiêu đề (console: xám #9ca3af, text-sm). */
  subtitle?: string | null;
  /** Nền canvas #0B1020 (navy) + header cùng tông — Dashboard / Báo cáo. */
  consoleChrome?: boolean;
  /** Cụm bên phải header (pill ngày + user, …). */
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
};

function SiderBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={[
        'flex items-center border-b border-white/6',
        collapsed ? 'justify-center px-3 py-5' : 'gap-3 px-5 py-5',
      ].join(' ')}
    >
      <span
        className="flex size-10 shrink-0 rounded-xl bg-nova-gold shadow-[0_6px_18px_rgba(212,175,55,0.14)]"
        aria-hidden
      />
      {collapsed ? null : (
        <div className="min-w-0">
          <div className="truncate text-[15px] font-bold leading-tight tracking-tight text-white">
            NovaLimo
          </div>
          <div className="mt-0.5 truncate text-[12px] font-normal leading-tight text-[#9ca3af]">
            Admin Console
          </div>
        </div>
      )}
    </div>
  );
}

function SiderFooter({
  collapsed,
  onToggleCollapsed,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  return (
    <div className="border-t border-white/6 px-4 py-3">
      <div className={collapsed ? 'flex justify-center' : 'flex items-center justify-between gap-3'}>
        {collapsed ? null : (
          <p className="truncate text-[11px] font-normal leading-normal text-[#6b7280]">
            Phiên bản 1.0.0 • cập nhật 04/2026
          </p>
        )}
        <Button
          type="text"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          className={[
            'inline-flex! min-h-9! min-w-9! items-center justify-center rounded-xl',
            'text-white/80! hover:bg-white/10! hover:text-white!',
          ].join(' ')}
          icon={collapsed ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
        />
      </div>
    </div>
  );
}

export function AdminShell({
  title,
  subtitle = null,
  consoleChrome = false,
  headerExtra,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const selectedKey = useSelectedNavKey(pathname);
  const isMobile = useIsMobileLg();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const menuPadding = collapsed ? '10px 10px' : '12px 12px';

  const nav = (
    <Menu
      mode="inline"
      theme="dark"
      className={[
        'border-0! bg-transparent!',
        // Tailwind-only styling for AntD Menu DOM (no global CSS selectors)
        '[&.ant-menu-dark]:p-0',
        '[&_.ant-menu-item]:my-[3px]',
        '[&_.ant-menu-item]:h-10',
        '[&_.ant-menu-item]:leading-10',
        '[&_.ant-menu-item]:rounded-xl',
        collapsed
          ? '[&_.ant-menu-item]:px-3 [&_.ant-menu-item]:pr-3!'
          : '[&_.ant-menu-item]:px-[14px] [&_.ant-menu-item]:pr-[14px]!',
        '[&_.ant-menu-item]:transition-colors',
        '[&_.ant-menu-item]:duration-150',
        '[&_.ant-menu-item_.anticon]:text-gray-400',
        '[&_.ant-menu-item_a]:font-medium',
        '[&_.ant-menu-item_a]:text-gray-200',
        '[&_.ant-menu-item]:hover:bg-white/4',
        '[&_.ant-menu-item-selected]:bg-white/5!',
        '[&_.ant-menu-item-selected]:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]',
        '[&_.ant-menu-item-selected_.ant-menu-title-content]:font-semibold',
        '[&_.ant-menu-item-selected_.ant-menu-title-content]:text-nova-gold!',
        '[&_.ant-menu-item-selected_a]:font-semibold',
        '[&_.ant-menu-item-selected_a]:text-nova-gold!',
        '[&_.ant-menu-item-selected_.anticon]:text-nova-gold!',
      ].join(' ')}
      selectedKeys={[selectedKey]}
      inlineCollapsed={!isMobile && collapsed}
      style={{ borderRight: 0, background: 'transparent', padding: menuPadding }}
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
        <Sider
          width={260}
          collapsedWidth={92}
          collapsed={collapsed}
          theme="dark"
          trigger={null}
          className="nova-admin-sider"
          style={siderStyle}
        >
          <div className="flex h-full min-h-0 flex-col">
            <SiderBrand collapsed={collapsed} />
            <div className="flex-1">{nav}</div>
            <SiderFooter collapsed={collapsed} onToggleCollapsed={() => setCollapsed((v) => !v)} />
          </div>
        </Sider>
      )}

      <Layout
        className={`min-w-0 ${consoleChrome ? 'min-h-screen bg-nova-navy' : ''}`}
      >
        <Header
          className={
            consoleChrome
              ? 'relative flex h-auto! min-h-20 shrink-0 items-center overflow-visible border-b border-white/6 bg-nova-navy! px-8! py-4! md:px-10! md:py-5!'
              : 'flex min-h-14 items-center border-b border-slate-200/80 bg-white! px-3! py-3! sm:px-4!'
          }
          style={{
            lineHeight: 'unset',
            backgroundColor: consoleChrome ? ADMIN_CONSOLE_BG : '#ffffff',
          }}
        >
          {consoleChrome ? (
            <>
              <div
                className="pointer-events-none"
                aria-hidden
              />
              <div className="relative flex w-full items-center justify-between gap-6">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {isMobile ? (
                    <Button
                      type="text"
                      className="inline-flex! min-h-10! min-w-10! shrink-0 items-center justify-center text-white! hover:bg-white/10!"
                      icon={<MenuOutlined className="text-lg" />}
                      onClick={() => setDrawerOpen(true)}
                      aria-label="Mở menu"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <Typography.Title
                      level={3}
                      className="m-0! text-[22px]! font-black! leading-tight! tracking-tight! text-white!"
                    >
                      {title}
                    </Typography.Title>
                    {subtitle ? (
                      <Typography.Text className="mt-1 block text-[12px] font-medium leading-snug text-nova-muted!">
                        {subtitle}
                      </Typography.Text>
                    ) : null}
                  </div>
                </div>
                {headerExtra ? (
                  <div className="relative flex shrink-0 items-center justify-end self-center">
                    {headerExtra}
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <div className="flex w-full items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                {isMobile ? (
                  <Button
                    type="text"
                    className="inline-flex! min-h-11! min-w-11! items-center justify-center"
                    icon={<MenuOutlined className="text-lg" />}
                    onClick={() => setDrawerOpen(true)}
                    aria-label="Mở menu"
                  />
                ) : null}
                <div className="min-w-0">
                  <Typography.Text strong className="truncate text-sm sm:text-base">
                    {title}
                  </Typography.Text>
                </div>
              </div>
            </div>
          )}
        </Header>

        <Content
          className={
            consoleChrome
              ? 'min-h-[calc(100dvh-7.5rem)] bg-nova-navy p-6 md:p-8'
              : 'p-3 sm:p-4 md:p-6'
          }
          style={consoleChrome ? undefined : { background: NOVA_BRAND.slateLayoutBg }}
        >
          {children}
        </Content>
      </Layout>

      <Drawer
        title={<span className="font-bold text-white">Menu</span>}
        placement="left"
        size={280}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{
          body: { padding: 0, background: ADMIN_SIDEBAR_BG },
          header: {
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: ADMIN_SIDEBAR_BG,
          },
        }}
        className="[&_.ant-drawer-title]:text-white"
      >
        <div className="flex max-h-dvh flex-col">
          <SiderBrand collapsed={false} />
          <div className="flex-1">{nav}</div>
          <SiderFooter collapsed={false} onToggleCollapsed={() => setCollapsed(false)} />
        </div>
      </Drawer>
    </Layout>
  );
}
