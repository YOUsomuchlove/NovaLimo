'use client';

import type { DriverDto, TripRunDto } from '@limousine-workspace/shared-types';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  DataTable,
  DateTime,
  DescriptionList,
  DetailLayout,
  ErrorState,
  Field,
  Input,
  Phone,
  Skeleton,
  StatusTag,
  useConfirm,
  useToast,
} from '@limousine-workspace/shared-ui';
import { Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowLeft,
  Edit,
  KeyRound,
  Lock,
  MessageSquare,
  Unlock,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminShell } from '../../../../components/shell/AdminShell';
import { adminApi, resolveUploadUrl } from '../../../../lib/api';

export default function DriverDetailPage() {
  const { driverId } = useParams<{ driverId: string }>();
  const toast = useToast();
  const confirm = useConfirm();

  const [driver, setDriver] = useState<DriverDto | null>(null);
  const [runs, setRuns] = useState<TripRunDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const [pwdOpen, setPwdOpen] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);

  const load = useCallback(async () => {
    if (!driverId) return;
    setLoading(true);
    setError(null);
    try {
      const [d, r] = await Promise.all([
        adminApi.driver(driverId),
        adminApi
          .tripRuns({ driver_id: driverId, limit: 10 })
          .catch(() => ({ items: [], total: 0, page: 1, limit: 10 })),
      ]);
      setDriver(d);
      setRuns(r.items);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleToggleLock = async () => {
    if (!driver) return;
    const next = driver.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
    if (
      await confirm({
        title:
          next === 'LOCKED'
            ? `Khóa tài khoản ${driver.full_name}?`
            : `Mở khóa tài khoản ${driver.full_name}?`,
        okText: next === 'LOCKED' ? 'Khóa' : 'Mở khóa',
        danger: next === 'LOCKED',
      })
    ) {
      try {
        const updated = await adminApi.updateDriver(driver.id, {
          status: next,
        });
        setDriver(updated);
        toast.success('Đã cập nhật trạng thái tài khoản');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Lỗi cập nhật');
      }
    }
  };

  const handleResetPwd = async () => {
    if (!driver || newPwd.length < 8) {
      toast.error('Mật khẩu cần ít nhất 8 ký tự (gồm chữ và số)');
      return;
    }
    setPwdSaving(true);
    try {
      await adminApi.resetDriverPassword(driver.id, newPwd);
      toast.success('Đã cấp lại mật khẩu cho tài xế');
      setPwdOpen(false);
      setNewPwd('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể đổi mật khẩu');
    } finally {
      setPwdSaving(false);
    }
  };

  const runColumns: ColumnsType<TripRunDto> = useMemo(
    () => [
      {
        title: 'Mã chuyến',
        dataIndex: 'code',
        key: 'code',
        render: (c: string, r) => (
          <Link
            href={`/trip-runs/${r.id}`}
            className="font-mono text-xs font-semibold text-brand-fg hover:underline"
          >
            {c}
          </Link>
        ),
      },
      {
        title: 'Phương tiện',
        key: 'vehicle',
        render: (_, r) => (
          <span className="font-mono text-xs text-fg">
            {r.vehicle.license_plate}
          </span>
        ),
      },
      {
        title: 'Hành khách / Hàng',
        key: 'pax',
        render: (_, r) => (
          <span className="text-xs tabular-nums text-fg-secondary">
            {r.passenger_count}/{r.vehicle.capacity} khách · {r.cargo_count}{' '}
            kiện
          </span>
        ),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (s: TripRunDto['status']) => (
          <StatusTag domain="tripRun" status={s} />
        ),
      },
    ],
    [],
  );

  return (
    <AdminShell
      title="Chi tiết tài xế"
      subtitle="Hồ sơ, giấy phép lái xe và trạng thái làm việc"
      breadcrumbs={[
        { label: 'Đội xe & Tài xế', href: '/vehicles/drivers' },
        { label: driver?.full_name ?? 'Chi tiết tài xế' },
      ]}
      headerExtra={
        <div className="flex items-center gap-2">
          <Link href="/vehicles/drivers">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowLeft className="size-4" />}
            >
              Danh sách tài xế
            </Button>
          </Link>
          {driver && (
            <Link href={`/vehicles/drivers/${driver.id}/edit`}>
              <Button size="sm" leftIcon={<Edit className="size-4" />}>
                Sửa tài xế
              </Button>
            </Link>
          )}
        </div>
      }
    >
      {error ? (
        <Card>
          <ErrorState onRetry={load} />
        </Card>
      ) : loading || !driver ? (
        <Card className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full" rounded="card" />
          <Skeleton className="h-48 w-full" rounded="card" />
        </Card>
      ) : (
        <DetailLayout
          main={
            <>
              {/* Hero Card (frame GU9mg) */}
              <Card className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div className="flex flex-wrap items-center gap-5">
                  <Avatar
                    name={driver.full_name}
                    src={resolveUploadUrl(driver.avatar_url)}
                    size={76}
                    status={driver.on_shift ? 'online' : 'offline'}
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-xl font-bold text-fg">
                        {driver.full_name}
                      </h2>
                      <StatusTag domain="user" status={driver.status} />
                      {driver.on_shift ? (
                        <Badge tone="success">Đang trong ca</Badge>
                      ) : (
                        <Badge tone="neutral">Off ca</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-fg-secondary">
                      SĐT: <Phone value={driver.phone} link /> ·{' '}
                      {driver.email || 'Chưa cập nhật email'}
                    </p>
                    <p className="mt-0.5 text-xs text-fg-muted">
                      Đăng nhập gần nhất:{' '}
                      <DateTime value={driver.last_login_at} />
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<KeyRound className="size-4" />}
                    onClick={() => setPwdOpen(true)}
                  >
                    Cấp lại MK
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={
                      driver.status === 'LOCKED' ? (
                        <Unlock className="size-4" />
                      ) : (
                        <Lock className="size-4" />
                      )
                    }
                    onClick={handleToggleLock}
                  >
                    {driver.status === 'LOCKED' ? 'Mở khóa TK' : 'Khóa TK'}
                  </Button>
                  <Link href={`/call-center?tab=inbox&driver=${driver.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<MessageSquare className="size-4" />}
                    >
                      Nhắn tin
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Profile Card */}
              <Card>
                <CardHeader title="Hồ sơ tài xế" />
                <DescriptionList
                  columns={2}
                  items={[
                    { label: 'Họ và tên', value: driver.full_name },
                    {
                      label: 'Số điện thoại',
                      value: <Phone value={driver.phone} link />,
                    },
                    { label: 'Email', value: driver.email ?? '—' },
                    {
                      label: 'Trạng thái tài khoản',
                      value: <StatusTag domain="user" status={driver.status} />,
                    },
                    {
                      label: 'Số GPLX',
                      value: driver.profile.license_number ?? '—',
                    },
                    {
                      label: 'Hạng bằng & Hạn',
                      value: `${driver.profile.license_class ?? '—'} · Hạn: ${driver.profile.license_expires_on ?? '—'}`,
                    },
                    {
                      label: 'Phương tiện mặc định',
                      value: driver.profile.default_vehicle ? (
                        <Link
                          href={`/vehicles/${driver.profile.default_vehicle.id}`}
                          className="font-mono font-semibold text-brand-fg hover:underline"
                        >
                          {driver.profile.default_vehicle.license_plate}
                        </Link>
                      ) : (
                        'Chưa gắn xe cố định'
                      ),
                    },
                    {
                      label: 'Liên hệ khẩn cấp',
                      value: driver.profile.emergency_contact ?? '—',
                    },
                    {
                      label: 'Địa chỉ',
                      value: driver.profile.address ?? '—',
                      full: true,
                    },
                    {
                      label: 'Ghi chú',
                      value: driver.profile.note ?? 'Không có ghi chú',
                      full: true,
                    },
                  ]}
                />
              </Card>

              {/* Recent Runs */}
              <div className="flex flex-col gap-3">
                <h3 className="text-base font-semibold text-fg">
                  Chuyến chạy đã phân công
                </h3>
                <DataTable<TripRunDto>
                  columns={runColumns}
                  data={runs}
                  rowKey="id"
                  empty={{
                    title: 'Chưa có chuyến chạy nào',
                    description: 'Tài xế chưa được gán vào chuyến chạy nào.',
                  }}
                />
              </div>
            </>
          }
          aside={
            <Card>
              <CardHeader
                title="Thông tin nhân sự"
                description="Hồ sơ hợp đồng & ngày vào làm"
              />
              <DescriptionList
                columns={1}
                items={[
                  {
                    label: 'Ngày sinh',
                    value: driver.profile.date_of_birth ?? '—',
                  },
                  {
                    label: 'Ngày nhận việc',
                    value: driver.profile.hired_on ?? '—',
                  },
                  {
                    label: 'Ngày tạo tài khoản',
                    value: <DateTime value={driver.created_at} />,
                  },
                ]}
              />
            </Card>
          }
        />
      )}

      <Modal
        open={pwdOpen}
        onCancel={() => setPwdOpen(false)}
        title={`Cấp lại mật khẩu · ${driver?.full_name ?? ''}`}
        footer={null}
      >
        <div className="mt-4 flex flex-col gap-4">
          <Field
            label="Mật khẩu mới"
            required
            hint="Tối thiểu 8 ký tự, gồm cả chữ và số"
          >
            {(p) => (
              <Input
                {...p}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="VD: Nova2026Driver"
              />
            )}
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPwdOpen(false)}>
              Hủy
            </Button>
            <Button loading={pwdSaving} onClick={handleResetPwd}>
              Lưu mật khẩu
            </Button>
          </div>
        </div>
      </Modal>
    </AdminShell>
  );
}
