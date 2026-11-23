'use client';

import type {
  PriceRuleDto,
  RouteDto,
  StopDto,
  StopKind,
  TimeSlotDto,
  TripBatchDto,
  VehicleTypeDto,
} from '@limousine-workspace/shared-types';
import {
  AddressAutocomplete,
  Badge,
  Button,
  Card,
  CardFooter,
  CardHeader,
  DataTable,
  DateTime,
  ErrorState,
  Field,
  FormSection,
  type GeoAddress,
  Input,
  MapView,
  Money,
  SegmentedControl,
  StatusTag,
  Switch,
  Textarea,
  useConfirm,
  useToast,
} from '@limousine-workspace/shared-ui';
import { Modal, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Bell,
  Clock,
  Edit,
  MapPin,
  Plus,
  RefreshCw,
  Route as RouteIcon,
  ShieldAlert,
  Sparkles,
  Tag,
  Trash2,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { AdminShell } from '../../components/shell/AdminShell';
import { type AdminSettingsMap, adminApi } from '../../lib/api';

type SettingsTab =
  | 'routes'
  | 'time-slots'
  | 'pricing'
  | 'cod'
  | 'notifications';

const DAY_LABELS: [number, string][] = [
  [1, 'T2'],
  [2, 'T3'],
  [3, 'T4'],
  [4, 'T5'],
  [5, 'T6'],
  [6, 'T7'],
  [0, 'CN'],
];

function SettingsConsoleContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();

  const initialTab = (searchParams.get('tab') as SettingsTab) || 'routes';
  const [tab, setTab] = useState<SettingsTab>(
    ['routes', 'time-slots', 'pricing', 'cod', 'notifications'].includes(
      initialTab,
    )
      ? initialTab
      : 'routes',
  );

  const [routes, setRoutes] = useState<RouteDto[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeDto[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlotDto[]>([]);
  const [priceRules, setPriceRules] = useState<PriceRuleDto[]>([]);
  const [batches, setBatches] = useState<TripBatchDto[]>([]);
  const [settings, setSettings] = useState<AdminSettingsMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  // Selected route for Stops management
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');

  // Route modal
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteDto | null>(null);
  const [rCode, setRCode] = useState('');
  const [rName, setRName] = useState('');
  const [rOrigin, setROrigin] = useState('');
  const [rDest, setRDest] = useState('');
  const [rDist, setRDist] = useState('150');
  const [rDur, setRDur] = useState('150');
  const [rActive, setRActive] = useState(true);
  const [routeSaving, setRouteSaving] = useState(false);

  // Stop modal
  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [sName, setSName] = useState('');
  const [sAddr, setSAddr] = useState<GeoAddress>({
    address: '',
    lat: 21.0285,
    lng: 105.8542,
  });
  const [sKind, setSKind] = useState<StopKind>('BOTH');
  const [sOrder, setSOrder] = useState('1');
  const [stopSaving, setStopSaving] = useState(false);

  // TimeSlot modal
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [tsRouteId, setTsRouteId] = useState('');
  const [tsTime, setTsTime] = useState('08:00');
  const [tsDays, setTsDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [tsTypeId, setTsTypeId] = useState('');
  const [tsVehicles, setTsVehicles] = useState('2');
  const [slotSaving, setSlotSaving] = useState(false);

  // Generate batches state
  const [genDays, setGenDays] = useState('7');
  const [generating, setGenerating] = useState(false);

  // PriceRule modal
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [prRouteId, setPrRouteId] = useState('');
  const [prTypeId, setPrTypeId] = useState('');
  const [prName, setPrName] = useState('Giá tiêu chuẩn');
  const [prBase, setPrBase] = useState('250000');
  const [prVip, setPrVip] = useState('50000');
  const [prPriority, setPrPriority] = useState('10');
  const [priceSaving, setPriceSaving] = useState(false);

  // Settings saving
  const [settingsSaving, setSettingsSaving] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rts, vts, ts, prs, bts, cfg] = await Promise.all([
        adminApi.routes(),
        adminApi.vehicleTypes(),
        adminApi.timeSlots(),
        adminApi.priceRules(),
        adminApi.tripBatches({ limit: 20 }),
        adminApi.settings(),
      ]);
      setRoutes(rts);
      setVehicleTypes(vts);
      setTimeSlots(ts);
      setPriceRules(prs);
      setBatches(bts.items);
      setSettings(cfg);
      if (rts.length > 0 && !selectedRouteId) {
        setSelectedRouteId(rts[0].id);
        setTsRouteId(rts[0].id);
        setPrRouteId(rts[0].id);
      }
      if (vts.length > 0 && !tsTypeId) {
        setTsTypeId(vts[0].id);
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [selectedRouteId, tsTypeId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const selectedRoute = useMemo(
    () => routes.find((r) => r.id === selectedRouteId) ?? routes[0] ?? null,
    [routes, selectedRouteId],
  );

  const openCreateRoute = () => {
    setEditingRoute(null);
    setRCode('');
    setRName('');
    setROrigin('Hà Nội');
    setRDest('Quảng Ninh');
    setRDist('155');
    setRDur('150');
    setRActive(true);
    setRouteModalOpen(true);
  };

  const openEditRoute = (r: RouteDto) => {
    setEditingRoute(r);
    setRCode(r.code);
    setRName(r.name);
    setROrigin(r.origin_name);
    setRDest(r.destination_name);
    setRDist(String(r.distance_km ?? 150));
    setRDur(String(r.duration_min));
    setRActive(r.is_active);
    setRouteModalOpen(true);
  };

  const handleSaveRoute = async () => {
    if (!rCode.trim() || !rName.trim() || !rOrigin.trim() || !rDest.trim()) {
      toast.error('Vui lòng nhập đầy đủ mã, tên tuyến và điểm đầu/cuối');
      return;
    }
    setRouteSaving(true);
    try {
      if (editingRoute) {
        await adminApi.updateRoute(editingRoute.id, {
          code: rCode.trim().toUpperCase(),
          name: rName.trim(),
          origin_name: rOrigin.trim(),
          destination_name: rDest.trim(),
          distance_km: Number(rDist) || undefined,
          duration_min: Number(rDur) || 120,
          is_active: rActive,
        });
        toast.success('Đã cập nhật tuyến đường');
      } else {
        const created = await adminApi.createRoute({
          code: rCode.trim().toUpperCase(),
          name: rName.trim(),
          origin_name: rOrigin.trim(),
          destination_name: rDest.trim(),
          distance_km: Number(rDist) || undefined,
          duration_min: Number(rDur) || 120,
          is_active: rActive,
        });
        setSelectedRouteId(created.id);
        toast.success('Đã tạo tuyến đường mới');
      }
      setRouteModalOpen(false);
      await loadAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể lưu tuyến');
    } finally {
      setRouteSaving(false);
    }
  };

  const handleCreateStop = async () => {
    if (!selectedRoute) return;
    if (!sName.trim() || !sAddr.address.trim()) {
      toast.error('Vui lòng nhập tên điểm dừng và địa chỉ');
      return;
    }
    setStopSaving(true);
    try {
      await adminApi.createStop(selectedRoute.id, {
        name: sName.trim(),
        address: sAddr.address.trim(),
        lat: sAddr.lat ?? 21.0285,
        lng: sAddr.lng ?? 105.8542,
        kind: sKind,
        sort_order: Number(sOrder) || 1,
      });
      toast.success('Đã thêm điểm đón/trả PostGIS');
      setStopModalOpen(false);
      setSName('');
      setSAddr({ address: '', lat: 21.0285, lng: 105.8542 });
      await loadAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi thêm điểm dừng');
    } finally {
      setStopSaving(false);
    }
  };

  const handleCreateTimeSlot = async () => {
    if (!tsRouteId || !tsTypeId || !tsTime) {
      toast.error('Vui lòng chọn tuyến, loại xe và giờ khởi hành');
      return;
    }
    setSlotSaving(true);
    try {
      await adminApi.createTimeSlot({
        route_id: tsRouteId,
        departure_time: tsTime,
        days_of_week: tsDays,
        vehicle_type_id: tsTypeId,
        planned_vehicles: Number(tsVehicles) || 1,
      });
      toast.success(`Đã thêm khung giờ ${tsTime}`);
      setSlotModalOpen(false);
      await loadAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể tạo khung giờ');
    } finally {
      setSlotSaving(false);
    }
  };

  const handleGenerateBatches = async () => {
    setGenerating(true);
    try {
      const res = await adminApi.generateTripBatches(Number(genDays) || 7);
      toast.success(
        `Đã đồng bộ & sinh mới ${res.created} lô chuyến (Trip_Batches)`,
      );
      await loadAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Đồng bộ thất bại');
    } finally {
      setGenerating(false);
    }
  };

  const handleCreatePriceRule = async () => {
    if (!prRouteId || !prName.trim()) {
      toast.error('Vui lòng chọn tuyến và nhập tên bảng giá');
      return;
    }
    setPriceSaving(true);
    try {
      await adminApi.createPriceRule({
        route_id: prRouteId,
        vehicle_type_id: prTypeId || undefined,
        name: prName.trim(),
        base_price_vnd: Number(prBase) || 0,
        vip_surcharge_vnd: Number(prVip) || 0,
        priority: Number(prPriority) || 10,
      });
      toast.success('Đã tạo quy tắc giá mới');
      setPriceModalOpen(false);
      await loadAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi tạo quy tắc giá');
    } finally {
      setPriceSaving(false);
    }
  };

  const handleSaveSettingKey = async <K extends keyof AdminSettingsMap>(
    key: K,
    value: AdminSettingsMap[K],
    successMsg: string,
  ) => {
    setSettingsSaving(true);
    try {
      const next = await adminApi.updateSetting(key, value);
      setSettings((prev) => (prev ? { ...prev, [key]: next } : prev));
      toast.success(successMsg);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Cập nhật cấu hình thất bại',
      );
    } finally {
      setSettingsSaving(false);
    }
  };

  const stopColumns: ColumnsType<StopDto> = useMemo(
    () => [
      {
        title: 'Thứ tự',
        dataIndex: 'sort_order',
        key: 'sort_order',
        width: 80,
        render: (o: number) => (
          <span className="font-mono text-xs font-semibold text-fg">#{o}</span>
        ),
      },
      {
        title: 'Tên điểm đón/trả',
        dataIndex: 'name',
        key: 'name',
        render: (n: string, s) => (
          <div>
            <p className="text-sm font-semibold text-fg">{n}</p>
            <p className="text-xs text-fg-muted">{s.address}</p>
          </div>
        ),
      },
      {
        title: 'Tọa độ PostGIS',
        key: 'coords',
        render: (_, s) => (
          <code className="font-mono text-xs text-fg-secondary">
            {s.location.lat.toFixed(4)}, {s.location.lng.toFixed(4)}
          </code>
        ),
      },
      {
        title: 'Vai trò',
        dataIndex: 'kind',
        key: 'kind',
        render: (k: StopKind) => (
          <Badge
            tone={
              k === 'PICKUP' ? 'info' : k === 'DROPOFF' ? 'success' : 'brand'
            }
          >
            {k === 'PICKUP'
              ? 'Điểm đón'
              : k === 'DROPOFF'
                ? 'Điểm trả'
                : 'Đón & Trả'}
          </Badge>
        ),
      },
      {
        title: 'Thao tác',
        key: 'actions',
        align: 'right',
        render: (_, s) => (
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Xóa điểm dừng"
            onClick={async () => {
              if (
                await confirm({
                  title: `Xóa điểm dừng "${s.name}"?`,
                  okText: 'Xóa',
                  danger: true,
                })
              ) {
                await adminApi.deleteStop(s.id);
                toast.success('Đã xóa điểm dừng');
                void loadAll();
              }
            }}
          >
            <Trash2 className="size-4 text-danger-fg" />
          </Button>
        ),
      },
    ],
    [confirm, loadAll, toast],
  );

  const slotColumns: ColumnsType<TimeSlotDto> = useMemo(
    () => [
      {
        title: 'Khung giờ',
        dataIndex: 'departure_time',
        key: 'departure_time',
        render: (t: string) => (
          <span className="font-mono text-base font-bold text-brand-fg">
            {t}
          </span>
        ),
      },
      {
        title: 'Tuyến đường',
        key: 'route',
        render: (_, s) => {
          const r = routes.find((x) => x.id === s.route_id);
          return (
            <span className="text-sm font-medium text-fg">
              {r?.name ?? s.route_id}
            </span>
          );
        },
      },
      {
        title: 'Loại xe & Số xe',
        key: 'vehicle',
        render: (_, s) => {
          const vt = vehicleTypes.find((x) => x.id === s.vehicle_type_id);
          return (
            <span className="text-ui text-fg-secondary">
              {vt?.name ?? 'Limousine'} · {s.planned_vehicles} xe/chuyến
            </span>
          );
        },
      },
      {
        title: 'Ngày hoạt động',
        key: 'days',
        render: (_, s) => (
          <div className="flex flex-wrap gap-1">
            {DAY_LABELS.map(([d, lbl]) => (
              <Badge
                key={d}
                tone={s.days_of_week.includes(d) ? 'brand' : 'neutral'}
              >
                {lbl}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'is_active',
        key: 'is_active',
        render: (act: boolean, s) => (
          <Switch
            checked={act}
            onChange={async (next) => {
              await adminApi.updateTimeSlot(s.id, { is_active: next });
              void loadAll();
            }}
          />
        ),
      },
      {
        title: 'Thao tác',
        key: 'actions',
        align: 'right',
        render: (_, s) => (
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={async () => {
              if (
                await confirm({
                  title: `Xóa khung giờ ${s.departure_time}?`,
                  okText: 'Xóa',
                  danger: true,
                })
              ) {
                await adminApi.deleteTimeSlot(s.id);
                toast.success('Đã xóa khung giờ');
                void loadAll();
              }
            }}
          >
            <Trash2 className="size-4 text-danger-fg" />
          </Button>
        ),
      },
    ],
    [confirm, loadAll, routes, toast, vehicleTypes],
  );

  const priceColumns: ColumnsType<PriceRuleDto> = useMemo(
    () => [
      {
        title: 'Tên quy tắc giá',
        dataIndex: 'name',
        key: 'name',
        render: (n: string) => (
          <span className="text-sm font-semibold text-fg">{n}</span>
        ),
      },
      {
        title: 'Tuyến áp dụng',
        key: 'route',
        render: (_, p) => {
          const r = routes.find((x) => x.id === p.route_id);
          return <span className="text-ui text-fg">{r?.name ?? '—'}</span>;
        },
      },
      {
        title: 'Loại xe',
        key: 'vt',
        render: (_, p) => {
          const vt = vehicleTypes.find((x) => x.id === p.vehicle_type_id);
          return (
            <span className="text-ui text-fg-secondary">
              {vt ? `${vt.name} (${vt.capacity} chỗ)` : 'Mọi loại xe'}
            </span>
          );
        },
      },
      {
        title: 'Giá ghế tiêu chuẩn',
        dataIndex: 'base_price_vnd',
        key: 'base_price_vnd',
        render: (v: number) => (
          <Money value={v} className="font-semibold text-fg" />
        ),
      },
      {
        title: 'Phụ thu ghế VIP',
        dataIndex: 'vip_surcharge_vnd',
        key: 'vip_surcharge_vnd',
        render: (v: number) => (
          <Money value={v} signed className="text-brand-fg" />
        ),
      },
      {
        title: 'Độ ưu tiên',
        dataIndex: 'priority',
        key: 'priority',
        render: (p: number) => <Badge tone="neutral">Mức {p}</Badge>,
      },
      {
        title: 'Thao tác',
        key: 'actions',
        align: 'right',
        render: (_, p) => (
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={async () => {
              if (
                await confirm({
                  title: `Xóa quy tắc giá "${p.name}"?`,
                  okText: 'Xóa',
                  danger: true,
                })
              ) {
                await adminApi.deletePriceRule(p.id);
                toast.success('Đã xóa quy tắc giá');
                void loadAll();
              }
            }}
          >
            <Trash2 className="size-4 text-danger-fg" />
          </Button>
        ),
      },
    ],
    [confirm, loadAll, routes, toast, vehicleTypes],
  );

  if (error && !routes.length) {
    return (
      <Card>
        <ErrorState onRetry={loadAll} />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top 5-Tab Bar matching frames nvCfgRoutesStops / nvCfgTimeSlots / nvCfgPricing / nvCfgCodPolicy / nvCfgNotifications */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl<SettingsTab>
          ariaLabel="Chuyên mục cấu hình"
          value={tab}
          onChange={(next) => {
            setTab(next);
            router.replace(`/settings?tab=${next}`);
          }}
          options={[
            {
              value: 'routes',
              label: 'Tuyến & Điểm dừng',
              icon: <RouteIcon className="size-4" />,
            },
            {
              value: 'time-slots',
              label: 'Khung giờ',
              icon: <Clock className="size-4" />,
            },
            {
              value: 'pricing',
              label: 'Cấu hình Giá',
              icon: <Tag className="size-4" />,
            },
            {
              value: 'cod',
              label: 'COD & Chính sách',
              icon: <ShieldAlert className="size-4" />,
            },
            {
              value: 'notifications',
              label: 'Thông báo',
              icon: <Bell className="size-4" />,
            },
          ]}
        />

        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RefreshCw className="size-3.5" />}
          onClick={loadAll}
        >
          Làm mới
        </Button>
      </div>

      {/* TAB 1: ROUTES & STOPS (nvCfgRoutesStops) */}
      {tab === 'routes' && (
        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          {/* Left: Routes List */}
          <Card className="flex flex-col gap-4">
            <CardHeader
              title="Danh sách Tuyến đường"
              description="Chọn tuyến để quản lý các điểm đón/trả PostGIS"
              actions={
                <Button
                  size="sm"
                  leftIcon={<Plus className="size-3.5" />}
                  onClick={openCreateRoute}
                >
                  Thêm tuyến
                </Button>
              }
            />
            <div className="flex flex-col gap-2.5">
              {routes.map((r) => {
                const active = selectedRoute?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRouteId(r.id)}
                    className={`cursor-pointer rounded-card border p-4 transition-colors ${
                      active
                        ? 'border-brand-border bg-brand-subtle'
                        : 'border-border-subtle bg-surface-2 hover:border-border-strong'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-brand-fg">
                            {r.code}
                          </span>
                          <span className="text-sm font-semibold text-fg">
                            {r.name}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-fg-muted">
                          {r.origin_name} → {r.destination_name} ·{' '}
                          {r.distance_km ?? '—'} km · {r.duration_min} phút
                        </p>
                      </div>
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => openEditRoute(r)}
                        >
                          <Edit className="size-3.5" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={async () => {
                            if (
                              await confirm({
                                title: `Lưu trữ tuyến ${r.name}?`,
                                okText: 'Lưu trữ',
                                danger: true,
                              })
                            ) {
                              await adminApi.archiveRoute(r.id);
                              toast.success('Đã lưu trữ tuyến');
                              void loadAll();
                            }
                          }}
                        >
                          <Trash2 className="size-3.5 text-danger-fg" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Right: Stops Table + PostGIS Map */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader
                title={
                  selectedRoute
                    ? `Điểm đón / trả chuẩn · ${selectedRoute.name}`
                    : 'Điểm đón / trả chuẩn'
                }
                description="Tọa độ PostGIS dùng cho gợi ý đặt vé và gom cụm điều phối"
                actions={
                  selectedRoute && (
                    <Button
                      size="sm"
                      leftIcon={<MapPin className="size-4" />}
                      onClick={() => {
                        setSOrder(
                          String((selectedRoute.stops?.length ?? 0) + 1),
                        );
                        setStopModalOpen(true);
                      }}
                    >
                      Thêm điểm dừng
                    </Button>
                  )
                }
              />

              <DataTable<StopDto>
                columns={stopColumns}
                data={selectedRoute?.stops ?? []}
                rowKey="id"
                loading={loading}
                empty={{
                  title: 'Chưa có điểm đón/trả trên tuyến này',
                  description:
                    'Thêm các điểm đón/trả cố định để hiển thị trên bản đồ.',
                }}
              />
            </Card>

            <Card>
              <CardHeader
                title="Bản đồ điểm dừng PostGIS"
                description="Hiển thị trực quan các điểm đón (xanh) và điểm trả (vàng) dọc tuyến"
              />
              <MapView
                height={320}
                markers={(selectedRoute?.stops ?? []).map((s, idx) => ({
                  id: s.id,
                  lat: s.location.lat,
                  lng: s.location.lng,
                  label: `${idx + 1}`,
                  title: `${s.name} — ${s.address}`,
                  tone:
                    s.kind === 'PICKUP'
                      ? 'info'
                      : s.kind === 'DROPOFF'
                        ? 'success'
                        : 'brand',
                }))}
                polyline={(selectedRoute?.stops ?? []).map((s) => ({
                  lat: s.location.lat,
                  lng: s.location.lng,
                }))}
              />
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: TIME SLOTS (nvCfgTimeSlots) */}
      {tab === 'time-slots' && (
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-semibold text-fg">
                Khung giờ xuất bến định kỳ & Đồng bộ Trip_Batches
              </h2>
              <p className="mt-1 text-xs text-fg-muted">
                Hệ thống tự động sinh các lô chuyến (Trip_Batches) theo khung
                giờ cho N ngày tiếp theo.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                className="w-36"
                value={genDays}
                onChange={(v) => setGenDays(v)}
                options={[
                  { value: '3', label: '3 ngày tới' },
                  { value: '7', label: '7 ngày tới' },
                  { value: '14', label: '14 ngày tới' },
                  { value: '30', label: '30 ngày tới' },
                ]}
              />
              <Button
                variant="secondary"
                loading={generating}
                leftIcon={<Sparkles className="size-4" />}
                onClick={handleGenerateBatches}
              >
                Đồng bộ sinh lô chuyến
              </Button>
              <Button
                leftIcon={<Plus className="size-4" />}
                onClick={() => setSlotModalOpen(true)}
              >
                Thêm khung giờ
              </Button>
            </div>
          </Card>

          <DataTable<TimeSlotDto>
            columns={slotColumns}
            data={timeSlots}
            rowKey="id"
            loading={loading}
            empty={{
              title: 'Chưa có khung giờ lặp lại',
              description: 'Tạo khung giờ xuất bến chuẩn cho từng tuyến đường.',
            }}
          />

          <Card>
            <CardHeader
              title="Các lô chuyến (Trip_Batches) đã sinh gần đây"
              description="Click vào lô chuyến để mở màn Điều phối thông minh"
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {batches.slice(0, 9).map((b) => (
                <div
                  key={b.id}
                  onClick={() => router.push(`/dispatch/${b.id}`)}
                  className="cursor-pointer rounded-card border border-border-subtle bg-surface-2 p-4 transition-colors hover:border-brand-border"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-brand-fg">
                      {b.code}
                    </span>
                    <StatusTag domain="tripBatch" status={b.status} />
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-fg">
                    {b.route.name}
                  </p>
                  <p className="mt-1 text-xs text-fg-muted">
                    Khởi hành: <DateTime value={b.departure_at} /> · Đã bán{' '}
                    {b.seats_sold}/{b.seats_total} ghế
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: PRICING (nvCfgPricing) */}
      {tab === 'pricing' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-fg">
                Bảng giá vé hành khách & Phụ thu ghế VIP
              </h2>
              <p className="text-xs text-fg-muted">
                Giá vé luôn được tính phía máy chủ (Server-side Pricing) dựa
                trên quy tắc có độ ưu tiên cao nhất.
              </p>
            </div>
            <Button
              leftIcon={<Plus className="size-4" />}
              onClick={() => setPriceModalOpen(true)}
            >
              Thêm bảng giá
            </Button>
          </div>

          <DataTable<PriceRuleDto>
            columns={priceColumns}
            data={priceRules}
            rowKey="id"
            loading={loading}
            empty={{
              title: 'Chưa có bảng giá nào',
              description: 'Thêm quy tắc giá vé cho tuyến đường.',
            }}
          />

          {settings && (
            <Card>
              <FormSection
                title="Bảng giá Ký gửi Hàng hóa"
                description="Cấu hình cước cơ bản theo kích thước kiện (S/M/L/XL), phụ phí quá cân và hàng dễ vỡ."
              >
                {(['S', 'M', 'L', 'XL'] as const).map((sz) => (
                  <Field key={sz} label={`Cước cơ bản cỡ ${sz} (VND)`}>
                    {(p) => (
                      <Input
                        {...p}
                        type="number"
                        value={String(
                          settings['cargo.pricing'].base_fee_vnd[sz],
                        )}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            'cargo.pricing': {
                              ...settings['cargo.pricing'],
                              base_fee_vnd: {
                                ...settings['cargo.pricing'].base_fee_vnd,
                                [sz]: Number(e.target.value) || 0,
                              },
                            },
                          })
                        }
                      />
                    )}
                  </Field>
                ))}
                <Field label="Cước mỗi KG vượt định mức (VND)">
                  {(p) => (
                    <Input
                      {...p}
                      type="number"
                      value={String(settings['cargo.pricing'].per_kg_over_vnd)}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          'cargo.pricing': {
                            ...settings['cargo.pricing'],
                            per_kg_over_vnd: Number(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  )}
                </Field>
                <Field label="Phụ phí hàng dễ vỡ (VND)">
                  {(p) => (
                    <Input
                      {...p}
                      type="number"
                      value={String(
                        settings['cargo.pricing'].fragile_surcharge_vnd,
                      )}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          'cargo.pricing': {
                            ...settings['cargo.pricing'],
                            fragile_surcharge_vnd: Number(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  )}
                </Field>
              </FormSection>
              <CardFooter>
                <Button
                  loading={settingsSaving}
                  onClick={() =>
                    handleSaveSettingKey(
                      'cargo.pricing',
                      settings['cargo.pricing'],
                      'Đã lưu cấu hình giá hàng hóa',
                    )
                  }
                >
                  Lưu bảng giá hàng hóa
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      )}

      {/* TAB 4: COD & BOOKING POLICY (nvCfgCodPolicy) */}
      {tab === 'cod' && settings && (
        <div className="flex flex-col gap-6">
          <Card>
            <FormSection
              title="Chính sách Thu hộ COD (nvCfgCodPolicy)"
              description="Giới hạn thu hộ COD mỗi kiện, phí dịch vụ COD và thời hạn tài xế phải nộp quỹ."
            >
              <Field label="Hạn mức COD tối đa / vận đơn (VND)">
                {(p) => (
                  <Input
                    {...p}
                    type="number"
                    value={String(settings['cod.policy'].max_cod_vnd)}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        'cod.policy': {
                          ...settings['cod.policy'],
                          max_cod_vnd: Number(e.target.value) || 0,
                        },
                      })
                    }
                  />
                )}
              </Field>
              <Field label="Phí thu hộ COD (%)">
                {(p) => (
                  <Input
                    {...p}
                    type="number"
                    step="0.1"
                    value={String(settings['cod.policy'].cod_fee_pct)}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        'cod.policy': {
                          ...settings['cod.policy'],
                          cod_fee_pct: Number(e.target.value) || 0,
                        },
                      })
                    }
                  />
                )}
              </Field>
              <Field label="Phí COD tối thiểu (VND)">
                {(p) => (
                  <Input
                    {...p}
                    type="number"
                    value={String(settings['cod.policy'].min_cod_fee_vnd)}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        'cod.policy': {
                          ...settings['cod.policy'],
                          min_cod_fee_vnd: Number(e.target.value) || 0,
                        },
                      })
                    }
                  />
                )}
              </Field>
              <Field label="Thời hạn nộp đối soát COD (giờ)">
                {(p) => (
                  <Input
                    {...p}
                    type="number"
                    value={String(settings['cod.policy'].settle_within_hours)}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        'cod.policy': {
                          ...settings['cod.policy'],
                          settle_within_hours: Number(e.target.value) || 24,
                        },
                      })
                    }
                  />
                )}
              </Field>
            </FormSection>
            <CardFooter>
              <Button
                loading={settingsSaving}
                onClick={() =>
                  handleSaveSettingKey(
                    'cod.policy',
                    settings['cod.policy'],
                    'Đã cập nhật chính sách COD',
                  )
                }
              >
                Cập nhật chính sách COD
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <FormSection
              title="Chính sách Đặt vé, Giữ chỗ & Hoàn hủy"
              description="Áp dụng đồng bộ trên Web Đặt Vé và Tổng đài."
            >
              <Field label="Thời gian giữ ghế tạm thời (phút)">
                {(p) => (
                  <Input
                    {...p}
                    type="number"
                    value={String(settings['booking.policy'].seat_hold_minutes)}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        'booking.policy': {
                          ...settings['booking.policy'],
                          seat_hold_minutes: Number(e.target.value) || 10,
                        },
                      })
                    }
                  />
                )}
              </Field>
              <Field label="Hạn thanh toán VietQR (phút)">
                {(p) => (
                  <Input
                    {...p}
                    type="number"
                    value={String(
                      settings['booking.policy'].payment_due_minutes,
                    )}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        'booking.policy': {
                          ...settings['booking.policy'],
                          payment_due_minutes: Number(e.target.value) || 15,
                        },
                      })
                    }
                  />
                )}
              </Field>
              <Field label="Số giờ trước khởi hành được hủy miễn phí">
                {(p) => (
                  <Input
                    {...p}
                    type="number"
                    value={String(settings['booking.policy'].free_cancel_hours)}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        'booking.policy': {
                          ...settings['booking.policy'],
                          free_cancel_hours: Number(e.target.value) || 24,
                        },
                      })
                    }
                  />
                )}
              </Field>
              <Field label="Tỷ lệ hoàn tiền khi hủy muộn (%)">
                {(p) => (
                  <Input
                    {...p}
                    type="number"
                    value={String(
                      settings['booking.policy'].late_cancel_refund_pct,
                    )}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        'booking.policy': {
                          ...settings['booking.policy'],
                          late_cancel_refund_pct: Number(e.target.value) || 50,
                        },
                      })
                    }
                  />
                )}
              </Field>
            </FormSection>
            <CardFooter>
              <Button
                loading={settingsSaving}
                onClick={() =>
                  handleSaveSettingKey(
                    'booking.policy',
                    settings['booking.policy'],
                    'Đã cập nhật chính sách đặt vé',
                  )
                }
              >
                Lưu chính sách đặt vé
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* TAB 5: NOTIFICATIONS (nvCfgNotifications) */}
      {tab === 'notifications' && settings && (
        <Card>
          <FormSection
            title="Mẫu tin nhắn SMS / Zalo ZNS / Push (nvCfgNotifications)"
            description="Hỗ trợ các biến động: {code}, {route}, {time}, {date}, {seats}, {plate}, {driver}, {driver_phone}, {waybill}, {link}."
          >
            <Field
              label="SMS: Xác nhận đặt vé thành công"
              className="sm:col-span-2"
            >
              {(p) => (
                <Textarea
                  {...p}
                  rows={2}
                  value={settings['notifications.templates'].booking_confirmed}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      'notifications.templates': {
                        ...settings['notifications.templates'],
                        booking_confirmed: e.target.value,
                      },
                    })
                  }
                />
              )}
            </Field>
            <Field
              label="Push / SMS: Nhắc lịch sắp đến giờ đón"
              className="sm:col-span-2"
            >
              {(p) => (
                <Textarea
                  {...p}
                  rows={2}
                  value={settings['notifications.templates'].booking_reminder}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      'notifications.templates': {
                        ...settings['notifications.templates'],
                        booking_reminder: e.target.value,
                      },
                    })
                  }
                />
              )}
            </Field>
            <Field
              label="SMS: Mã xác thực OTP tra cứu vé"
              className="sm:col-span-2"
            >
              {(p) => (
                <Textarea
                  {...p}
                  rows={2}
                  value={settings['notifications.templates'].otp}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      'notifications.templates': {
                        ...settings['notifications.templates'],
                        otp: e.target.value,
                      },
                    })
                  }
                />
              )}
            </Field>
            <Field
              label="SMS: Tiếp nhận vận đơn ký gửi"
              className="sm:col-span-2"
            >
              {(p) => (
                <Textarea
                  {...p}
                  rows={2}
                  value={settings['notifications.templates'].cargo_created}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      'notifications.templates': {
                        ...settings['notifications.templates'],
                        cargo_created: e.target.value,
                      },
                    })
                  }
                />
              )}
            </Field>
          </FormSection>
          <CardFooter>
            <Button
              variant="secondary"
              onClick={() =>
                toast.info(
                  `Xem thử SMS: ${settings[
                    'notifications.templates'
                  ].booking_confirmed
                    .replace('{code}', 'NL-8F92KA')
                    .replace('{route}', 'Hà Nội → Hạ Long')
                    .replace('{time}', '14:00')
                    .replace('{date}', '18/11/2026')
                    .replace('{seats}', 'A1, A2')
                    .replace('{link}', 'https://novalimo.vn/my-tickets')}`,
                )
              }
            >
              Xem thử nội dung
            </Button>
            <Button
              loading={settingsSaving}
              onClick={() =>
                handleSaveSettingKey(
                  'notifications.templates',
                  settings['notifications.templates'],
                  'Đã lưu mẫu thông báo',
                )
              }
            >
              Lưu mẫu thông báo
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Modal: Create/Edit Route */}
      <Modal
        open={routeModalOpen}
        onCancel={() => setRouteModalOpen(false)}
        title={
          editingRoute
            ? `Sửa tuyến · ${editingRoute.name}`
            : 'Thêm tuyến đường mới'
        }
        footer={null}
      >
        <div className="mt-4 flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Mã tuyến" required>
              {(p) => (
                <Input
                  {...p}
                  value={rCode}
                  onChange={(e) => setRCode(e.target.value)}
                  placeholder="HN-QN"
                />
              )}
            </Field>
            <Field label="Tên tuyến" required>
              {(p) => (
                <Input
                  {...p}
                  value={rName}
                  onChange={(e) => setRName(e.target.value)}
                  placeholder="Hà Nội → Hạ Long"
                />
              )}
            </Field>
            <Field label="Điểm xuất phát" required>
              {(p) => (
                <Input
                  {...p}
                  value={rOrigin}
                  onChange={(e) => setROrigin(e.target.value)}
                />
              )}
            </Field>
            <Field label="Điểm đến" required>
              {(p) => (
                <Input
                  {...p}
                  value={rDest}
                  onChange={(e) => setRDest(e.target.value)}
                />
              )}
            </Field>
            <Field label="Khoảng cách (km)">
              {(p) => (
                <Input
                  {...p}
                  type="number"
                  value={rDist}
                  onChange={(e) => setRDist(e.target.value)}
                />
              )}
            </Field>
            <Field label="Thời gian chạy (phút)" required>
              {(p) => (
                <Input
                  {...p}
                  type="number"
                  value={rDur}
                  onChange={(e) => setRDur(e.target.value)}
                />
              )}
            </Field>
          </div>
          <Switch
            checked={rActive}
            onChange={setRActive}
            label="Đang mở bán công khai"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRouteModalOpen(false)}>
              Hủy
            </Button>
            <Button loading={routeSaving} onClick={handleSaveRoute}>
              Lưu tuyến
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Create Stop */}
      <Modal
        open={stopModalOpen}
        onCancel={() => setStopModalOpen(false)}
        title={`Thêm điểm đón/trả · ${selectedRoute?.name ?? ''}`}
        footer={null}
      >
        <div className="mt-4 flex flex-col gap-4">
          <Field label="Tên điểm dừng" required>
            {(p) => (
              <Input
                {...p}
                value={sName}
                onChange={(e) => setSName(e.target.value)}
                placeholder="VD: Nhà hát Lớn Hà Nội"
              />
            )}
          </Field>
          <Field
            label="Địa chỉ & Tọa độ PostGIS"
            required
            hint="Gõ địa chỉ để tìm tọa độ tự động"
          >
            {(p) => (
              <AddressAutocomplete
                id={p.id}
                value={sAddr}
                onChange={setSAddr}
                search={(q) => adminApi.geocode(q)}
              />
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Vĩ độ (Lat)">
              {(p) => (
                <Input
                  {...p}
                  type="number"
                  step="0.0001"
                  value={String(sAddr.lat ?? 21.0285)}
                  onChange={(e) =>
                    setSAddr({ ...sAddr, lat: Number(e.target.value) })
                  }
                />
              )}
            </Field>
            <Field label="Kinh độ (Lng)">
              {(p) => (
                <Input
                  {...p}
                  type="number"
                  step="0.0001"
                  value={String(sAddr.lng ?? 105.8542)}
                  onChange={(e) =>
                    setSAddr({ ...sAddr, lng: Number(e.target.value) })
                  }
                />
              )}
            </Field>
            <Field label="Vai trò điểm">
              {() => (
                <Select
                  className="w-full"
                  value={sKind}
                  onChange={(v) => setSKind(v)}
                  options={[
                    { value: 'PICKUP', label: 'Điểm đón' },
                    { value: 'DROPOFF', label: 'Điểm trả' },
                    { value: 'BOTH', label: 'Đón & Trả' },
                  ]}
                />
              )}
            </Field>
            <Field label="Thứ tự trên tuyến">
              {(p) => (
                <Input
                  {...p}
                  type="number"
                  value={sOrder}
                  onChange={(e) => setSOrder(e.target.value)}
                />
              )}
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setStopModalOpen(false)}>
              Hủy
            </Button>
            <Button loading={stopSaving} onClick={handleCreateStop}>
              Thêm điểm dừng
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Create Time Slot */}
      <Modal
        open={slotModalOpen}
        onCancel={() => setSlotModalOpen(false)}
        title="Thêm khung giờ xuất bến lặp lại"
        footer={null}
      >
        <div className="mt-4 flex flex-col gap-4">
          <Field label="Tuyến đường" required>
            {() => (
              <Select
                className="w-full"
                value={tsRouteId}
                onChange={(v) => setTsRouteId(v)}
                options={routes.map((r) => ({ value: r.id, label: r.name }))}
              />
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Giờ xuất bến (HH:MM)" required>
              {(p) => (
                <Input
                  {...p}
                  type="time"
                  value={tsTime}
                  onChange={(e) => setTsTime(e.target.value)}
                />
              )}
            </Field>
            <Field label="Số xe dự kiến / chuyến">
              {(p) => (
                <Input
                  {...p}
                  type="number"
                  min={1}
                  max={20}
                  value={tsVehicles}
                  onChange={(e) => setTsVehicles(e.target.value)}
                />
              )}
            </Field>
          </div>
          <Field label="Loại xe khai thác" required>
            {() => (
              <Select
                className="w-full"
                value={tsTypeId}
                onChange={(v) => setTsTypeId(v)}
                options={vehicleTypes.map((vt) => ({
                  value: vt.id,
                  label: `${vt.name} (${vt.capacity} chỗ)`,
                }))}
              />
            )}
          </Field>
          <Field label="Các ngày hoạt động trong tuần">
            {() => (
              <div className="flex flex-wrap gap-2">
                {DAY_LABELS.map(([d, lbl]) => {
                  const active = tsDays.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() =>
                        setTsDays((prev) =>
                          prev.includes(d)
                            ? prev.filter((x) => x !== d)
                            : [...prev, d],
                        )
                      }
                      className={`rounded-control border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        active
                          ? 'border-brand-border bg-brand-subtle text-brand-fg'
                          : 'border-border-subtle bg-surface-2 text-fg-muted'
                      }`}
                    >
                      {lbl}
                    </button>
                  );
                })}
              </div>
            )}
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setSlotModalOpen(false)}>
              Hủy
            </Button>
            <Button loading={slotSaving} onClick={handleCreateTimeSlot}>
              Lưu khung giờ
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Create Price Rule */}
      <Modal
        open={priceModalOpen}
        onCancel={() => setPriceModalOpen(false)}
        title="Thêm bảng giá vé"
        footer={null}
      >
        <div className="mt-4 flex flex-col gap-4">
          <Field label="Tên quy tắc giá" required>
            {(p) => (
              <Input
                {...p}
                value={prName}
                onChange={(e) => setPrName(e.target.value)}
                placeholder="VD: Giá tiêu chuẩn / Giá cuối tuần"
              />
            )}
          </Field>
          <Field label="Tuyến áp dụng" required>
            {() => (
              <Select
                className="w-full"
                value={prRouteId}
                onChange={(v) => setPrRouteId(v)}
                options={routes.map((r) => ({ value: r.id, label: r.name }))}
              />
            )}
          </Field>
          <Field label="Loại xe (để trống = áp dụng mọi loại xe)">
            {() => (
              <Select
                className="w-full"
                value={prTypeId}
                onChange={(v) => setPrTypeId(v)}
                options={[
                  { value: '', label: 'Tất cả loại xe' },
                  ...vehicleTypes.map((vt) => ({
                    value: vt.id,
                    label: `${vt.name} (${vt.capacity} chỗ)`,
                  })),
                ]}
              />
            )}
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Giá cơ bản (VND)" required>
              {(p) => (
                <Input
                  {...p}
                  type="number"
                  value={prBase}
                  onChange={(e) => setPrBase(e.target.value)}
                />
              )}
            </Field>
            <Field label="Phụ thu ghế VIP (VND)">
              {(p) => (
                <Input
                  {...p}
                  type="number"
                  value={prVip}
                  onChange={(e) => setPrVip(e.target.value)}
                />
              )}
            </Field>
            <Field label="Độ ưu tiên">
              {(p) => (
                <Input
                  {...p}
                  type="number"
                  value={prPriority}
                  onChange={(e) => setPrPriority(e.target.value)}
                />
              )}
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPriceModalOpen(false)}>
              Hủy
            </Button>
            <Button loading={priceSaving} onClick={handleCreatePriceRule}>
              Tạo bảng giá
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AdminShell
      title="Cấu hình hệ thống"
      subtitle="Tuyến & điểm dừng PostGIS · Khung giờ Trip_Batches · Bảng giá · Chính sách COD · Mẫu thông báo"
    >
      <Suspense fallback={null}>
        <SettingsConsoleContent />
      </Suspense>
    </AdminShell>
  );
}
