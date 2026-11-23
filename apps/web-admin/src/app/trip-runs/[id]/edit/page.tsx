'use client';

import type {
  DriverDto,
  DriverRunDetailDto,
  DriverStopDto,
  VehicleDto,
} from '@limousine-workspace/shared-types';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ErrorState,
  Field,
  FormSection,
  Phone,
  Skeleton,
  StatusTag,
  useToast,
} from '@limousine-workspace/shared-ui';
import {
  estimateEtaMinutes,
  roadDistanceKm,
} from '@limousine-workspace/utils-map';
import { Select } from 'antd';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Calculator,
  Save,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminShell } from '../../../../components/shell/AdminShell';
import { adminApi } from '../../../../lib/api';

export default function TripRunEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const [run, setRun] = useState<DriverRunDetailDto | null>(null);
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [drivers, setDrivers] = useState<DriverDto[]>([]);

  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [pickups, setPickups] = useState<DriverStopDto[]>([]);
  const [dropoffs, setDropoffs] = useState<DriverStopDto[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [detail, vRes, dRes] = await Promise.all([
        adminApi.tripRun(id),
        adminApi.vehicles({ limit: 100 }),
        adminApi.drivers({ limit: 100 }),
      ]);
      setRun(detail);
      setVehicles(vRes.items);
      setDrivers(dRes.items);
      setVehicleId(detail.vehicle.id);
      setDriverId(detail.driver.id);
      setPickups(
        detail.stops.filter(
          (s) => s.ref_type === 'BOOKING' && s.kind === 'PICKUP',
        ),
      );
      setDropoffs(
        detail.stops.filter(
          (s) => s.ref_type === 'BOOKING' && s.kind === 'DROPOFF',
        ),
      );
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const moveItem = (
    list: DriverStopDto[],
    setList: (next: DriverStopDto[]) => void,
    idx: number,
    dir: -1 | 1,
  ) => {
    const target = idx + dir;
    if (target < 0 || target >= list.length) return;
    const copy = [...list];
    const [removed] = copy.splice(idx, 1);
    copy.splice(target, 0, removed);
    setList(copy);
  };

  const etaStats = useMemo(() => {
    let totalKm = 0;
    const pts = [...pickups, ...dropoffs]
      .map((s) => s.location)
      .filter((p) => p.lat !== 0);
    for (let i = 0; i < pts.length - 1; i++) {
      totalKm += roadDistanceKm(pts[i], pts[i + 1]);
    }
    return {
      distanceKm: Math.round(totalKm * 10) / 10,
      etaMin: estimateEtaMinutes(totalKm),
    };
  }, [pickups, dropoffs]);

  const handleSave = async () => {
    if (!run) return;
    setSaving(true);
    try {
      if (vehicleId !== run.vehicle.id || driverId !== run.driver.id) {
        await adminApi.updateTripRun(run.id, {
          vehicle_id: vehicleId,
          driver_id: driverId,
        });
      }
      if (pickups.length > 0 || dropoffs.length > 0) {
        await adminApi.reorderTripRunStops(run.id, {
          pickup: pickups.map((s) => s.ref_id),
          dropoff: dropoffs.map((s) => s.ref_id),
        });
      }
      toast.success('Đã lưu thứ tự đón/trả và cấu hình chuyến');
      router.push(`/trip-runs/${run.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể lưu thay đổi');
    } finally {
      setSaving(false);
    }
  };

  const handleDispatch = async () => {
    if (!run) return;
    await handleSave();
    try {
      await adminApi.changeTripRunStatus(run.id, 'DISPATCHED');
      toast.success(`Đã xuất lệnh chuyến ${run.code}!`);
      router.push(`/trip-runs/${run.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể xuất lệnh');
    }
  };

  return (
    <AdminShell
      title="Chỉnh sửa Chuyến"
      subtitle="Sắp xếp thứ tự đón/trả · Tính ETA · Đổi xe/tài xế · Xuất lệnh"
      breadcrumbs={[
        { label: 'Chuyến (Trip Runs)', href: '/trip-runs' },
        { label: run?.code ?? 'Chi tiết', href: `/trip-runs/${id}` },
        { label: 'Chỉnh sửa' },
      ]}
      headerExtra={
        <Link href={`/trip-runs/${id}`}>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ArrowLeft className="size-4" />}
          >
            Quay lại
          </Button>
        </Link>
      }
    >
      {error ? (
        <Card>
          <ErrorState onRetry={load} />
        </Card>
      ) : loading || !run ? (
        <Card>
          <Skeleton className="h-64 w-full" rounded="card" />
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Warning & Save Bar (frame nvTripRunEditWarn) */}
          <Card className="flex flex-wrap items-center justify-between gap-4 border-warning-border bg-warning-bg/30">
            <div>
              <p className="text-sm font-semibold text-warning-fg">
                Chỉnh sửa thứ tự đón/trả sẽ ảnh hưởng lộ trình dẫn đường trên
                App Tài xế.
              </p>
              <p className="text-xs text-fg-secondary">
                Tổng quãng đường ước tính: ~{etaStats.distanceKm} km · Thời gian
                di chuyển dự kiến: ~{etaStats.etaMin} phút
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Calculator className="size-4" />}
                onClick={() =>
                  toast.info(
                    `Đã tính lại ETA: ~${etaStats.distanceKm} km (~${etaStats.etaMin} phút)`,
                  )
                }
              >
                Tính lại ETA
              </Button>
              <Button
                size="sm"
                loading={saving}
                leftIcon={<Save className="size-4" />}
                onClick={handleSave}
              >
                Lưu thay đổi
              </Button>
              {run.status === 'PENDING' && (
                <Button
                  size="sm"
                  leftIcon={<Send className="size-4" />}
                  onClick={handleDispatch}
                >
                  Xuất lệnh
                </Button>
              )}
            </div>
          </Card>

          {/* Vehicle & Driver Selector */}
          <Card>
            <FormSection
              title="Phương tiện & Tài xế"
              description="Chỉ đổi được xe và tài xế khi chuyến chưa lăn bánh."
            >
              <Field label="Phương tiện">
                {() => (
                  <Select
                    className="w-full"
                    value={vehicleId}
                    onChange={(v) => setVehicleId(v)}
                    options={vehicles.map((v) => ({
                      value: v.id,
                      label: `${v.license_plate} — ${v.vehicle_type.name} (${v.vehicle_type.capacity} chỗ)`,
                    }))}
                  />
                )}
              </Field>
              <Field label="Tài xế">
                {() => (
                  <Select
                    className="w-full"
                    value={driverId}
                    onChange={(v) => setDriverId(v)}
                    options={drivers.map((d) => ({
                      value: d.id,
                      label: `${d.full_name} (${d.phone})`,
                    }))}
                  />
                )}
              </Field>
            </FormSection>
          </Card>

          {/* Stop Ordering Lists (frame nvTripRunEditDnD) */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader
                title="Thứ tự Đón khách (Pickup Order)"
                description="Dùng nút lên/xuống để điều chỉnh thứ tự tài xế đến đón"
              />
              <div className="flex flex-col gap-2.5">
                {pickups.map((s, idx) => (
                  <div
                    key={s.ref_id}
                    className="flex items-center justify-between gap-3 rounded-control border border-border-subtle bg-surface-2 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-brand font-mono text-xs font-bold text-on-brand">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-fg">
                            {s.name}
                          </span>
                          <Badge tone="brand">Ghế {s.seats.join(', ')}</Badge>
                        </div>
                        <p className="truncate text-xs text-fg-muted">
                          Đón: {s.address} · <Phone value={s.phone} />
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <StatusTag domain="booking" status={s.status as never} />
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        disabled={idx === 0}
                        onClick={() => moveItem(pickups, setPickups, idx, -1)}
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        disabled={idx === pickups.length - 1}
                        onClick={() => moveItem(pickups, setPickups, idx, 1)}
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader
                title="Thứ tự Trả khách (Dropoff Order)"
                description="Thứ tự trả khách khi xe đến điểm đích"
              />
              <div className="flex flex-col gap-2.5">
                {dropoffs.map((s, idx) => (
                  <div
                    key={s.ref_id}
                    className="flex items-center justify-between gap-3 rounded-control border border-border-subtle bg-surface-2 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-3 font-mono text-xs font-bold text-fg">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-fg">
                            {s.name}
                          </span>
                          <Badge tone="neutral">Ghế {s.seats.join(', ')}</Badge>
                        </div>
                        <p className="truncate text-xs text-fg-muted">
                          Trả: {s.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        disabled={idx === 0}
                        onClick={() => moveItem(dropoffs, setDropoffs, idx, -1)}
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        disabled={idx === dropoffs.length - 1}
                        onClick={() => moveItem(dropoffs, setDropoffs, idx, 1)}
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
