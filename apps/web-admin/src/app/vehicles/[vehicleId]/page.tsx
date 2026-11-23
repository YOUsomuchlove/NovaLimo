'use client';

import type { TripRunDto, VehicleDto } from '@limousine-workspace/shared-types';
import {
  Button,
  Card,
  CardHeader,
  DataTable,
  DateTime,
  DescriptionList,
  DetailLayout,
  ErrorState,
  Skeleton,
  StatusTag,
  useConfirm,
  useToast,
} from '@limousine-workspace/shared-ui';
import type { ColumnsType } from 'antd/es/table';
import { ArrowLeft, Bus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminShell } from '../../../components/shell/AdminShell';
import { adminApi, resolveUploadUrl } from '../../../lib/api';

export default function VehicleDetailPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();

  const [vehicle, setVehicle] = useState<VehicleDto | null>(null);
  const [runs, setRuns] = useState<TripRunDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    if (!vehicleId) return;
    setLoading(true);
    setError(null);
    try {
      const [v, r] = await Promise.all([
        adminApi.vehicle(vehicleId),
        adminApi
          .tripRuns({ vehicle_id: vehicleId, limit: 10 })
          .catch(() => ({ items: [], total: 0, page: 1, limit: 10 })),
      ]);
      setVehicle(v);
      setRuns(r.items);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    void load();
  }, [load]);

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
        title: 'Tài xế',
        key: 'driver',
        render: (_, r) => (
          <span className="text-ui text-fg">{r.driver.full_name}</span>
        ),
      },
      {
        title: 'Khách / Hàng',
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
      title="Chi tiết xe"
      subtitle="Xem thông tin biển số, cấu hình và trạng thái hoạt động"
      breadcrumbs={[
        { label: 'Đội xe & Tài xế', href: '/vehicles' },
        { label: vehicle?.license_plate ?? 'Chi tiết xe' },
      ]}
      headerExtra={
        <div className="flex items-center gap-2">
          <Link href="/vehicles">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowLeft className="size-4" />}
            >
              Danh sách xe
            </Button>
          </Link>
          {vehicle && (
            <Link href={`/vehicles/${vehicle.id}/edit`}>
              <Button size="sm" leftIcon={<Edit className="size-4" />}>
                Sửa xe
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
      ) : loading || !vehicle ? (
        <Card className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full" rounded="card" />
          <Skeleton className="h-48 w-full" rounded="card" />
        </Card>
      ) : (
        <DetailLayout
          main={
            <>
              {/* Hero Card (frame BYSRc) */}
              <Card className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div className="flex flex-wrap items-center gap-5">
                  {vehicle.image_url ? (
                    <img
                      src={resolveUploadUrl(vehicle.image_url)}
                      alt={vehicle.license_plate}
                      className="h-24 w-36 rounded-control border border-border-subtle object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-36 items-center justify-center rounded-control border border-border-subtle bg-surface-2 text-brand-fg">
                      <Bus className="size-8" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-mono text-2xl font-bold text-fg">
                        {vehicle.license_plate}
                      </h2>
                      <StatusTag domain="vehicle" status={vehicle.status} />
                    </div>
                    <p className="mt-1 text-sm text-fg-secondary">
                      {vehicle.vehicle_type.name} ·{' '}
                      {vehicle.vehicle_type.capacity} chỗ
                    </p>
                    <p className="mt-0.5 text-xs text-fg-muted">
                      {[vehicle.brand, vehicle.model, vehicle.year]
                        .filter(Boolean)
                        .join(' · ') || 'Chưa cập nhật dòng xe'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/vehicles/${vehicle.id}/edit`}>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Edit className="size-4" />}
                    >
                      Chỉnh sửa
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<Trash2 className="size-4" />}
                    onClick={async () => {
                      if (
                        await confirm({
                          title: `Lưu trữ xe ${vehicle.license_plate}?`,
                          content: 'Xe sẽ bị ẩn khỏi danh sách điều phối.',
                          okText: 'Lưu trữ',
                          danger: true,
                        })
                      ) {
                        await adminApi.archiveVehicle(vehicle.id);
                        toast.success('Đã lưu trữ xe');
                        router.push('/vehicles');
                      }
                    }}
                  >
                    Lưu trữ
                  </Button>
                </div>
              </Card>

              {/* Info Card */}
              <Card>
                <CardHeader title="Thông tin phương tiện" />
                <DescriptionList
                  columns={2}
                  items={[
                    { label: 'Biển số', value: vehicle.license_plate },
                    { label: 'Loại xe', value: vehicle.vehicle_type.name },
                    {
                      label: 'Số chỗ',
                      value: `${vehicle.vehicle_type.capacity} ghế`,
                    },
                    { label: 'Màu sơn', value: vehicle.color ?? '—' },
                    {
                      label: 'Hãng & Mẫu xe',
                      value:
                        [vehicle.brand, vehicle.model, vehicle.year]
                          .filter(Boolean)
                          .join(' · ') || '—',
                    },
                    {
                      label: 'Số công-tơ-mét (KM)',
                      value: `${vehicle.odometer_km.toLocaleString('vi-VN')} km`,
                    },
                    {
                      label: 'Trạng thái',
                      value: (
                        <StatusTag domain="vehicle" status={vehicle.status} />
                      ),
                    },
                    {
                      label: 'Ngày tạo hồ sơ',
                      value: <DateTime value={vehicle.created_at} />,
                    },
                    {
                      label: 'Ghi chú',
                      value: vehicle.note ?? 'Không có ghi chú',
                      full: true,
                    },
                  ]}
                />
              </Card>

              {/* Recent Runs */}
              <div className="flex flex-col gap-3">
                <h3 className="text-base font-semibold text-fg">
                  Lịch sử chuyến chạy gần đây
                </h3>
                <DataTable<TripRunDto>
                  columns={runColumns}
                  data={runs}
                  rowKey="id"
                  empty={{
                    title: 'Chưa có chuyến chạy nào',
                    description: 'Xe này chưa được gán vào chuyến chạy nào.',
                  }}
                />
              </div>
            </>
          }
          aside={
            <Card>
              <CardHeader
                title="Hạn đăng kiểm & Bảo dưỡng"
                description="Lịch nhắc định kỳ phương tiện"
              />
              <DescriptionList
                columns={1}
                items={[
                  {
                    label: 'Bảo dưỡng kế tiếp',
                    value: vehicle.next_maintenance_on ?? 'Chưa đặt lịch',
                  },
                  {
                    label: 'Hạn đăng kiểm',
                    value: vehicle.registration_expires_on ?? 'Chưa cập nhật',
                  },
                  {
                    label: 'Hạn bảo hiểm',
                    value: vehicle.insurance_expires_on ?? 'Chưa cập nhật',
                  },
                ]}
              />
            </Card>
          }
        />
      )}
    </AdminShell>
  );
}
