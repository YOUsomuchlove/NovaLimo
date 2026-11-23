'use client';

import type {
  IncidentDto,
  Permission,
} from '@limousine-workspace/shared-types';
import {
  Avatar,
  Badge,
  Button,
  Field,
  Input,
  Kbd,
  StatusTag,
  cn,
  useToast,
} from '@limousine-workspace/shared-ui';
import { RealtimeEvents } from '@limousine-workspace/utils-core';
import { Drawer, Dropdown, Modal } from 'antd';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Bus,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileSpreadsheet,
  Headphones,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Network,
  Package,
  Radar,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { adminApi, getAdminToken } from '../../lib/api';
import { getAdminSocket } from '../../lib/socket';
import { useAdminAuth } from './AdminAuthContext';

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
  | 'audit';

interface NavItem {
  key: AdminNavKey;
  href: string;
  label: string;
  group: string;
  icon: ReactNode;
  permission?: Permission;
  keywords?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'dashboard',
    href: '/dashboard',
    label: 'Dashboard',
    group: 'Điều hành',
    icon: <LayoutDashboard className="size-4" />,
    permission: 'dashboard.view',
    keywords: 'tong quan kpi doanh thu',
  },
  {
    key: 'dispatch',
    href: '/dispatch',
    label: 'Điều phối',
    group: 'Điều hành',
    icon: <Network className="size-4" />,
    permission: 'dispatch.manage',
    keywords: 'smart dispatch xep xe ro cho trip batch',
  },
  {
    key: 'trip-runs',
    href: '/trip-runs',
    label: 'Chuyến',
    group: 'Điều hành',
    icon: <Clock className="size-4" />,
    permission: 'trip.read',
    keywords: 'trip runs chuyen chay phoi lenh manifest',
  },
  {
    key: 'monitor',
    href: '/monitor',
    label: 'Giám sát',
    group: 'Điều hành',
    icon: <Radar className="size-4" />,
    permission: 'dispatch.manage',
    keywords: 'command center gps ban do sos',
  },
  {
    key: 'bookings',
    href: '/bookings',
    label: 'Đơn hàng',
    group: 'Kinh doanh & CS',
    icon: <ShoppingBag className="size-4" />,
    permission: 'booking.read',
    keywords: 've hanh khach dat ve booking',
  },
  {
    key: 'cargos',
    href: '/cargos',
    label: 'Hàng hóa',
    group: 'Kinh doanh & CS',
    icon: <Package className="size-4" />,
    permission: 'cargo.read',
    keywords: 'ky gui van don cod ban giao',
  },
  {
    key: 'call-center',
    href: '/call-center',
    label: 'Tổng đài/CS',
    group: 'Kinh doanh & CS',
    icon: <Headphones className="size-4" />,
    permission: 'support.manage',
    keywords: 'tong dai tao ve thu cong yeu cau chat ho tro',
  },
  {
    key: 'customers',
    href: '/customers',
    label: 'Khách hàng',
    group: 'Kinh doanh & CS',
    icon: <Users className="size-4" />,
    permission: 'customer.read',
    keywords: 'crm vip blacklist khach hang',
  },
  {
    key: 'vehicles',
    href: '/vehicles',
    label: 'Đội xe & Tài xế',
    group: 'Tài sản & Tài chính',
    icon: <Bus className="size-4" />,
    permission: 'fleet.read',
    keywords: 'xe phuong tien tai xe driver bien so',
  },
  {
    key: 'finance',
    href: '/finance',
    label: 'Tài chính',
    group: 'Tài sản & Tài chính',
    icon: <Wallet className="size-4" />,
    permission: 'finance.read',
    keywords: 'so quy thu chi doi soat giao dich',
  },
  {
    key: 'reports',
    href: '/reports',
    label: 'Báo cáo',
    group: 'Tài sản & Tài chính',
    icon: <BarChart3 className="size-4" />,
    permission: 'report.view',
    keywords: 'bao cao doanh thu chuyen hang hoa tai xe',
  },
  {
    key: 'settings',
    href: '/settings',
    label: 'Cấu hình',
    group: 'Hệ thống',
    icon: <Settings className="size-4" />,
    permission: 'settings.manage',
    keywords: 'tuyen diem dung khung gio gia cod thong bao',
  },
  {
    key: 'rbac',
    href: '/rbac',
    label: 'Phân quyền',
    group: 'Hệ thống',
    icon: <ShieldCheck className="size-4" />,
    permission: 'rbac.manage',
    keywords: 'users roles permissions nhan vien',
  },
  {
    key: 'audit',
    href: '/audit',
    label: 'Audit Log',
    group: 'Hệ thống',
    icon: <FileSpreadsheet className="size-4" />,
    permission: 'audit.read',
    keywords: 'nhat ky kiem toan lich su thao tac',
  },
];

const QUICK_COMMANDS: { label: string; href: string; group: string }[] = [
  ...NAV_ITEMS.map((n) => ({ label: n.label, href: n.href, group: n.group })),
  {
    label: 'Tạo đơn vé hành khách mới',
    href: '/bookings/new',
    group: 'Thao tác nhanh',
  },
  {
    label: 'Tạo vận đơn ký gửi mới',
    href: '/cargos/new',
    group: 'Thao tác nhanh',
  },
  {
    label: 'Đối soát COD tài xế',
    href: '/cargos/cod-reconcile',
    group: 'Thao tác nhanh',
  },
  {
    label: 'Bàn giao trung chuyển hàng hóa',
    href: '/cargos/handoff',
    group: 'Thao tác nhanh',
  },
  {
    label: 'Thêm phương tiện mới',
    href: '/vehicles/new',
    group: 'Thao tác nhanh',
  },
  {
    label: 'Danh sách Tài xế',
    href: '/vehicles/drivers',
    group: 'Thao tác nhanh',
  },
  {
    label: 'Thêm Tài xế mới',
    href: '/vehicles/drivers/new',
    group: 'Thao tác nhanh',
  },
  {
    label: 'Design System (Dev)',
    href: '/dev/design-system',
    group: 'Hệ thống',
  },
];

function resolveSelectedKey(pathname: string | null): AdminNavKey {
  const p = pathname ?? '/dashboard';
  const prefixes: [string, AdminNavKey][] = [
    ['/dashboard', 'dashboard'],
    ['/dispatch', 'dispatch'],
    ['/trip-runs', 'trip-runs'],
    ['/bookings', 'bookings'],
    ['/cargos', 'cargos'],
    ['/customers', 'customers'],
    ['/vehicles', 'vehicles'],
    ['/finance', 'finance'],
    ['/monitor', 'monitor'],
    ['/tracking', 'monitor'],
    ['/call-center', 'call-center'],
    ['/reports', 'reports'],
    ['/settings', 'settings'],
    ['/audit', 'audit'],
    ['/rbac', 'rbac'],
    ['/users', 'rbac'],
  ];
  for (const [prefix, key] of prefixes) {
    if (p === prefix || p.startsWith(`${prefix}/`)) return key;
  }
  return 'dashboard';
}

export interface AdminShellProps {
  title: string;
  subtitle?: string | null;
  consoleChrome?: boolean;
  headerExtra?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  children: ReactNode;
}

export function AdminShell({
  title,
  subtitle = null,
  headerExtra,
  breadcrumbs,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const {
    user,
    loading: authLoading,
    isAuthenticated,
    hasPermission,
    signOut,
  } = useAdminAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated && !getAdminToken()) {
      const next = encodeURIComponent(pathname || '/dashboard');
      router.replace(`/login?next=${next}`);
    }
  }, [authLoading, isAuthenticated, pathname, router]);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');
  const [pwdOpen, setPwdOpen] = useState(false);
  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);

  const [socketConnected, setSocketConnected] = useState(false);
  const [incidentsOpen, setIncidentsOpen] = useState(false);
  const [openIncidents, setOpenIncidents] = useState<IncidentDto[]>([]);

  const selectedKey = useMemo(() => resolveSelectedKey(pathname), [pathname]);

  const visibleNav = useMemo(
    () => NAV_ITEMS.filter((it) => hasPermission(it.permission)),
    [hasPermission],
  );

  const loadIncidents = useCallback(async () => {
    if (!getAdminToken()) return;
    try {
      const res = await adminApi.incidents({ status: 'OPEN', limit: 10 });
      setOpenIncidents(res.items);
    } catch {
      // ignore if user lacks dispatch.manage permission or API offline
    }
  }, []);

  useEffect(() => {
    void loadIncidents();
  }, [loadIncidents]);

  useEffect(() => {
    if (!getAdminToken()) return;
    const s = getAdminSocket();
    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    const onIncident = (inc: IncidentDto) => {
      toast.warning(
        `SOS / Sự cố mới từ tài xế ${inc.driver.full_name}: ${inc.description}`,
      );
      void loadIncidents();
    };
    setSocketConnected(s.connected);
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on(RealtimeEvents.incidentReported, onIncident);
    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off(RealtimeEvents.incidentReported, onIncident);
    };
  }, [loadIncidents, toast]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filteredCommands = useMemo(() => {
    const q = cmdQuery.trim().toLowerCase();
    if (!q) return QUICK_COMMANDS;
    return QUICK_COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.href.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q),
    );
  }, [cmdQuery]);

  const handlePasswordChange = async () => {
    if (!curPwd || newPwd.length < 8) {
      toast.error('Mật khẩu mới cần ít nhất 8 ký tự (có chữ và số)');
      return;
    }
    setPwdSaving(true);
    try {
      await adminApi.changePassword({
        current_password: curPwd,
        new_password: newPwd,
      });
      toast.success('Đã đổi mật khẩu thành công');
      setPwdOpen(false);
      setCurPwd('');
      setNewPwd('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Đổi mật khẩu thất bại');
    } finally {
      setPwdSaving(false);
    }
  };

  const renderSidebarContent = (
    isCollapsed: boolean,
    onNavigate?: () => void,
  ) => (
    <div className="flex h-full flex-col bg-surface-1 text-fg">
      {/* Brand header */}
      <div
        className={cn(
          'flex h-20 shrink-0 items-center border-b border-border-subtle',
          isCollapsed ? 'justify-center px-3' : 'gap-3 px-5',
        )}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
          onClick={onNavigate}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-brand font-bold text-on-brand shadow-brand">
            NL
          </span>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold leading-tight tracking-tight text-fg">
                NovaLimo
              </p>
              <p className="mt-0.5 truncate text-xs text-fg-muted">
                Admin Console
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Menu items */}
      <nav
        aria-label="Điều hướng quản trị"
        className="flex-1 overflow-y-auto px-3 py-4"
      >
        <ul className="flex flex-col gap-1">
          {visibleNav.map((item) => {
            const active = selectedKey === item.key;
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    'group flex h-10 items-center rounded-control text-ui font-medium transition-colors',
                    isCollapsed ? 'justify-center px-2.5' : 'gap-3 px-3.5',
                    active
                      ? 'bg-brand-subtle font-semibold text-brand-fg ring-1 ring-inset ring-brand-border'
                      : 'text-fg-secondary hover:bg-surface-2 hover:text-fg',
                  )}
                >
                  <span
                    className={cn(
                      'shrink-0 transition-colors',
                      active
                        ? 'text-brand-fg'
                        : 'text-fg-muted group-hover:text-fg',
                    )}
                  >
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sidebar footer */}
      <div className="border-t border-border-subtle px-4 py-3">
        <div
          className={cn(
            'flex items-center',
            isCollapsed ? 'justify-center' : 'justify-between gap-2',
          )}
        >
          {!isCollapsed && (
            <p className="truncate text-[11px] text-fg-muted">
              Phiên bản 2.0 · API v2
            </p>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={isCollapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
            className="hidden size-8 items-center justify-center rounded-control text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg lg:inline-flex"
          >
            {isCollapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-canvas text-fg">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'no-print sticky top-0 hidden h-dvh shrink-0 border-r border-border-subtle bg-surface-1 transition-[width] duration-200 lg:block',
          collapsed ? 'w-[84px]' : 'w-[260px]',
        )}
      >
        {renderSidebarContent(collapsed)}
      </aside>

      {/* Mobile Sidebar Drawer */}
      <Drawer
        placement="left"
        size={270}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        closable={false}
        styles={{ body: { padding: 0 } }}
      >
        {renderSidebarContent(false, () => setMobileOpen(false))}
      </Drawer>

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="no-print sticky top-0 z-30 flex min-h-20 shrink-0 items-center justify-between gap-4 border-b border-border-subtle bg-canvas/90 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Mở menu"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-control border border-border-subtle bg-surface-1 text-fg hover:bg-surface-2 lg:hidden"
            >
              <MenuIcon className="size-5" />
            </button>

            <div className="min-w-0">
              {breadcrumbs && breadcrumbs.length > 0 && (
                <nav
                  aria-label="Breadcrumb"
                  className="mb-1 flex items-center gap-1.5 text-xs text-fg-muted"
                >
                  {breadcrumbs.map((b, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      {b.href ? (
                        <Link
                          href={b.href}
                          className="transition-colors hover:text-fg"
                        >
                          {b.label}
                        </Link>
                      ) : (
                        <span className="text-fg-secondary">{b.label}</span>
                      )}
                      {i < breadcrumbs.length - 1 && <span>·</span>}
                    </span>
                  ))}
                </nav>
              )}
              <h1 className="truncate text-lg font-bold tracking-tight text-fg sm:text-[22px] sm:leading-7">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-0.5 truncate text-xs text-fg-muted">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
            {headerExtra}

            {/* Quick Search ⌘K */}
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="hidden h-9 items-center gap-2.5 rounded-control border border-border-subtle bg-surface-1 px-3 text-xs text-fg-muted transition-colors hover:border-border-strong hover:text-fg md:inline-flex"
            >
              <Search className="size-3.5" />
              <span>Tìm nhanh…</span>
              <span className="flex items-center gap-0.5">
                <Kbd>Ctrl</Kbd>
                <Kbd>K</Kbd>
              </span>
            </button>

            {/* Socket status chip */}
            <Link
              href="/monitor"
              title={
                socketConnected
                  ? 'Socket.io /realtime đã kết nối'
                  : 'Socket.io đang chờ kết nối'
              }
              className="hidden items-center gap-1.5 rounded-pill border border-border-subtle bg-surface-1 px-2.5 py-1 text-[11px] font-semibold sm:inline-flex"
            >
              <span
                className={cn(
                  'size-2 rounded-full',
                  socketConnected
                    ? 'bg-success-solid animate-pulse'
                    : 'bg-fg-disabled',
                )}
              />
              <span className="text-fg-secondary">LIVE</span>
            </Link>

            {/* SOS / Incident Bell */}
            <button
              type="button"
              onClick={() => setIncidentsOpen(true)}
              aria-label="Thông báo & cảnh báo SOS"
              className="relative inline-flex size-9 items-center justify-center rounded-control border border-border-subtle bg-surface-1 text-fg-secondary transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <Bell className="size-4" />
              {openIncidents.length > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-danger-solid text-[10px] font-bold text-white">
                  {openIncidents.length}
                </span>
              )}
            </button>

            {/* User Profile Dropdown */}
            <Dropdown
              trigger={['click']}
              menu={{
                items: [
                  {
                    key: 'info',
                    disabled: true,
                    label: (
                      <div className="py-1">
                        <p className="text-xs font-semibold text-fg">
                          {user?.full_name ?? 'Admin Nova'}
                        </p>
                        <p className="text-[11px] text-fg-muted">
                          {user?.phone ?? 'Quản trị viên'}
                        </p>
                      </div>
                    ),
                  },
                  { type: 'divider' },
                  {
                    key: 'pwd',
                    icon: <KeyRound className="size-3.5" />,
                    label: 'Đổi mật khẩu',
                    onClick: () => setPwdOpen(true),
                  },
                  {
                    key: 'rbac',
                    icon: <ShieldCheck className="size-3.5" />,
                    label: 'Phân quyền & Tài khoản',
                    onClick: () => router.push('/rbac'),
                  },
                  {
                    key: 'ds',
                    icon: <Sparkles className="size-3.5" />,
                    label: 'Design System',
                    onClick: () => router.push('/dev/design-system'),
                  },
                  { type: 'divider' },
                  {
                    key: 'logout',
                    danger: true,
                    icon: <LogOut className="size-3.5" />,
                    label: 'Đăng xuất',
                    onClick: async () => {
                      await signOut();
                      toast.info('Đã đăng xuất');
                      router.push('/login');
                    },
                  },
                ],
              }}
            >
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-pill border border-border-subtle bg-surface-1 py-1 pl-1.5 pr-3 text-left transition-colors hover:border-border-strong hover:bg-surface-2"
              >
                <Avatar
                  name={user?.full_name ?? 'Admin Nova'}
                  src={user?.avatar_url}
                  size={28}
                  status="online"
                />
                <span className="hidden max-w-[120px] truncate text-xs font-semibold text-fg sm:inline">
                  {user?.full_name ?? 'Admin Nova'}
                </span>
              </button>
            </Dropdown>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {authLoading || !isAuthenticated ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 text-sm text-fg-muted">
              <div className="size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
              <span>Đang xác thực phiên quản trị…</span>
            </div>
          ) : (
            children
          )}
        </main>

        {/* Footer */}
        <footer className="no-print flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle px-4 py-4 text-xs text-fg-muted sm:px-8">
          <span>© 2026 NovaLimo · Trung tâm Quản trị & Điều hành</span>
          <div className="flex items-center gap-4">
            <Link href="/monitor" className="hover:text-fg">
              Command Center
            </Link>
            <Link href="/dispatch" className="hover:text-fg">
              Smart Dispatch
            </Link>
            <Link href="/audit" className="hover:text-fg">
              Audit Log
            </Link>
          </div>
        </footer>
      </div>

      {/* Command Palette Modal (⌘K) */}
      <Modal
        open={cmdOpen}
        onCancel={() => setCmdOpen(false)}
        footer={null}
        title="Tìm kiếm & Chuyển trang nhanh (Ctrl+K)"
        width={560}
      >
        <div className="mt-2 flex flex-col gap-3">
          <Input
            autoFocus
            value={cmdQuery}
            onChange={(e) => setCmdQuery(e.target.value)}
            placeholder="Nhập tên màn hình, thao tác, hoặc đường dẫn…"
            leftIcon={<Search className="size-4" />}
          />
          <div className="max-h-80 overflow-y-auto rounded-control border border-border-subtle divide-y divide-border-subtle">
            {filteredCommands.length === 0 ? (
              <p className="p-4 text-center text-sm text-fg-muted">
                Không tìm thấy kết quả phù hợp
              </p>
            ) : (
              filteredCommands.map((cmd) => (
                <button
                  key={cmd.href + cmd.label}
                  type="button"
                  onClick={() => {
                    setCmdOpen(false);
                    setCmdQuery('');
                    router.push(cmd.href);
                  }}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-surface-2"
                >
                  <div>
                    <p className="text-sm font-medium text-fg">{cmd.label}</p>
                    <p className="text-xs text-fg-muted">{cmd.group}</p>
                  </div>
                  <code className="rounded-tag bg-surface-3 px-2 py-0.5 font-mono text-xs text-fg-secondary">
                    {cmd.href}
                  </code>
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* SOS / Incidents Drawer */}
      <Drawer
        title="Cảnh báo SOS & Sự cố vận hành"
        placement="right"
        size={400}
        open={incidentsOpen}
        onClose={() => setIncidentsOpen(false)}
      >
        <div className="flex flex-col gap-4">
          {openIncidents.length === 0 ? (
            <div className="rounded-card border border-border-subtle bg-surface-2 p-6 text-center">
              <p className="text-sm font-medium text-fg">
                Không có sự cố SOS nào đang mở
              </p>
              <p className="mt-1 text-xs text-fg-muted">
                Mọi chuyến xe đang vận hành bình thường.
              </p>
            </div>
          ) : (
            openIncidents.map((inc) => (
              <div
                key={inc.id}
                className="rounded-card border border-danger-border bg-danger-bg/30 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-danger-fg" />
                    <span className="text-sm font-semibold text-fg">
                      {inc.driver.full_name}
                    </span>
                  </div>
                  <StatusTag domain="incident" status={inc.status} />
                </div>
                <p className="mt-2 text-sm text-fg-secondary">
                  {inc.description}
                </p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <Badge tone="neutral">{inc.kind}</Badge>
                  <Link
                    href="/monitor"
                    onClick={() => setIncidentsOpen(false)}
                    className="text-xs font-semibold text-brand-fg hover:underline"
                  >
                    Mở Command Center →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </Drawer>

      {/* Change Password Modal */}
      <Modal
        open={pwdOpen}
        onCancel={() => setPwdOpen(false)}
        title="Đổi mật khẩu tài khoản quản trị"
        footer={null}
      >
        <div className="mt-4 flex flex-col gap-4">
          <Field label="Mật khẩu hiện tại" required>
            {(p) => (
              <Input
                {...p}
                type="password"
                value={curPwd}
                onChange={(e) => setCurPwd(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
              />
            )}
          </Field>
          <Field
            label="Mật khẩu mới"
            required
            hint="Tối thiểu 8 ký tự, bao gồm cả chữ và số"
          >
            {(p) => (
              <Input
                {...p}
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Nhập mật khẩu mới"
              />
            )}
          </Field>
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPwdOpen(false)}>
              Hủy
            </Button>
            <Button loading={pwdSaving} onClick={handlePasswordChange}>
              Lưu mật khẩu
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
