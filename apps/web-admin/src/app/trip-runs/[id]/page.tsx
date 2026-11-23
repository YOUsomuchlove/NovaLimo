'use client';

import type { DriverRunDetailDto } from '@limousine-workspace/shared-types';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DateTime,
  DescriptionList,
  DetailLayout,
  ErrorState,
  MapView,
  Money,
  Phone,
  Skeleton,
  StatusTag,
  Timeline,
  useConfirm,
  useToast,
} from '@limousine-workspace/shared-ui';
import { RealtimeEvents } from '@limousine-workspace/utils-core';
import {
  ArrowLeft,
  Edit,
  FileText,
  Package,
  RefreshCw,
  Send,
  Users,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminShell } from '../../../components/shell/AdminShell';
import { adminApi } from '../../../lib/api';
import { getAdminSocket } from '../../../lib/socket';

export default function TripRunDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const confirm = useConfirm();

  const [run, setRun] = useState<DriverRunDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const detail = await adminApi.tripRun(id);
      setRun(detail);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!id) return;
    const s = getAdminSocket();
    const onRunUpdated = (payload: { id?: string }) => {
      if (!payload?.id || payload.id === id) void load();
    };
    s.on(RealtimeEvents.tripRunUpdated, onRunUpdated);
    return () => {
      s.off(RealtimeEvents.tripRunUpdated, onRunUpdated);
    };
  }, [id, load]);

  const pickupStops = useMemo(
    () =>
      (run?.stops ?? []).filter(
        (s) => s.ref_type === 'BOOKING' && s.kind === 'PICKUP',
      ),
    [run],
  );
  const cargoStops = useMemo(
    () =>
      (run?.stops ?? []).filter(
        (s) => s.ref_type === 'CARGO' && s.kind === 'DROPOFF',
      ),
    [run],
  );

  const handleDispatch = async () => {
    if (!run) return;
    try {
      await adminApi.changeTripRunStatus(run.id, 'DISPATCHED');
      toast.success(`Đã xuất lệnh chuyến ${run.code} xuống App Tài xế!`);
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể xuất lệnh');
    }
  };

  const handleCancelRun = async () => {
    if (!run) return;
    if (
      !(await confirm({
        title: `Hủy chuyến chạy ${run.code}?`,
        content:
          'Toàn bộ vé và vận đơn gắn với chuyến này sẽ được trả về rổ chờ.',
        okText: 'Hủy chuyến',
        danger: true,
      }))
    ) {
      return;
    }
    try {
      await adminApi.changeTripRunStatus(run.id, 'CANCELLED');
      toast.success('Đã hủy chuyến chạy');
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể hủy chuyến');
    }
  };

  return (
    <AdminShell
      title="Chi tiết Chuyến"
      subtitle="Timeline thời gian thực · Danh sách khách & hàng hóa theo chuyến"
      breadcrumbs={[
        { label: 'Chuyến (Trip Runs)', href: '/trip-runs' },
        { label: run?.code ?? 'Chi tiết' },
      ]}
      headerExtra={
        <div className="flex items-center gap-2">
          <Link href="/trip-runs">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowLeft className="size-4" />}
            >
              Danh sách
            </Button>
          </Link>
          {run && (
            <>
              <Link href={`/trip-runs/${run.id}/manifest`}>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FileText className="size-4" />}
                >
                  Phơi lệnh (Manifest)
                </Button>
              </Link>
              <Link href={`/trip-runs/${run.id}/edit`}>
                <Button size="sm" leftIcon={<Edit className="size-4" />}>
                  Chỉnh sửa Chuyến
                </Button>
              </Link>
            </>
          )}
        </div>
      }
    >
      {error ? (
        <Card>
          <ErrorState onRetry={load} />
        </Card>
      ) : loading || !run ? (
        <Card className="flex flex-col gap-4">
          <Skeleton className="h-32 w-full" rounded="card" />
          <Skeleton className="h-64 w-full" rounded="card" />
        </Card>
      ) : (
        <DetailLayout
          main={
            <>
              {/* Top Info Card (frame nvTripRunDet) */}
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border-subtle pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-mono text-2xl font-bold text-brand-fg">
                        {run.code}
                      </h2>
                      <StatusTag domain="tripRun" status={run.status} />
                    </div>
                    <p className="mt-1 text-sm font-medium text-fg">
                      Tuyến: {run.trip.route.name} · Khởi hành{' '}
                      <DateTime value={run.trip.departure_at} />
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {run.status === 'PENDING' && (
                      <Button
                        size="sm"
                        leftIcon={<Send className="size-4" />}
                        onClick={handleDispatch}
                      >
                        Xuất lệnh xuống App
                      </Button>
                    )}
                    {(run.status === 'PENDING' ||
                      run.status === 'DISPATCHED') && (
                      <Button
                        size="sm"
                        variant="danger"
                        leftIcon={<XCircle className="size-4" />}
                        onClick={handleCancelRun}
                      >
                        Hủy chuyến
                      </Button>
                    )}
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={load}
                      aria-label="Làm mới"
                    >
                      <RefreshCw className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4">
                  <DescriptionList
                    columns={3}
                    items={[
                      {
                        label: 'Phương tiện',
                        value: (
                          <Link
                            href={`/vehicles/${run.vehicle.id}`}
                            className="font-mono font-semibold text-brand-fg hover:underline"
                          >
                            {run.vehicle.license_plate} ({run.vehicle.capacity}{' '}
                            chỗ)
                          </Link>
                        ),
                      },
                      {
                        label: 'Tài xế phụ trách',
                        value: (
                          <span>
                            <Link
                              href={`/vehicles/drivers/${run.driver.id}`}
                              className="font-semibold text-fg hover:text-brand-fg"
                            >
                              {run.driver.full_name}
                            </Link>{' '}
                            (<Phone value={run.driver.phone} link />)
                          </span>
                        ),
                      },
                      {
                        label: 'Lấp đầy & Hàng hóa',
                        value: `${run.passenger_count}/${run.vehicle.capacity} khách · ${run.cargo_count} kiện hàng`,
                      },
                    ]}
                  />
                </div>
              </Card>

              {/* Passenger Pickups & Cargo Lists (frame nvTripRunDetListsRow) */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader
                    title="Danh sách khách (theo thứ tự đón)"
                    description="Cập nhật trực tiếp khi tài xế xác nhận đón/trả trên App"
                    actions={
                      <Badge tone="brand">
                        <Users className="size-3.5" />
                        {pickupStops.length} điểm đón
                      </Badge>
                    }
                  />
                  {pickupStops.length === 0 ? (
                    <p className="py-8 text-center text-sm text-fg-muted">
                      Chưa có hành khách nào trên chuyến này.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {pickupStops.map((s, idx) => {
                        const drop = run.stops.find(
                          (x) => x.ref_id === s.ref_id && x.kind === 'DROPOFF',
                        );
                        return (
                          <div
                            key={s.ref_id}
                            className="rounded-control border border-border-subtle bg-surface-2 p-3.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex size-6 items-center justify-center rounded-full bg-brand-subtle font-mono text-xs font-bold text-brand-fg">
                                  {String(s.order ?? idx + 1).padStart(2, '0')}
                                </span>
                                <Link
                                  href={`/bookings/${s.ref_id}`}
                                  className="text-sm font-semibold text-fg hover:text-brand-fg"
                                >
                                  {s.name}
                                </Link>
                                <Badge tone="neutral">
                                  Ghế {s.seats.join(', ')}
                                </Badge>
                              </div>
                              <StatusTag
                                domain="booking"
                                status={s.status as never}
                              />
                            </div>
                            <p className="mt-1 text-xs text-fg-muted">
                              SĐT: <Phone value={s.phone} link />
                            </p>
                            <div className="mt-2 space-y-1 text-xs">
                              <p className="text-fg-secondary">
                                <span className="font-medium text-fg-muted">
                                  Đón:
                                </span>{' '}
                                {s.address}
                              </p>
                              {drop && (
                                <p className="text-fg-secondary">
                                  <span className="font-medium text-fg-muted">
                                    Trả (#{drop.order ?? idx + 1}):
                                  </span>{' '}
                                  {drop.address}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>

                <Card>
                  <CardHeader
                    title="Hàng hóa đi kèm"
                    description="Kiện ký gửi và số tiền thu hộ COD trên chuyến"
                    actions={
                      <Badge tone="info">
                        <Package className="size-3.5" />
                        {cargoStops.length} kiện
                      </Badge>
                    }
                  />
                  {cargoStops.length === 0 ? (
                    <p className="py-8 text-center text-sm text-fg-muted">
                      Không có kiện hàng ký gửi trên chuyến này.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {cargoStops.map((c) => (
                        <div
                          key={c.ref_id}
                          className="rounded-control border border-border-subtle bg-surface-2 p-3.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <Link
                              href={`/cargos/${c.ref_id}`}
                              className="text-sm font-semibold text-fg hover:text-brand-fg"
                            >
                              Người nhận: {c.name}
                            </Link>
                            <StatusTag
                              domain="cargo"
                              status={c.status as never}
                            />
                          </div>
                          <p className="mt-1 text-xs text-fg-secondary">
                            Giao tại: {c.address} · <Phone value={c.phone} />
                          </p>
                          {c.cod_amount_vnd ? (
                            <p className="mt-1.5 text-xs font-semibold text-brand-fg">
                              COD cần thu: <Money value={c.cod_amount_vnd} />
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Route Map */}
              <Card>
                <CardHeader
                  title="Bản đồ lộ trình đón / trả"
                  description="Thứ tự các điểm dừng PostGIS của chuyến xe"
                />
                <MapView
                  height={300}
                  markers={run.stops
                    .filter((s) => s.location.lat !== 0)
                    .map((s, idx) => ({
                      id: `${s.ref_id}-${s.kind}`,
                      lat: s.location.lat,
                      lng: s.location.lng,
                      label: String(s.order ?? idx + 1),
                      title: `${s.kind === 'PICKUP' ? 'Đón' : 'Trả'}: ${s.name} — ${s.address}`,
                      tone: s.kind === 'PICKUP' ? 'info' : 'brand',
                    }))}
                  polyline={run.stops
                    .filter((s) => s.location.lat !== 0)
                    .map((s) => s.location)}
                />
              </Card>
            </>
          }
          aside={
            <Card>
              <CardHeader
                title="Timeline hành trình"
                description="Sự kiện realtime từ Socket.io"
              />
              <Timeline
                items={[
                  {
                    title: 'Khởi tạo chuyến xe',
                    description: `Xe ${run.vehicle.license_plate} · ${run.driver.full_name}`,
                    tone: 'brand',
                  },
                  ...(run.dispatched_at
                    ? [
                        {
                          title: 'Đã xuất lệnh xuống App Tài xế',
                          time: <DateTime value={run.dispatched_at} />,
                          tone: 'info' as const,
                        },
                      ]
                    : []),
                  ...(run.started_at
                    ? [
                        {
                          title: 'Tài xế bắt đầu hành trình',
                          time: <DateTime value={run.started_at} />,
                          tone: 'brand' as const,
                        },
                      ]
                    : []),
                  ...pickupStops
                    .filter(
                      (s) =>
                        s.status === 'PICKED_UP' || s.status === 'DROPPED_OFF',
                    )
                    .map((s) => ({
                      title: `Đã đón ${s.name} (Ghế ${s.seats.join(', ')})`,
                      description: s.address,
                      tone: 'success' as const,
                    })),
                  ...(run.finished_at
                    ? [
                        {
                          title: 'Hoàn thành chuyến xe',
                          time: <DateTime value={run.finished_at} />,
                          tone: 'success' as const,
                        },
                      ]
                    : []),
                ]}
              />
            </Card>
          }
        />
      )}
    </AdminShell>
  );
}
