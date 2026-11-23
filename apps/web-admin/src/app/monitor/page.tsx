'use client';

import type {
  DriverLocationEvent,
  DriverRunDetailDto,
  IncidentDto,
  TripRunDto,
} from '@limousine-workspace/shared-types';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DateTime,
  EmptyState,
  ErrorState,
  Field,
  Input,
  MapView,
  Phone,
  Skeleton,
  StatusTag,
  cn,
  useToast,
} from '@limousine-workspace/shared-ui';
import { RealtimeEvents } from '@limousine-workspace/utils-core';
import { Modal } from 'antd';
import {
  AlertTriangle,
  Bus,
  CheckCircle2,
  Gauge,
  MessageSquare,
  Navigation,
  RefreshCw,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminShell } from '../../components/shell/AdminShell';
import { adminApi } from '../../lib/api';
import { getAdminSocket } from '../../lib/socket';

export default function MonitorPage() {
  const toast = useToast();

  const [runs, setRuns] = useState<TripRunDto[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string>('');
  const [selectedDetail, setSelectedDetail] =
    useState<DriverRunDetailDto | null>(null);
  const [incidents, setIncidents] = useState<IncidentDto[]>([]);
  const [locations, setLocations] = useState<
    Record<string, DriverLocationEvent>
  >({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  // Incident resolution modal
  const [resolvingInc, setResolvingInc] = useState<IncidentDto | null>(null);
  const [resNote, setResNote] = useState('');
  const [resSaving, setResSaving] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rRes, iRes] = await Promise.all([
        adminApi.tripRuns({ limit: 50 }),
        adminApi.incidents({ limit: 20 }),
      ]);
      const activeOrDispatched = rRes.items.filter((r) =>
        ['IN_PROGRESS', 'DISPATCHED', 'PENDING'].includes(r.status),
      );
      const list =
        activeOrDispatched.length > 0 ? activeOrDispatched : rRes.items;
      setRuns(list);
      setIncidents(iRes.items);
      if (!selectedRunId && list[0]) {
        setSelectedRunId(list[0].id);
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [selectedRunId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!selectedRunId) {
      setSelectedDetail(null);
      return;
    }
    void adminApi
      .tripRun(selectedRunId)
      .then(setSelectedDetail)
      .catch(() => null);
  }, [selectedRunId]);

  // Live Socket.io telemetry
  useEffect(() => {
    const s = getAdminSocket();
    const onLocation = (ev: DriverLocationEvent) => {
      setLocations((prev) => ({
        ...prev,
        [ev.driver_id]: ev,
      }));
    };
    const onRunUpdated = () => {
      void loadAll();
      if (selectedRunId) {
        void adminApi
          .tripRun(selectedRunId)
          .then(setSelectedDetail)
          .catch(() => null);
      }
    };
    const onIncident = () => {
      void loadAll();
    };

    s.on(RealtimeEvents.driverLocation, onLocation);
    s.on(RealtimeEvents.tripRunUpdated, onRunUpdated);
    s.on(RealtimeEvents.incidentReported, onIncident);
    return () => {
      s.off(RealtimeEvents.driverLocation, onLocation);
      s.off(RealtimeEvents.tripRunUpdated, onRunUpdated);
      s.off(RealtimeEvents.incidentReported, onIncident);
    };
  }, [loadAll, selectedRunId]);

  const selectedRun = useMemo(
    () => runs.find((r) => r.id === selectedRunId) ?? runs[0] ?? null,
    [runs, selectedRunId],
  );

  const selectedLoc = selectedRun
    ? locations[selectedRun.driver.id]
    : undefined;

  const pickupProgress = useMemo(() => {
    if (!selectedDetail) {
      return {
        picked: 0,
        total: selectedRun?.passenger_count ?? 0,
        pct: 0,
      };
    }
    const pickups = selectedDetail.stops.filter(
      (s) => s.ref_type === 'BOOKING' && s.kind === 'PICKUP',
    );
    const done = pickups.filter(
      (s) => s.status === 'PICKED_UP' || s.status === 'DROPPED_OFF',
    ).length;
    const total = pickups.length || selectedRun?.passenger_count || 0;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { picked: done, total, pct };
  }, [selectedDetail, selectedRun]);

  const mapMarkers = useMemo(() => {
    const out: {
      id: string;
      lat: number;
      lng: number;
      label: string;
      title: string;
      tone: 'brand' | 'info' | 'success' | 'danger';
    }[] = [];

    // Live vehicle GPS markers
    runs.forEach((r, idx) => {
      const loc = locations[r.driver.id];
      if (loc) {
        out.push({
          id: `veh-${r.id}`,
          lat: loc.lat,
          lng: loc.lng,
          label: `Xe ${idx + 1}`,
          title: `${r.vehicle.license_plate} · ${r.driver.full_name} (${loc.speed_kmh ?? 0} km/h)`,
          tone: r.id === selectedRun?.id ? 'brand' : 'success',
        });
      }
    });

    // Selected run stop markers
    if (selectedDetail) {
      selectedDetail.stops
        .filter((s) => s.location.lat !== 0)
        .forEach((s, idx) => {
          out.push({
            id: `stop-${s.ref_id}-${s.kind}`,
            lat: s.location.lat,
            lng: s.location.lng,
            label: String(s.order ?? idx + 1),
            title: `${s.kind === 'PICKUP' ? 'Đón' : 'Trả'}: ${s.name} — ${s.address}`,
            tone: s.kind === 'PICKUP' ? 'info' : 'brand',
          });
        });
    }

    // Open SOS incidents
    incidents
      .filter((i) => i.status !== 'RESOLVED' && i.location)
      .forEach((i) => {
        if (!i.location) return;
        out.push({
          id: `inc-${i.id}`,
          lat: i.location.lat,
          lng: i.location.lng,
          label: 'SOS',
          title: `SOS ${i.driver.full_name}: ${i.description}`,
          tone: 'danger',
        });
      });

    return out;
  }, [runs, locations, selectedRun, selectedDetail, incidents]);

  const handleResolveIncident = async () => {
    if (!resolvingInc) return;
    setResSaving(true);
    try {
      await adminApi.updateIncident(resolvingInc.id, {
        status: 'RESOLVED',
        resolution_note: resNote.trim() || 'Đã xử lý xong từ Command Center',
      });
      toast.success('Đã đóng sự cố SOS');
      setResolvingInc(null);
      setResNote('');
      await loadAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi cập nhật sự cố');
    } finally {
      setResSaving(false);
    }
  };

  return (
    <AdminShell
      title="Giám sát Hành trình"
      subtitle="Theo dõi xe thời gian thực · GPS / Socket.io · Command Center"
      headerExtra={
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RefreshCw className="size-3.5" />}
          onClick={loadAll}
        >
          Làm mới
        </Button>
      }
    >
      {error ? (
        <Card>
          <ErrorState onRetry={loadAll} />
        </Card>
      ) : loading ? (
        <Card>
          <Skeleton className="h-[520px] w-full" rounded="card" />
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Main Map + Telemetry Popup + Active Fleet List (frame nvGsMap) */}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <Card padding="none" className="relative overflow-hidden">
              <MapView
                height={540}
                markers={mapMarkers}
                polyline={
                  selectedDetail
                    ? selectedDetail.stops
                        .filter((s) => s.location.lat !== 0)
                        .map((s) => s.location)
                    : undefined
                }
              />

              {/* Floating Telemetry Card (frame gsPopup in nvGsMap) */}
              {selectedRun && (
                <div className="border-t border-border-subtle bg-surface-1/95 p-5 backdrop-blur-md sm:absolute sm:bottom-4 sm:left-4 sm:w-[360px] sm:rounded-card sm:border sm:shadow-e3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-brand-fg">
                          {selectedRun.vehicle.license_plate}
                        </span>
                        <StatusTag
                          domain="tripRun"
                          status={selectedRun.status}
                        />
                      </div>
                      <p className="mt-0.5 font-mono text-xs text-fg-muted">
                        Chuyến {selectedRun.code}
                      </p>
                    </div>
                    <Link href={`/trip-runs/${selectedRun.id}`}>
                      <Button size="sm" variant="secondary">
                        Chi tiết →
                      </Button>
                    </Link>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 rounded-control border border-border-subtle bg-surface-2 p-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Gauge className="size-4 text-brand-fg" />
                      <div>
                        <p className="text-fg-muted">Tốc độ GPS</p>
                        <p className="font-mono font-semibold text-fg">
                          {selectedLoc?.speed_kmh !== null &&
                          selectedLoc?.speed_kmh !== undefined
                            ? `${Math.round(selectedLoc.speed_kmh)} km/h`
                            : 'Đang chờ ping…'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-info-fg" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-fg">
                          {selectedRun.driver.full_name}
                        </p>
                        <Phone
                          value={selectedRun.driver.phone}
                          link
                          className="text-fg-muted"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar (frame gsPopProg: Đã đón X/Y · Đang tới điểm trả) */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-fg">
                        Tiến độ đón/trả khách
                      </span>
                      <span className="font-mono font-semibold text-brand-fg">
                        Đã đón {pickupProgress.picked}/{pickupProgress.total}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-pill bg-surface-3">
                      <div
                        className="h-full rounded-pill bg-brand transition-all"
                        style={{ width: `${pickupProgress.pct}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-fg-muted">
                      {selectedLoc
                        ? `Cập nhật vị trí lúc ${new Date(selectedLoc.recorded_at).toLocaleTimeString('vi-VN')}`
                        : `Tổng ${selectedRun.passenger_count}/${selectedRun.vehicle.capacity} khách · ${selectedRun.cargo_count} kiện hàng`}
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {/* Right Column: Active Vehicles & Runs List */}
            <Card className="flex max-h-[540px] flex-col">
              <CardHeader
                title="Đội xe trên tuyến"
                description="Chọn xe để xem lộ trình và tốc độ thời gian thực"
                actions={<Badge tone="brand">{runs.length} chuyến</Badge>}
              />
              {runs.length === 0 ? (
                <EmptyState
                  compact
                  title="Chưa có chuyến xe nào"
                  description="Xuất lệnh từ màn Điều phối để theo dõi hành trình."
                />
              ) : (
                <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto pr-1">
                  {runs.map((r) => {
                    const active = r.id === selectedRun?.id;
                    const loc = locations[r.driver.id];
                    return (
                      <div
                        key={r.id}
                        onClick={() => setSelectedRunId(r.id)}
                        className={cn(
                          'cursor-pointer rounded-control border p-3.5 transition-colors',
                          active
                            ? 'border-brand-border bg-brand-subtle'
                            : 'border-border-subtle bg-surface-2 hover:border-border-strong',
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Bus className="size-4 text-brand-fg" />
                            <span className="font-mono text-sm font-bold text-fg">
                              {r.vehicle.license_plate}
                            </span>
                            {loc && (
                              <Badge tone="success">
                                <Navigation className="size-3" />
                                {Math.round(loc.speed_kmh ?? 0)} km/h
                              </Badge>
                            )}
                          </div>
                          <StatusTag domain="tripRun" status={r.status} />
                        </div>

                        <p className="mt-1.5 text-xs text-fg-secondary">
                          Tài xế:{' '}
                          <span className="font-medium text-fg">
                            {r.driver.full_name}
                          </span>{' '}
                          · {r.passenger_count}/{r.vehicle.capacity} khách
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-fg-muted">
                          <span className="font-mono">{r.code}</span>
                          <Link
                            href={`/call-center?tab=inbox&driver=${r.driver.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 font-semibold text-brand-fg hover:underline"
                          >
                            <MessageSquare className="size-3" />
                            Chat tài xế
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* SOS & Incidents Panel */}
          <Card>
            <CardHeader
              title="Cảnh báo SOS & Sự cố trên đường"
              description="Tín hiệu khẩn cấp gửi từ ứng dụng Tài xế"
              actions={
                <Badge
                  tone={
                    incidents.some((i) => i.status !== 'RESOLVED')
                      ? 'danger'
                      : 'success'
                  }
                >
                  {incidents.filter((i) => i.status !== 'RESOLVED').length} sự
                  cố đang mở
                </Badge>
              }
            />

            {incidents.length === 0 ? (
              <p className="py-6 text-center text-sm text-fg-muted">
                Không có báo cáo sự cố hay tín hiệu SOS nào.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {incidents.map((inc) => (
                  <div
                    key={inc.id}
                    className={cn(
                      'rounded-card border p-4',
                      inc.status === 'RESOLVED'
                        ? 'border-border-subtle bg-surface-2'
                        : 'border-danger-border bg-danger-bg/25',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={cn(
                            'size-4',
                            inc.status === 'RESOLVED'
                              ? 'text-fg-muted'
                              : 'text-danger-fg',
                          )}
                        />
                        <div>
                          <p className="text-sm font-semibold text-fg">
                            {inc.driver.full_name}
                          </p>
                          <Phone
                            value={inc.driver.phone}
                            link
                            className="text-xs text-fg-muted"
                          />
                        </div>
                      </div>
                      <StatusTag domain="incident" status={inc.status} />
                    </div>

                    <p className="mt-2 text-sm text-fg-secondary">
                      <Badge tone="neutral" className="mr-1.5">
                        {inc.kind}
                      </Badge>
                      {inc.description}
                    </p>
                    <p className="mt-1 text-xs text-fg-muted">
                      Báo lúc: <DateTime value={inc.created_at} />
                    </p>

                    {inc.status !== 'RESOLVED' && (
                      <div className="mt-3 flex items-center justify-end gap-2">
                        {inc.status === 'OPEN' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={async () => {
                              await adminApi.updateIncident(inc.id, {
                                status: 'ACKNOWLEDGED',
                              });
                              toast.info('Đã xác nhận tiếp nhận SOS');
                              void loadAll();
                            }}
                          >
                            Tiếp nhận
                          </Button>
                        )}
                        <Button
                          size="sm"
                          leftIcon={<CheckCircle2 className="size-3.5" />}
                          onClick={() => {
                            setResolvingInc(inc);
                            setResNote('');
                          }}
                        >
                          Đã giải quyết
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      <Modal
        open={Boolean(resolvingInc)}
        onCancel={() => setResolvingInc(null)}
        title="Xác nhận đã xử lý sự cố SOS"
        footer={null}
      >
        <div className="mt-4 flex flex-col gap-4">
          <Field label="Ghi chú phương án xử lý">
            {(p) => (
              <Input
                {...p}
                value={resNote}
                onChange={(e) => setResNote(e.target.value)}
                placeholder="VD: Đã điều xe dự phòng hỗ trợ khách…"
              />
            )}
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setResolvingInc(null)}>
              Hủy
            </Button>
            <Button loading={resSaving} onClick={handleResolveIncident}>
              Đóng sự cố
            </Button>
          </div>
        </div>
      </Modal>
    </AdminShell>
  );
}
