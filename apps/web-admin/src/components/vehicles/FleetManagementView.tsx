'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Input, Select, Table, Tabs, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { AdminDarkPanel } from '@limousine-workspace/shared-ui/legacy';

export type FleetTabKey = 'vehicles' | 'drivers';

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

const TW = {
  tabs: cx(
    // Tailwind skin for AntD Tabs
    '[&_.ant-tabs-nav]:mb-3',
    '[&_.ant-tabs-nav::before]:border-white/6',
    '[&_.ant-tabs-tab]:text-[12px]',
    '[&_.ant-tabs-tab]:font-semibold',
    '[&_.ant-tabs-tab]:text-white/70',
    '[&_.ant-tabs-tab:hover]:text-white',
    '[&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:text-nova-gold!',
    '[&_.ant-tabs-ink-bar]:bg-nova-gold!',
  ),
  searchInput: cx(
    'w-[340px]! sm:w-[420px]!',
    // AntD Input uses affix wrapper -> style wrapper + inner input
    'h-10! rounded-xl! border-white/10! bg-white/5! text-white!',
    '[&.ant-input-affix-wrapper]:bg-white/5!',
    '[&.ant-input-affix-wrapper]:border-white/10!',
    '[&.ant-input-affix-wrapper]:shadow-none!',
    '[&.ant-input-affix-wrapper:hover]:border-white/20!',
    '[&_.ant-input]:bg-transparent! [&_.ant-input]:text-white/85!',
    '[&_.ant-input::placeholder]:text-white/35',
    '[&_.ant-input-prefix]:text-white/55',
  ),
  statusSelect: cx(
    'w-[170px]!',
    '[&_.ant-select-selector]:rounded-xl!',
    '[&_.ant-select-selector]:border-white/10!',
    '[&_.ant-select-selector]:bg-white/5!',
    '[&_.ant-select-selector]:text-white/85!',
    '[&_.ant-select-selector]:h-10!',
    '[&_.ant-select-selection-item]:leading-[38px]!',
    '[&_.ant-select-selection-item]:text-white/85!',
    '[&_.ant-select-selection-placeholder]:text-white/45!',
    '[&_.ant-select-arrow]:text-white/60!',
  ),
  statusSelectPopup: cx(
    'rounded-xl border border-white/10 bg-[#0b1020]',
    '[&_.ant-select-item]:text-white/80',
    '[&_.ant-select-item-option-active]:bg-white/5',
    '[&_.ant-select-item-option-selected]:bg-white/8',
    '[&_.ant-select-item-option-selected]:text-nova-gold',
  ),
  refreshBtn: cx(
    'inline-flex! min-h-10! min-w-10! items-center justify-center rounded-xl',
    'border border-white/10',
    'bg-white/5 text-white/70!',
    'hover:bg-white/10! hover:text-white!',
  ),
  primaryBtn: cx(
    'h-10! rounded-xl!',
    'border-0!',
    'bg-nova-gold! text-black!',
    'hover:bg-[#c9a85c]!',
    'font-bold!',
  ),
  table: cx(
    // Remove AntD white surfaces (important)
    '[&.ant-table-wrapper]:bg-transparent!',
    '[&_.ant-spin-container]:bg-transparent!',
    '[&_.ant-table]:bg-transparent!',
    '[&_.ant-table-content]:bg-transparent!',
    // Table container (dark)
    '[&_.ant-table-container]:bg-[#070b18]!',
    '[&_.ant-table-container]:rounded-xl',
    '[&_.ant-table-container]:border',
    '[&_.ant-table-container]:border-white/10',
    // Header cells
    '[&_.ant-table-thead_th.ant-table-cell]:bg-white/5!',
    '[&_.ant-table-thead_th.ant-table-cell]:text-white/60!',
    '[&_.ant-table-thead_th.ant-table-cell]:text-[11px]!',
    '[&_.ant-table-thead_th.ant-table-cell]:font-semibold!',
    '[&_.ant-table-thead_th.ant-table-cell]:border-white/6!',
    '[&_.ant-table-thead_th.ant-table-cell]:before:bg-white/10',
    // Body cells
    '[&_.ant-table-tbody_td.ant-table-cell]:bg-transparent!',
    '[&_.ant-table-tbody_td.ant-table-cell]:border-white/6!',
    '[&_.ant-table-tbody_td.ant-table-cell]:text-[12px]!',
    '[&_.ant-table-tbody_td.ant-table-cell]:text-white/80!',
    '[&_.ant-table-tbody_tr.ant-table-row:hover_td.ant-table-cell]:bg-white/4!',
    // Pagination layout + colors
    '[&_.ant-pagination]:mt-4',
    '[&_.ant-pagination]:items-center',
    '[&_.ant-pagination]:gap-3',
    '[&_.ant-pagination]:text-white/70',
    // make total text a bit more legible (as in mock)
    '[&_.ant-pagination-total-text]:text-white/55',
    '[&_.ant-pagination-total-text]:text-[11px]',
    '[&_.ant-pagination-total-text]:font-medium',
    '[&_.ant-pagination-total-text]:whitespace-nowrap',
    '[&_.ant-pagination-total-text]:justify-self-start',
    '[&_.ant-pagination-total-text]:pr-2',
    // center pager (ul)
    '[&_.ant-pagination>ul]:justify-self-center',
    '[&_.ant-pagination>ul]:flex',
    '[&_.ant-pagination>ul]:items-center',
    '[&_.ant-pagination>ul]:gap-2',
    // pager buttons (dark pill style)
    '[&_.ant-pagination-item]:rounded-lg',
    '[&_.ant-pagination-item]:border',
    '[&_.ant-pagination-item]:border-white/10',
    '[&_.ant-pagination-item]:bg-[#0b1020]!',
    '[&_.ant-pagination-item_a]:text-white/70',
    '[&_.ant-pagination-item_a]:outline-none',
    '[&_.ant-pagination-item:hover]:border-white/20',
    '[&_.ant-pagination-item:hover_a]:text-white',
    '[&_.ant-pagination-item:focus-within]:border-white/25',
    // active page: gold fill + black text
    '[&_.ant-pagination-item-active]:border-nova-gold!',
    '[&_.ant-pagination-item-active]:bg-nova-gold!',
    '[&_.ant-pagination-item-active_a]:text-black!',
    // "..." jump buttons (make them match pills)
    '[&_.ant-pagination-jump-next]:rounded-lg',
    '[&_.ant-pagination-jump-prev]:rounded-lg',
    '[&_.ant-pagination-jump-next]:border',
    '[&_.ant-pagination-jump-prev]:border',
    '[&_.ant-pagination-jump-next]:border-white/10',
    '[&_.ant-pagination-jump-prev]:border-white/10',
    '[&_.ant-pagination-jump-next]:bg-[#0b1020]!',
    '[&_.ant-pagination-jump-prev]:bg-[#0b1020]!',
    '[&_.ant-pagination-jump-next:hover]:border-white/20',
    '[&_.ant-pagination-jump-prev:hover]:border-white/20',
    '[&_.ant-pagination-jump-next_.ant-pagination-item-container]:text-white/55',
    '[&_.ant-pagination-jump-prev_.ant-pagination-item-container]:text-white/55',
    '[&_.ant-pagination-jump-next:hover_.ant-pagination-item-container]:text-white/75',
    '[&_.ant-pagination-jump-prev:hover_.ant-pagination-item-container]:text-white/75',
    '[&_.ant-pagination-jump-next:focus-within]:border-white/25',
    '[&_.ant-pagination-jump-prev:focus-within]:border-white/25',
    // prev/next buttons
    '[&_.ant-pagination-prev]:rounded-lg',
    '[&_.ant-pagination-next]:rounded-lg',
    '[&_.ant-pagination-prev]:border',
    '[&_.ant-pagination-next]:border',
    '[&_.ant-pagination-prev]:border-white/10',
    '[&_.ant-pagination-next]:border-white/10',
    '[&_.ant-pagination-prev]:bg-[#0b1020]',
    '[&_.ant-pagination-next]:bg-[#0b1020]',
    '[&_.ant-pagination-prev:hover]:border-white/20',
    '[&_.ant-pagination-next:hover]:border-white/20',
    '[&_.ant-pagination-prev_.ant-pagination-item-link]:bg-transparent!',
    '[&_.ant-pagination-next_.ant-pagination-item-link]:bg-transparent!',
    '[&_.ant-pagination-prev_.ant-pagination-item-link]:border-0!',
    '[&_.ant-pagination-next_.ant-pagination-item-link]:border-0!',
    '[&_.ant-pagination-prev_.ant-pagination-item-link]:text-white/70!',
    '[&_.ant-pagination-next_.ant-pagination-item-link]:text-white/70!',
    '[&_.ant-pagination-prev:hover_.ant-pagination-item-link]:text-white!',
    '[&_.ant-pagination-next:hover_.ant-pagination-item-link]:text-white!',
    // disabled: reduce contrast but keep shape
    '[&_.ant-pagination-disabled]:opacity-45',
    '[&_.ant-pagination-disabled:hover]:border-white/10',
    // Page size changer (no white bg)
    '[&_.ant-pagination-options]:flex',
    '[&_.ant-pagination-options]:items-center',
    '[&_.ant-pagination-options]:gap-2',
    '[&_.ant-pagination-options]:justify-self-end',
    '[&_.ant-pagination-options-size-changer]:bg-transparent!',
    '[&_.ant-pagination-options-size-changer_.ant-select-selector]:h-8!',
    '[&_.ant-pagination-options-size-changer_.ant-select-selector]:rounded-lg!',
    '[&_.ant-pagination-options-size-changer_.ant-select-selector]:border-white/10!',
    // force dark background (avoid white flash)
    '[&_.ant-pagination-options-size-changer_.ant-select-selector]:bg-[#0b1020]!',
    '[&_.ant-pagination-options-size-changer_.ant-select-selector]:shadow-none!',
    '[&_.ant-pagination-options-size-changer_.ant-select-selection-item]:leading-[30px]!',
    '[&_.ant-pagination-options-size-changer_.ant-select-selection-item]:text-white/85!',
    '[&_.ant-pagination-options-size-changer_.ant-select-arrow]:text-white/50!',
  ),
} as const;

type VehicleRow = {
  key: string;
  image?: string | null;
  licensePlate: string;
  vehicleType: string;
  seats: number;
  driver: string;
  phone: string;
  price: string;
  status: 'Sẵn sàng' | 'Đang bảo dưỡng' | 'Đang chạy';
  updatedAt: string;
};

type DriverRow = {
  key: string;
  name: string;
  phone: string;
  email: string;
  username: string;
  password: string;
  mobileApp: 'Đã cấp' | 'Chờ duyệt';
  status: 'Đang chạy' | 'Off ca' | 'Sẵn sàng nhận ca';
  account: 'Hoạt động' | 'Đã khóa';
};

function StatusTag({
  tone,
  children,
}: {
  tone: 'green' | 'amber' | 'red' | 'slate';
  children: React.ReactNode;
}) {
  const cls =
    tone === 'green'
      ? 'border-emerald-500/25 bg-[#0b2517] text-emerald-300'
      : tone === 'amber'
        ? 'border-amber-400/25 bg-[#231a0b] text-amber-200'
        : tone === 'red'
          ? 'border-rose-500/25 bg-[#240b14] text-rose-200'
          : 'border-slate-400/25 bg-white/5 text-slate-200';
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      {children}
    </span>
  );
}

function AvatarStub() {
  return (
    <div
      className={[
        'size-10 rounded-lg ring-1 ring-white/10',
        'bg-[linear-gradient(45deg,rgba(255,255,255,0.06)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.06)_75%,rgba(255,255,255,0.06)),linear-gradient(45deg,rgba(255,255,255,0.06)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.06)_75%,rgba(255,255,255,0.06))]',
        'bg-size-[16px_16px]',
        'bg-position-[0_0,8px_8px]',
      ].join(' ')}
      aria-hidden
    />
  );
}

export function FleetManagementView({
  initialTab = 'vehicles',
}: {
  initialTab?: FleetTabKey;
}) {
  const [tab, setTab] = useState<FleetTabKey>(initialTab);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'ready' | 'running' | 'maint'>(
    'all',
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Demo totals (match mock)
  const totalVehicles = 124;
  const totalDrivers = 86;

  const vehicles: VehicleRow[] = useMemo(
    () => [
      {
        key: '29H-123.45',
        licensePlate: '29H-123.45',
        vehicleType: 'Limousine 9 chỗ',
        seats: 9,
        driver: 'Nguyễn Văn An',
        phone: '0123 456 789',
        price: '124.500',
        status: 'Sẵn sàng',
        updatedAt: '02/04 14:20',
      },
      {
        key: '30A-778.88',
        licensePlate: '30A-778.88',
        vehicleType: 'Limousine 11 chỗ',
        seats: 11,
        driver: '—',
        phone: '—',
        price: '89.200',
        status: 'Đang bảo dưỡng',
        updatedAt: '01/04 09:00',
      },
      {
        key: '51B-999.01',
        licensePlate: '51B-999.01',
        vehicleType: 'Limousine 19 chỗ',
        seats: 19,
        driver: 'Phạm Văn Đức',
        phone: '0909 000 111',
        price: '210.000',
        status: 'Đang chạy',
        updatedAt: '03/04 14:05',
      },
      {
        key: '37F-112.00',
        licensePlate: '37F-112.00',
        vehicleType: 'Limousine 7 chỗ VIP',
        seats: 7,
        driver: 'Lê Hoàng Cường',
        phone: '0903 000 555',
        price: '210.000',
        status: 'Sẵn sàng',
        updatedAt: '03/04 14:13',
      },
    ],
    [],
  );

  const drivers: DriverRow[] = useMemo(
    () => [
      {
        key: 'an',
        name: 'Nguyễn Văn An',
        phone: '0912 *** **78',
        email: 'an.nv@novalimo.vn',
        username: 'an.nv.driver',
        password: '********',
        mobileApp: 'Đã cấp',
        status: 'Đang chạy',
        account: 'Hoạt động',
      },
      {
        key: 'binh',
        name: 'Trần Thị Binh',
        phone: '0988 *** **01',
        email: 'binh.tt@novalimo.vn',
        username: 'binh.tt.driver',
        password: '********',
        mobileApp: 'Chờ duyệt',
        status: 'Off ca',
        account: 'Đã khóa',
      },
      {
        key: 'cuong',
        name: 'Lê Hoàng Cường',
        phone: '0903 *** **55',
        email: 'cuong.lh@novalimo.vn',
        username: 'cuong.lh.driver',
        password: '********',
        mobileApp: 'Đã cấp',
        status: 'Sẵn sàng nhận ca',
        account: 'Hoạt động',
      },
    ],
    [],
  );

  const filteredVehicles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vehicles.filter((v) => {
      const statusOk =
        status === 'all' ||
        (status === 'ready' && v.status === 'Sẵn sàng') ||
        (status === 'running' && v.status === 'Đang chạy') ||
        (status === 'maint' && v.status === 'Đang bảo dưỡng');
      const qOk =
        !q ||
        v.licensePlate.toLowerCase().includes(q) ||
        v.vehicleType.toLowerCase().includes(q) ||
        v.driver.toLowerCase().includes(q);
      return statusOk && qOk;
    });
  }, [query, status, vehicles]);

  const filteredDrivers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return drivers.filter((d) => {
      const qOk =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.phone.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q);
      return qOk;
    });
  }, [query, drivers]);

  const vehicleColumns: TableColumnsType<VehicleRow> = [
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 72,
      render: () => <AvatarStub />,
    },
    {
      title: 'Biển số',
      dataIndex: 'licensePlate',
      key: 'licensePlate',
      render: (v: string) => (
        <span className="font-semibold text-slate-100">{v}</span>
      ),
    },
    { title: 'Loại xe', dataIndex: 'vehicleType', key: 'vehicleType' },
    { title: 'Sức chứa', dataIndex: 'seats', key: 'seats', width: 90 },
    { title: 'Tài xế phụ trách', dataIndex: 'driver', key: 'driver' },
    { title: 'KM gần nhất', dataIndex: 'price', key: 'price', width: 110 },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (s: VehicleRow['status']) =>
        s === 'Sẵn sàng' ? (
          <StatusTag tone="green">{s}</StatusTag>
        ) : s === 'Đang bảo dưỡng' ? (
          <StatusTag tone="amber">{s}</StatusTag>
        ) : (
          <StatusTag tone="red">{s}</StatusTag>
        ),
    },
    { title: 'Cập nhật', dataIndex: 'updatedAt', key: 'updatedAt', width: 110 },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 90,
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/vehicles/${encodeURIComponent(row.licensePlate)}/edit`}
            className="inline-flex size-8 items-center justify-center rounded-lg text-nova-gold/80 hover:bg-white/5 hover:text-nova-gold"
            aria-label="Sửa"
          >
            <EditOutlined />
          </Link>
          <Link
            href={`/vehicles/${encodeURIComponent(row.licensePlate)}`}
            className="inline-flex size-8 items-center justify-center rounded-lg text-nova-gold/80 hover:bg-white/5 hover:text-nova-gold"
            aria-label="Xem"
          >
            <EyeOutlined />
          </Link>
        </div>
      ),
    },
  ];

  const driverColumns: TableColumnsType<DriverRow> = [
    { title: 'Ảnh', key: 'image', width: 72, render: () => <AvatarStub /> },
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'name',
      render: (v: string) => (
        <span className="font-semibold text-slate-100">{v}</span>
      ),
    },
    { title: 'SĐT', dataIndex: 'phone', key: 'phone', width: 120 },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Tài khoản', dataIndex: 'username', key: 'username', width: 140 },
    { title: 'Mật khẩu', dataIndex: 'password', key: 'password', width: 140 },
    {
      title: 'App Mobile',
      dataIndex: 'mobileApp',
      key: 'mobileApp',
      width: 110,
      render: (v: DriverRow['mobileApp']) =>
        v === 'Đã cấp' ? (
          <StatusTag tone="green">{v}</StatusTag>
        ) : (
          <StatusTag tone="amber">{v}</StatusTag>
        ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (v: DriverRow['status']) =>
        v === 'Đang chạy' ? (
          <StatusTag tone="red">{v}</StatusTag>
        ) : v === 'Off ca' ? (
          <StatusTag tone="slate">{v}</StatusTag>
        ) : (
          <StatusTag tone="green">{v}</StatusTag>
        ),
    },
    {
      title: 'TK hoạt động',
      dataIndex: 'account',
      key: 'account',
      width: 120,
      render: (v: DriverRow['account']) =>
        v === 'Hoạt động' ? (
          <StatusTag tone="green">{v}</StatusTag>
        ) : (
          <StatusTag tone="red">Đã khóa</StatusTag>
        ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 90,
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/vehicles/drivers/${encodeURIComponent(row.key)}`}
            className="inline-flex size-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/5 hover:text-white"
            aria-label="Xem"
          >
            <EyeOutlined />
          </Link>
          <Link
            href={`/vehicles/drivers/${encodeURIComponent(row.key)}/edit`}
            className="inline-flex size-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/5 hover:text-white"
            aria-label="Sửa"
          >
            <EditOutlined />
          </Link>
        </div>
      ),
    },
  ];

  const ctaHref =
    tab === 'vehicles' ? '/vehicles/new' : '/vehicles/drivers/new';
  const ctaLabel = tab === 'vehicles' ? 'Thêm Xe Mới' : 'Thêm Tài xế Mới';
  const total = tab === 'vehicles' ? totalVehicles : totalDrivers;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const rangeStart = (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(total, page * pageSize);

  return (
    <div className="space-y-3">
      <Tabs
        activeKey={tab}
        onChange={(k) => setTab(k as FleetTabKey)}
        className={TW.tabs}
        items={[
          { key: 'vehicles', label: 'Danh sách Xe', children: null },
          { key: 'drivers', label: 'Danh sách Tài xế', children: null },
        ]}
      />

      <AdminDarkPanel className="p-0">
        <div className="border-b border-white/6 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  tab === 'vehicles'
                    ? 'Tìm biển số, loại xe, tài xế phụ trách...'
                    : 'Tìm theo tên, SĐT, email...'
                }
                prefix={<SearchOutlined className="text-white/50" />}
                className={TW.searchInput}
              />
              <Select
                value={status}
                onChange={(v) => setStatus(v)}
                className={TW.statusSelect}
                classNames={{
                  popup: {
                    root: TW.statusSelectPopup,
                  },
                }}
                options={[
                  { label: 'Tất cả trạng thái', value: 'all' },
                  { label: 'Sẵn sàng', value: 'ready' },
                  { label: 'Đang chạy', value: 'running' },
                  { label: 'Bảo dưỡng', value: 'maint' },
                ]}
              />
              <Button
                type="text"
                aria-label="Làm mới"
                className={TW.refreshBtn}
                icon={<ReloadOutlined />}
                onClick={() => {
                  setQuery('');
                  setStatus('all');
                  setPage(1);
                }}
              />
              <Button
                href={ctaHref}
                type="primary"
                icon={<PlusOutlined />}
                className={TW.primaryBtn}
              >
                {ctaLabel}
              </Button>
            </div>
          </div>
          <Typography.Text className="mt-2 block px-4 text-[11px] font-medium text-white/40">
            Hiển thị {rangeStart}-{rangeEnd} / {total} kết quả • Dữ liệu trong
            tổng số xe đăng ký
          </Typography.Text>
        </div>

        <div className="pb-3 pt-2">
          {tab === 'vehicles' ? (
            <Table<VehicleRow>
              size="middle"
              pagination={{
                current: page,
                pageSize,
                total,
                showSizeChanger: true,
                pageSizeOptions: [10, 20, 50],
                placement: ['bottomEnd'],
                showTotal: () => `Tổng ${total} xe • ${pageCount} trang`,
                onChange: (p, ps) => {
                  setPage(p);
                  setPageSize(ps);
                },
              }}
              className={cx('fleet-dark-table', TW.table)}
              style={{ background: 'transparent' }}
              rowKey="key"
              columns={vehicleColumns}
              dataSource={filteredVehicles}
            />
          ) : (
            <Table<DriverRow>
              size="middle"
              pagination={{
                current: page,
                pageSize,
                total,
                showSizeChanger: true,
                pageSizeOptions: [10, 20, 50],
                placement: ['bottomEnd'],
                showTotal: () => `Tổng ${total} tài xế • ${pageCount} trang`,
                onChange: (p, ps) => {
                  setPage(p);
                  setPageSize(ps);
                },
              }}
              className={cx('fleet-dark-table', TW.table)}
              style={{ background: 'transparent' }}
              rowKey="key"
              columns={driverColumns}
              dataSource={filteredDrivers}
            />
          )}
        </div>
      </AdminDarkPanel>
    </div>
  );
}
