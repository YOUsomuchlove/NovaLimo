'use client';

import type {
  DriverDto,
  UserStatus,
  VehicleDto,
  VehicleStatus,
  VehicleTypeDto,
} from '@limousine-workspace/shared-types';
import {
  Avatar,
  Badge,
  Button,
  DataTable,
  Field,
  FilterBar,
  Input,
  Phone,
  SEAT_LAYOUTS,
  SegmentedControl,
  StatusTag,
  useConfirm,
  useToast,
} from '@limousine-workspace/shared-ui';
import { Modal, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Bus,
  Edit,
  Eye,
  KeyRound,
  Lock,
  Plus,
  RefreshCw,
  Settings2,
  Trash2,
  Unlock,
  UserPlus,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminApi, resolveUploadUrl } from '../../lib/api';

export type FleetTabKey = 'vehicles' | 'drivers';

export function FleetManagementView({
  initialTab = 'vehicles',
}: {
  initialTab?: FleetTabKey;
}) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();

  const [tab, setTab] = useState<FleetTabKey>(initialTab);

  // Vehicles state
  const [vehicles, setVehicles] = useState<VehicleDto[] | undefined>(undefined);
  const [vehTotal, setVehTotal] = useState(0);
  const [vehPage, setVehPage] = useState(1);
  const [vehLimit, setVehLimit] = useState(10);
  const [vehQuery, setVehQuery] = useState('');
  const [vehStatus, setVehStatus] = useState<VehicleStatus | ''>('');
  const [vehTypeId, setVehTypeId] = useState<string>('');
  const [vehLoading, setVehLoading] = useState(false);
  const [vehError, setVehError] = useState<unknown>(null);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeDto[]>([]);

  // Vehicle Type modal state
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [newTypeCode, setNewTypeCode] = useState('');
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypePreset, setNewTypePreset] = useState<'limo9' | 'limo12'>(
    'limo9',
  );
  const [typeSaving, setTypeSaving] = useState(false);

  // Drivers state
  const [drivers, setDrivers] = useState<DriverDto[] | undefined>(undefined);
  const [drvTotal, setDrvTotal] = useState(0);
  const [drvPage, setDrvPage] = useState(1);
  const [drvLimit, setDrvLimit] = useState(10);
  const [drvQuery, setDrvQuery] = useState('');
  const [drvStatus, setDrvStatus] = useState<UserStatus | ''>('');
  const [drvLoading, setDrvLoading] = useState(false);
  const [drvError, setDrvError] = useState<unknown>(null);

  // Driver Reset Password modal
  const [resetDrv, setResetDrv] = useState<DriverDto | null>(null);
  const [resetPwdValue, setResetPwdValue] = useState('');
  const [resetSaving, setResetSaving] = useState(false);

  const loadTypes = useCallback(async () => {
    try {
      const list = await adminApi.vehicleTypes();
      setVehicleTypes(list);
    } catch {
      // ignore
    }
  }, []);

  const loadVehicles = useCallback(async () => {
    setVehLoading(true);
    setVehError(null);
    try {
      const res = await adminApi.vehicles({
        page: vehPage,
        limit: vehLimit,
        q: vehQuery.trim() || undefined,
        status: vehStatus || undefined,
        vehicle_type_id: vehTypeId || undefined,
      });
      setVehicles(res.items);
      setVehTotal(res.total);
    } catch (e) {
      setVehError(e);
    } finally {
      setVehLoading(false);
    }
  }, [vehPage, vehLimit, vehQuery, vehStatus, vehTypeId]);

  const loadDrivers = useCallback(async () => {
    setDrvLoading(true);
    setDrvError(null);
    try {
      const res = await adminApi.drivers({
        page: drvPage,
        limit: drvLimit,
        q: drvQuery.trim() || undefined,
        status: drvStatus || undefined,
      });
      setDrivers(res.items);
      setDrvTotal(res.total);
    } catch (e) {
      setDrvError(e);
    } finally {
      setDrvLoading(false);
    }
  }, [drvPage, drvLimit, drvQuery, drvStatus]);

  useEffect(() => {
    void loadTypes();
  }, [loadTypes]);

  useEffect(() => {
    if (tab === 'vehicles') void loadVehicles();
    else void loadDrivers();
  }, [tab, loadVehicles, loadDrivers]);

  const handleToggleDriverLock = useCallback(
    async (drv: DriverDto) => {
      const nextStatus: UserStatus =
        drv.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
      const ok = await confirm({
        title:
          nextStatus === 'LOCKED'
            ? `Khóa tài khoản tài xế ${drv.full_name}?`
            : `Mở khóa tài khoản tài xế ${drv.full_name}?`,
        content:
          nextStatus === 'LOCKED'
            ? 'Tài xế sẽ bị đăng xuất khỏi ứng dụng Mobile ngay lập tức.'
            : 'Tài xế sẽ có thể đăng nhập lại vào ứng dụng Mobile.',
        okText: nextStatus === 'LOCKED' ? 'Khóa tài khoản' : 'Mở khóa',
        danger: nextStatus === 'LOCKED',
      });
      if (!ok) return;
      try {
        await adminApi.updateDriver(drv.id, { status: nextStatus });
        toast.success(
          nextStatus === 'LOCKED'
            ? `Đã khóa tài khoản ${drv.full_name}`
            : `Đã mở khóa tài khoản ${drv.full_name}`,
        );
        void loadDrivers();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Cập nhật thất bại');
      }
    },
    [confirm, loadDrivers, toast],
  );

  const handleResetDriverPassword = async () => {
    if (!resetDrv) return;
    if (resetPwdValue.length < 8) {
      toast.error('Mật khẩu mới cần ít nhất 8 ký tự (gồm cả chữ và số)');
      return;
    }
    setResetSaving(true);
    try {
      await adminApi.resetDriverPassword(resetDrv.id, resetPwdValue);
      toast.success(`Đã cấp lại mật khẩu cho tài xế ${resetDrv.full_name}`);
      setResetDrv(null);
      setResetPwdValue('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Đặt lại mật khẩu thất bại');
    } finally {
      setResetSaving(false);
    }
  };

  const handleCreateVehicleType = async () => {
    if (!newTypeCode.trim() || !newTypeName.trim()) {
      toast.error('Vui lòng nhập mã và tên loại xe');
      return;
    }
    setTypeSaving(true);
    try {
      await adminApi.createVehicleType({
        code: newTypeCode.trim().toUpperCase(),
        name: newTypeName.trim(),
        seat_layout: SEAT_LAYOUTS[
          newTypePreset === 'limo9' ? 'limousine9' : 'limousine12'
        ].rows.map((row) =>
          row.map((cell) =>
            cell ? { label: cell.label, tier: cell.tier ?? 'STANDARD' } : null,
          ),
        ),
      });
      toast.success('Đã tạo loại xe mới');
      setNewTypeCode('');
      setNewTypeName('');
      await loadTypes();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể tạo loại xe');
    } finally {
      setTypeSaving(false);
    }
  };

  const vehicleColumns: ColumnsType<VehicleDto> = useMemo(
    () => [
      {
        title: 'Biển số & Mẫu xe',
        key: 'plate',
        render: (_, v) => (
          <div className="flex items-center gap-3">
            {v.image_url ? (
              <img
                src={resolveUploadUrl(v.image_url)}
                alt={v.license_plate}
                className="size-10 shrink-0 rounded-control border border-border-subtle object-cover"
              />
            ) : (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-control border border-border-subtle bg-surface-2 text-brand-fg">
                <Bus className="size-4" />
              </span>
            )}
            <div>
              <Link
                href={`/vehicles/${v.id}`}
                className="font-mono text-sm font-semibold text-fg hover:text-brand-fg"
              >
                {v.license_plate}
              </Link>
              <p className="text-xs text-fg-muted">
                {[v.brand, v.model, v.year].filter(Boolean).join(' · ') ||
                  'Chưa cập nhật mẫu xe'}
              </p>
            </div>
          </div>
        ),
      },
      {
        title: 'Loại xe',
        key: 'type',
        render: (_, v) => (
          <div>
            <p className="text-ui font-medium text-fg">{v.vehicle_type.name}</p>
            <p className="text-xs text-fg-muted">
              {v.vehicle_type.capacity} ghế · Mã {v.vehicle_type.code}
            </p>
          </div>
        ),
      },
      {
        title: 'Màu sơn',
        dataIndex: 'color',
        key: 'color',
        render: (c: string | null) => (
          <span className="text-ui text-fg-secondary">{c || '—'}</span>
        ),
      },
      {
        title: 'Odometer (KM)',
        dataIndex: 'odometer_km',
        key: 'odometer_km',
        render: (km: number) => (
          <span className="font-mono text-ui tabular-nums text-fg">
            {(km ?? 0).toLocaleString('vi-VN')} km
          </span>
        ),
      },
      {
        title: 'Bảo dưỡng / Đăng kiểm',
        key: 'maintenance',
        render: (_, v) => (
          <div className="text-xs text-fg-secondary">
            <div>
              Bảo dưỡng:{' '}
              <span className="text-fg">{v.next_maintenance_on ?? '—'}</span>
            </div>
            <div className="text-fg-muted">
              Đăng kiểm: {v.registration_expires_on ?? '—'}
            </div>
          </div>
        ),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (s: VehicleStatus) => <StatusTag domain="vehicle" status={s} />,
      },
      {
        title: 'Thao tác',
        key: 'actions',
        align: 'right',
        render: (_, v) => (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Link href={`/vehicles/${v.id}`}>
              <Button size="icon-sm" variant="ghost" aria-label="Xem chi tiết">
                <Eye className="size-4" />
              </Button>
            </Link>
            <Link href={`/vehicles/${v.id}/edit`}>
              <Button size="icon-sm" variant="ghost" aria-label="Sửa xe">
                <Edit className="size-4" />
              </Button>
            </Link>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Lưu trữ xe"
              onClick={async () => {
                if (
                  await confirm({
                    title: `Lưu trữ xe ${v.license_plate}?`,
                    content: 'Xe sẽ ẩn khỏi danh sách phân công chuyến mới.',
                    okText: 'Lưu trữ',
                    danger: true,
                  })
                ) {
                  try {
                    await adminApi.archiveVehicle(v.id);
                    toast.success(`Đã lưu trữ xe ${v.license_plate}`);
                    void loadVehicles();
                  } catch (err) {
                    toast.error(
                      err instanceof Error ? err.message : 'Không xóa được xe',
                    );
                  }
                }
              }}
            >
              <Trash2 className="size-4 text-danger-fg" />
            </Button>
          </div>
        ),
      },
    ],
    [confirm, loadVehicles, toast],
  );

  const driverColumns: ColumnsType<DriverDto> = useMemo(
    () => [
      {
        title: 'Tài xế',
        key: 'driver',
        render: (_, d) => (
          <div className="flex items-center gap-3">
            <Avatar
              name={d.full_name}
              src={resolveUploadUrl(d.avatar_url)}
              size={36}
              status={d.on_shift ? 'online' : 'offline'}
            />
            <div>
              <Link
                href={`/vehicles/drivers/${d.id}`}
                className="text-sm font-semibold text-fg hover:text-brand-fg"
              >
                {d.full_name}
              </Link>
              <p className="text-xs text-fg-muted">
                {d.email || 'Chưa có email'}
              </p>
            </div>
          </div>
        ),
      },
      {
        title: 'Số điện thoại',
        dataIndex: 'phone',
        key: 'phone',
        render: (phone: string) => (
          <Phone value={phone} link className="text-ui font-medium text-fg" />
        ),
      },
      {
        title: 'Bằng lái & Xe mặc định',
        key: 'license',
        render: (_, d) => (
          <div className="text-xs">
            <p className="font-medium text-fg">
              GPLX: {d.profile?.license_class || '—'}{' '}
              {d.profile?.license_number ? `· ${d.profile.license_number}` : ''}
            </p>
            <p className="text-fg-muted">
              Xe gắn:{' '}
              {d.profile?.default_vehicle?.license_plate ??
                'Chưa gắn xe cố định'}
            </p>
          </div>
        ),
      },
      {
        title: 'Ca làm việc',
        key: 'shift',
        render: (_, d) =>
          d.on_shift ? (
            <Badge tone="success">Đang trong ca</Badge>
          ) : (
            <Badge tone="neutral">Off ca</Badge>
          ),
      },
      {
        title: 'Tài khoản App',
        dataIndex: 'status',
        key: 'status',
        render: (s: UserStatus) => <StatusTag domain="user" status={s} />,
      },
      {
        title: 'Bảo mật & Thao tác',
        key: 'actions',
        align: 'right',
        render: (_, d) => (
          <div
            className="flex items-center justify-end gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<KeyRound className="size-3.5" />}
              onClick={() => {
                setResetDrv(d);
                setResetPwdValue('');
              }}
            >
              Cấp lại MK
            </Button>
            <Button
              size="sm"
              variant={d.status === 'LOCKED' ? 'outline' : 'ghost'}
              leftIcon={
                d.status === 'LOCKED' ? (
                  <Unlock className="size-3.5" />
                ) : (
                  <Lock className="size-3.5" />
                )
              }
              onClick={() => void handleToggleDriverLock(d)}
            >
              {d.status === 'LOCKED' ? 'Mở khóa' : 'Khóa'}
            </Button>
            <Link href={`/vehicles/drivers/${d.id}`}>
              <Button size="icon-sm" variant="ghost" aria-label="Xem hồ sơ">
                <Eye className="size-4" />
              </Button>
            </Link>
            <Link href={`/vehicles/drivers/${d.id}/edit`}>
              <Button size="icon-sm" variant="ghost" aria-label="Sửa hồ sơ">
                <Edit className="size-4" />
              </Button>
            </Link>
          </div>
        ),
      },
    ],
    [handleToggleDriverLock],
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Top Tab Switcher (frame nvFleet: Danh sách Xe / Danh sách Tài xế) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SegmentedControl<FleetTabKey>
          ariaLabel="Chuyển danh sách Đội xe hoặc Tài xế"
          value={tab}
          onChange={(next) => {
            setTab(next);
            router.push(
              next === 'vehicles' ? '/vehicles' : '/vehicles/drivers',
            );
          }}
          options={[
            {
              value: 'vehicles',
              label: `Danh sách Xe (${vehTotal || vehicles?.length || 0})`,
              icon: <Bus className="size-4" />,
            },
            {
              value: 'drivers',
              label: `Danh sách Tài xế (${drvTotal || drivers?.length || 0})`,
              icon: <Users className="size-4" />,
            },
          ]}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Settings2 className="size-4" />}
            onClick={() => setTypeModalOpen(true)}
          >
            Loại xe & Sơ đồ ghế ({vehicleTypes.length})
          </Button>
          {tab === 'vehicles' ? (
            <Link href="/vehicles/new">
              <Button leftIcon={<Plus className="size-4" />}>Tạo xe mới</Button>
            </Link>
          ) : (
            <Link href="/vehicles/drivers/new">
              <Button leftIcon={<UserPlus className="size-4" />}>
                Tạo tài xế mới
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Vehicles Table */}
      {tab === 'vehicles' ? (
        <DataTable<VehicleDto>
          columns={vehicleColumns}
          data={vehicles}
          rowKey="id"
          loading={vehLoading}
          error={vehError}
          onRetry={loadVehicles}
          onRowClick={(row) => router.push(`/vehicles/${row.id}`)}
          pagination={{
            page: vehPage,
            pageSize: vehLimit,
            total: vehTotal,
            onChange: (p, ps) => {
              setVehPage(p);
              setVehLimit(ps);
            },
          }}
          toolbar={
            <FilterBar
              search={{
                value: vehQuery,
                onChange: (v) => {
                  setVehQuery(v);
                  setVehPage(1);
                },
                placeholder: 'Tìm biển số, hãng xe, mẫu xe…',
              }}
              onReset={
                vehQuery || vehStatus || vehTypeId
                  ? () => {
                      setVehQuery('');
                      setVehStatus('');
                      setVehTypeId('');
                      setVehPage(1);
                    }
                  : undefined
              }
              actions={
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<RefreshCw className="size-3.5" />}
                  onClick={loadVehicles}
                >
                  Làm mới
                </Button>
              }
            >
              <Select
                className="w-full sm:w-44"
                value={vehStatus}
                onChange={(v) => {
                  setVehStatus(v);
                  setVehPage(1);
                }}
                options={[
                  { value: '', label: 'Mọi trạng thái' },
                  { value: 'AVAILABLE', label: 'Sẵn sàng' },
                  { value: 'IN_USE', label: 'Đang chạy' },
                  { value: 'MAINTENANCE', label: 'Bảo dưỡng' },
                  { value: 'INACTIVE', label: 'Ngừng hoạt động' },
                ]}
              />
              <Select
                className="w-full sm:w-48"
                value={vehTypeId}
                onChange={(v) => {
                  setVehTypeId(v);
                  setVehPage(1);
                }}
                options={[
                  { value: '', label: 'Mọi loại xe' },
                  ...vehicleTypes.map((vt) => ({
                    value: vt.id,
                    label: `${vt.name} (${vt.capacity} chỗ)`,
                  })),
                ]}
              />
            </FilterBar>
          }
          empty={{
            title: 'Chưa có phương tiện nào phù hợp',
            description:
              'Thêm phương tiện mới hoặc xóa bộ lọc để xem toàn bộ đội xe.',
            action: (
              <Link href="/vehicles/new">
                <Button size="sm" leftIcon={<Plus className="size-4" />}>
                  Tạo xe mới
                </Button>
              </Link>
            ),
          }}
        />
      ) : (
        /* Drivers Table */
        <DataTable<DriverDto>
          columns={driverColumns}
          data={drivers}
          rowKey="id"
          loading={drvLoading}
          error={drvError}
          onRetry={loadDrivers}
          onRowClick={(row) => router.push(`/vehicles/drivers/${row.id}`)}
          pagination={{
            page: drvPage,
            pageSize: drvLimit,
            total: drvTotal,
            onChange: (p, ps) => {
              setDrvPage(p);
              setDrvLimit(ps);
            },
          }}
          toolbar={
            <FilterBar
              search={{
                value: drvQuery,
                onChange: (v) => {
                  setDrvQuery(v);
                  setDrvPage(1);
                },
                placeholder: 'Tìm theo họ tên, SĐT, email…',
              }}
              onReset={
                drvQuery || drvStatus
                  ? () => {
                      setDrvQuery('');
                      setDrvStatus('');
                      setDrvPage(1);
                    }
                  : undefined
              }
              actions={
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<RefreshCw className="size-3.5" />}
                  onClick={loadDrivers}
                >
                  Làm mới
                </Button>
              }
            >
              <Select
                className="w-full sm:w-48"
                value={drvStatus}
                onChange={(v) => {
                  setDrvStatus(v);
                  setDrvPage(1);
                }}
                options={[
                  { value: '', label: 'Mọi trạng thái TK' },
                  { value: 'ACTIVE', label: 'Đang hoạt động' },
                  { value: 'LOCKED', label: 'Đã khóa' },
                  { value: 'INACTIVE', label: 'Ngừng hoạt động' },
                ]}
              />
            </FilterBar>
          }
          empty={{
            title: 'Chưa có hồ sơ tài xế nào',
            description:
              'Tạo hồ sơ tài xế mới để cấp quyền đăng nhập ứng dụng Mobile.',
            action: (
              <Link href="/vehicles/drivers/new">
                <Button size="sm" leftIcon={<UserPlus className="size-4" />}>
                  Tạo tài xế mới
                </Button>
              </Link>
            ),
          }}
        />
      )}

      {/* Reset Driver Password Modal */}
      <Modal
        open={Boolean(resetDrv)}
        onCancel={() => setResetDrv(null)}
        title={
          resetDrv
            ? `Cấp lại mật khẩu ứng dụng · ${resetDrv.full_name}`
            : 'Cấp lại mật khẩu'
        }
        footer={null}
      >
        <div className="mt-4 flex flex-col gap-4">
          <p className="text-xs text-fg-muted">
            Mật khẩu cũ của tài xế được mã hóa một chiều (bcrypt) để bảo mật.
            Nhập mật khẩu mới bên dưới để cấp lại cho tài xế đăng nhập ứng dụng.
          </p>
          <Field
            label="Mật khẩu mới"
            required
            hint="Ít nhất 8 ký tự, có cả chữ cái và chữ số"
          >
            {(p) => (
              <Input
                {...p}
                type="text"
                value={resetPwdValue}
                onChange={(e) => setResetPwdValue(e.target.value)}
                placeholder="VD: NovaDriver2026"
              />
            )}
          </Field>
          <div className="flex justify-between gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setResetPwdValue(
                  `Nova${Math.floor(1000 + Math.random() * 9000)}a`,
                )
              }
            >
              Sinh mật khẩu ngẫu nhiên
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setResetDrv(null)}>
                Hủy
              </Button>
              <Button loading={resetSaving} onClick={handleResetDriverPassword}>
                Lưu mật khẩu mới
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Vehicle Types Modal */}
      <Modal
        open={typeModalOpen}
        onCancel={() => setTypeModalOpen(false)}
        title="Quản lý Loại xe & Sơ đồ ghế chuẩn"
        footer={null}
        width={620}
      >
        <div className="mt-4 flex flex-col gap-5">
          <div className="divide-y divide-border-subtle rounded-card border border-border-subtle bg-surface-2">
            {vehicleTypes.length === 0 ? (
              <p className="p-4 text-center text-sm text-fg-muted">
                Chưa có loại xe nào
              </p>
            ) : (
              vehicleTypes.map((vt) => (
                <div
                  key={vt.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-fg">{vt.name}</p>
                    <p className="text-xs text-fg-muted">
                      Mã: <code className="font-mono">{vt.code}</code> · Sức
                      chứa: {vt.capacity} ghế
                    </p>
                  </div>
                  <Badge tone="brand">{vt.capacity} chỗ</Badge>
                </div>
              ))
            )}
          </div>

          <div className="rounded-card border border-border-subtle bg-surface-1 p-4">
            <p className="mb-3 text-sm font-semibold text-fg">
              Thêm loại xe mới
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Mã loại xe" required>
                {(p) => (
                  <Input
                    {...p}
                    value={newTypeCode}
                    onChange={(e) => setNewTypeCode(e.target.value)}
                    placeholder="VD: LIMO11"
                  />
                )}
              </Field>
              <Field label="Tên hiển thị" required>
                {(p) => (
                  <Input
                    {...p}
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    placeholder="Limousine 9 chỗ VIP"
                  />
                )}
              </Field>
              <Field label="Sơ đồ ghế mẫu">
                {() => (
                  <Select
                    className="w-full"
                    value={newTypePreset}
                    onChange={(v) => setNewTypePreset(v)}
                    options={[
                      { value: 'limo9', label: 'Sơ đồ 9 chỗ chuẩn' },
                      { value: 'limo12', label: 'Sơ đồ 12 chỗ chuẩn' },
                    ]}
                  />
                )}
              </Field>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                size="sm"
                loading={typeSaving}
                onClick={handleCreateVehicleType}
              >
                Thêm loại xe
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
