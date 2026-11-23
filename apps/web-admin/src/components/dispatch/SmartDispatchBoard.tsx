'use client';

import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type {
  DriverDto,
  RouteDto,
  TripBatchDto,
  VehicleDto,
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
  useConfirm,
  useToast,
} from '@limousine-workspace/shared-ui';
import { RealtimeEvents } from '@limousine-workspace/utils-core';
import { Modal, Select } from 'antd';
import {
  AlertTriangle,
  Bus,
  FileText,
  GripVertical,
  Plus,
  Redo2,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  Undo2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ApiError,
  type DispatchBoardBookingDto,
  type DispatchBoardDto,
  adminApi,
} from '../../lib/api';
import { getAdminSocket } from '../../lib/socket';

interface MoveRecord {
  bookingId: string;
  fromRunId: string | null;
  toRunId: string | null;
}

function DraggableBookingCard({
  booking,
  runs,
  onQuickAssign,
}: {
  booking: DispatchBoardBookingDto;
  runs: DispatchBoardDto['runs'];
  onQuickAssign: (bookingId: string, runId: string | null) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `booking:${booking.id}`,
      data: { booking },
    });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group rounded-control border border-border-subtle bg-surface-1 p-3 transition-shadow',
        isDragging && 'z-30 opacity-80 shadow-e3 ring-2 ring-brand',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <button
            type="button"
            {...listeners}
            {...attributes}
            aria-label={`Kéo vé ${booking.code}`}
            className="mt-0.5 cursor-grab touch-none rounded-tag p-1 text-fg-muted hover:bg-surface-2 hover:text-fg active:cursor-grabbing"
          >
            <GripVertical className="size-4" />
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              {booking.pickup_order !== null && (
                <span className="rounded-tag bg-brand-subtle px-1.5 py-0.5 font-mono text-[11px] font-bold text-brand-fg">
                  #{String(booking.pickup_order).padStart(2, '0')}
                </span>
              )}
              <Link
                href={`/bookings/${booking.id}`}
                className="truncate text-sm font-semibold text-fg hover:text-brand-fg"
              >
                {booking.contact_name}
              </Link>
              <Badge tone="brand">
                {booking.seats.length} ghế ({booking.seats.join(', ')})
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-fg-muted">
              <Phone value={booking.contact_phone} /> ·{' '}
              <span className="font-mono">{booking.code}</span>
            </p>
          </div>
        </div>

        <Select
          size="small"
          className="w-28 shrink-0 text-xs"
          value={booking.trip_run_id ?? ''}
          onChange={(val) => onQuickAssign(booking.id, val || null)}
          options={[
            { value: '', label: 'Rổ chờ' },
            ...runs.map((r) => ({
              value: r.id,
              label: r.vehicle.license_plate,
            })),
          ]}
        />
      </div>

      <div className="mt-2 space-y-0.5 border-t border-border-subtle pt-2 text-xs">
        <p className="truncate text-fg-secondary">
          <span className="text-fg-muted">Đón:</span> {booking.pickup_address}
        </p>
        <p className="truncate text-fg-secondary">
          <span className="text-fg-muted">Trả:</span> {booking.dropoff_address}
        </p>
      </div>
    </div>
  );
}

function DroppableContainer({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        className,
        isOver && 'ring-2 ring-brand bg-brand-subtle/20 transition-all',
      )}
    >
      {children}
    </div>
  );
}

export function SmartDispatchBoard({
  initialBatchId,
}: {
  initialBatchId?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const [routes, setRoutes] = useState<RouteDto[]>([]);
  const [routeId, setRouteId] = useState<string>('');
  const [batches, setBatches] = useState<TripBatchDto[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    initialBatchId ?? '',
  );

  const [board, setBoard] = useState<DispatchBoardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const [poolQuery, setPoolQuery] = useState('');
  const [autoPlanning, setAutoPlanning] = useState(false);
  const [dispatchingAll, setDispatchingAll] = useState(false);

  // Undo / Redo stacks
  const [undoStack, setUndoStack] = useState<MoveRecord[]>([]);
  const [redoStack, setRedoStack] = useState<MoveRecord[]>([]);

  // Create Run Modal state
  const [addRunOpen, setAddRunOpen] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [drivers, setDrivers] = useState<DriverDto[]>([]);
  const [newRunVehicleId, setNewRunVehicleId] = useState('');
  const [newRunDriverId, setNewRunDriverId] = useState('');
  const [newRunNote, setNewRunNote] = useState('');
  const [creatingRun, setCreatingRun] = useState(false);

  const loadBatches = useCallback(async () => {
    try {
      const [rts, bts] = await Promise.all([
        adminApi.routes(),
        adminApi.tripBatches({
          route_id: routeId || undefined,
          limit: 30,
        }),
      ]);
      setRoutes(rts);
      setBatches(bts.items);
      if (!selectedBatchId && bts.items.length > 0) {
        setSelectedBatchId(bts.items[0].id);
      }
    } catch (e) {
      setError(e);
      setLoading(false);
    }
  }, [routeId, selectedBatchId]);

  const loadBoard = useCallback(async (id: string) => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.dispatchBoard(id);
      setBoard(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBatches();
  }, [loadBatches]);

  useEffect(() => {
    if (selectedBatchId) {
      void loadBoard(selectedBatchId);
    }
  }, [selectedBatchId, loadBoard]);

  // Realtime socket updates for this batch
  useEffect(() => {
    if (!selectedBatchId) return;
    const s = getAdminSocket();
    const onRunUpdated = () => {
      void loadBoard(selectedBatchId);
    };
    s.on(RealtimeEvents.tripRunUpdated, onRunUpdated);
    return () => {
      s.off(RealtimeEvents.tripRunUpdated, onRunUpdated);
    };
  }, [selectedBatchId, loadBoard]);

  const performAssign = useCallback(
    async (
      bookingId: string,
      targetRunId: string | null,
      recordHistory = true,
    ) => {
      if (!board) return;
      const current = board.bookings.find((b) => b.id === bookingId);
      if (!current || current.trip_run_id === targetRunId) return;

      const prevRunId = current.trip_run_id;
      try {
        await adminApi.dispatchAssign({
          booking_ids: [bookingId],
          trip_run_id: targetRunId,
        });
        if (recordHistory) {
          setUndoStack((s) => [
            ...s,
            { bookingId, fromRunId: prevRunId, toRunId: targetRunId },
          ]);
          setRedoStack([]);
        }
        await loadBoard(board.batch.id);
      } catch (e) {
        if (e instanceof ApiError && e.code === 'CAPACITY_WARNING') {
          const ok = await confirm({
            title: 'Cảnh báo vượt sức chứa / trùng vị trí ghế',
            content: `${e.message}. Bạn có muốn ép xếp khách vào xe này không?`,
            okText: 'Vẫn xếp vào xe',
            danger: true,
          });
          if (ok) {
            await adminApi.dispatchAssign({
              booking_ids: [bookingId],
              trip_run_id: targetRunId,
              force: true,
            });
            if (recordHistory) {
              setUndoStack((s) => [
                ...s,
                { bookingId, fromRunId: prevRunId, toRunId: targetRunId },
              ]);
              setRedoStack([]);
            }
            await loadBoard(board.batch.id);
          }
        } else {
          toast.error(
            e instanceof Error ? e.message : 'Không thể chuyển khách sang xe',
          );
        }
      }
    },
    [board, confirm, loadBoard, toast],
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !board) return;
    const bookingId = String(active.id).replace(/^booking:/, '');
    const overId = String(over.id);

    if (overId === 'queue') {
      void performAssign(bookingId, null);
    } else if (overId.startsWith('run:')) {
      const targetRunId = overId.replace(/^run:/, '');
      void performAssign(bookingId, targetRunId);
    }
  };

  const handleUndo = async () => {
    const last = undoStack[undoStack.length - 1];
    if (!last) return;
    setUndoStack((s) => s.slice(0, -1));
    setRedoStack((s) => [...s, last]);
    await performAssign(last.bookingId, last.fromRunId, false);
  };

  const handleRedo = async () => {
    const next = redoStack[redoStack.length - 1];
    if (!next) return;
    setRedoStack((s) => s.slice(0, -1));
    setUndoStack((s) => [...s, next]);
    await performAssign(next.bookingId, next.toRunId, false);
  };

  const handleAutoPlan = async () => {
    if (!board) return;
    setAutoPlanning(true);
    try {
      const res = await adminApi.dispatchAutoPlan(board.batch.id);
      setBoard(res.board);
      if (res.unassigned.length > 0) {
        toast.warning(
          `Đã xếp xe tự động (${res.runs_planned} xe). Còn ${res.unassigned.length} vé vượt sức chứa nằm ở rổ chờ.`,
        );
      } else {
        toast.success(
          `Đã gom cụm PostGIS & tối ưu lộ trình cho ${res.runs_planned} xe thành công!`,
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Thuật toán xếp xe gặp lỗi');
    } finally {
      setAutoPlanning(false);
    }
  };

  const handleOpenAddRun = async () => {
    setAddRunOpen(true);
    try {
      const [vRes, dRes] = await Promise.all([
        adminApi.vehicles({ status: 'AVAILABLE', limit: 100 }),
        adminApi.drivers({ status: 'ACTIVE', limit: 100 }),
      ]);
      setVehicles(vRes.items);
      setDrivers(dRes.items);
      if (vRes.items[0]) setNewRunVehicleId(vRes.items[0].id);
      if (dRes.items[0]) setNewRunDriverId(dRes.items[0].id);
    } catch {
      // ignore
    }
  };

  const handleCreateRun = async () => {
    if (!board || !newRunVehicleId || !newRunDriverId) {
      toast.error('Vui lòng chọn phương tiện và tài xế');
      return;
    }
    setCreatingRun(true);
    try {
      await adminApi.createTripRun({
        trip_batch_id: board.batch.id,
        vehicle_id: newRunVehicleId,
        driver_id: newRunDriverId,
        note: newRunNote.trim() || undefined,
      });
      toast.success('Đã thêm xe vào lô điều phối');
      setAddRunOpen(false);
      setNewRunNote('');
      await loadBoard(board.batch.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể thêm xe');
    } finally {
      setCreatingRun(false);
    }
  };

  const handleDispatchRun = async (runId: string, code: string) => {
    try {
      await adminApi.changeTripRunStatus(runId, 'DISPATCHED');
      toast.success(`Đã xuất lệnh chuyến ${code} xuống App Tài xế!`);
      if (board) await loadBoard(board.batch.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể xuất lệnh');
    }
  };

  const handleDispatchAll = async () => {
    if (!board) return;
    const pendingWithPax = board.runs.filter(
      (r) => r.status === 'PENDING' && r.passenger_count + r.cargo_count > 0,
    );
    if (pendingWithPax.length === 0) {
      toast.info(
        'Không có chuyến chờ xuất lệnh nào có khách (hoặc tất cả đã được xuất lệnh).',
      );
      return;
    }
    setDispatchingAll(true);
    try {
      for (const r of pendingWithPax) {
        await adminApi.changeTripRunStatus(r.id, 'DISPATCHED');
      }
      toast.success(
        `Đã xuất lệnh đồng loạt ${pendingWithPax.length} chuyến xuống Mobile App!`,
      );
      await loadBoard(board.batch.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi khi xuất lệnh');
    } finally {
      setDispatchingAll(false);
    }
  };

  const unassignedBookings = useMemo(() => {
    const list = (board?.bookings ?? []).filter((b) => !b.trip_run_id);
    const q = poolQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (b) =>
        b.contact_name.toLowerCase().includes(q) ||
        b.contact_phone.includes(q) ||
        b.code.toLowerCase().includes(q) ||
        b.pickup_address.toLowerCase().includes(q),
    );
  }, [board, poolQuery]);

  const mapMarkers = useMemo(() => {
    if (!board) return [];
    const tones: ('brand' | 'info' | 'success' | 'danger')[] = [
      'brand',
      'info',
      'success',
      'danger',
    ];
    return board.bookings
      .filter(
        (
          b,
        ): b is DispatchBoardBookingDto & {
          pickup: { lat: number; lng: number };
        } => Boolean(b.pickup && b.pickup.lat !== 0),
      )
      .map((b) => {
        const runIdx = board.runs.findIndex((r) => r.id === b.trip_run_id);
        return {
          id: b.id,
          lat: b.pickup.lat,
          lng: b.pickup.lng,
          label:
            b.pickup_order !== null ? String(b.pickup_order) : b.seats.join(''),
          title: `${b.contact_name} (${b.seats.join(', ')}) — ${b.pickup_address}`,
          tone: runIdx >= 0 ? tones[runIdx % tones.length] : ('info' as const),
        };
      });
  }, [board]);

  const totalPassengers = useMemo(
    () => (board?.bookings ?? []).reduce((sum, b) => sum + b.seats.length, 0),
    [board],
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Top Batch Tabs & Smart Dispatch Button (frame nvSmartDispPage: nvSmartDispTabsTopRow) */}
      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              className="w-56"
              value={routeId}
              onChange={(v) => {
                setRouteId(v);
                setSelectedBatchId('');
              }}
              options={[
                { value: '', label: 'Tất cả tuyến đường' },
                ...routes.map((r) => ({ value: r.id, label: r.name })),
              ]}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              {batches.slice(0, 8).map((b) => {
                const active = b.id === selectedBatchId;
                const timeStr = new Date(b.departure_at).toLocaleTimeString(
                  'vi-VN',
                  {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Asia/Ho_Chi_Minh',
                  },
                );
                const dateStr = new Date(b.departure_at).toLocaleDateString(
                  'vi-VN',
                  {
                    day: '2-digit',
                    month: '2-digit',
                    timeZone: 'Asia/Ho_Chi_Minh',
                  },
                );
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setSelectedBatchId(b.id);
                      router.replace(`/dispatch/${b.id}`);
                    }}
                    className={cn(
                      'rounded-control border px-3 py-1.5 text-xs font-semibold transition-colors',
                      active
                        ? 'border-brand-border bg-brand-subtle text-brand-fg'
                        : 'border-border-subtle bg-surface-2 text-fg-secondary hover:text-fg',
                    )}
                  >
                    Chuyến {timeStr} ({dateStr}) · {b.seats_sold}/
                    {b.seats_total}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="icon-sm"
              variant="secondary"
              disabled={undoStack.length === 0}
              onClick={handleUndo}
              title="Hoàn tác thao tác kéo thả"
            >
              <Undo2 className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="secondary"
              disabled={redoStack.length === 0}
              onClick={handleRedo}
              title="Làm lại thao tác kéo thả"
            >
              <Redo2 className="size-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<RefreshCw className="size-3.5" />}
              onClick={() => selectedBatchId && void loadBoard(selectedBatchId)}
            >
              Làm mới
            </Button>
            <Button
              loading={autoPlanning}
              disabled={!board}
              leftIcon={<Sparkles className="size-4" />}
              onClick={handleAutoPlan}
            >
              Xếp Xe Tự Động (AI OR-Tools)
            </Button>
          </div>
        </div>
      </Card>

      {error ? (
        <Card>
          <ErrorState
            onRetry={() => selectedBatchId && void loadBoard(selectedBatchId)}
          />
        </Card>
      ) : loading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-96" rounded="card" />
          <Skeleton className="h-96" rounded="card" />
          <Skeleton className="h-96" rounded="card" />
        </div>
      ) : !board ? (
        <Card>
          <EmptyState
            title="Chưa có lô chuyến nào để điều phối"
            description="Hãy đồng bộ sinh lô chuyến từ mục Cấu hình Khung giờ."
            action={
              <Link href="/settings?tab=time-slots">
                <Button size="sm">Mở Cấu hình Khung giờ</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          {/* Waiting Pool (frame nvSmartDispWaitPanel) */}
          <Card>
            <CardHeader
              title={`Quản lý Rổ chờ (Trip_Batches) · ${board.batch.route}`}
              description={
                <span>
                  Mã lô:{' '}
                  <code className="font-mono font-semibold text-brand-fg">
                    {board.batch.code}
                  </code>{' '}
                  · Khởi hành <DateTime value={board.batch.departure_at} /> ·
                  Kéo khách từ rổ chờ sang các xe bên dưới.
                </span>
              }
              actions={
                <div className="flex items-center gap-2">
                  <StatusTag domain="tripBatch" status={board.batch.status} />
                  <Input
                    value={poolQuery}
                    onChange={(e) => setPoolQuery(e.target.value)}
                    placeholder="Lọc khách trong rổ chờ…"
                    className="w-52"
                  />
                </div>
              }
            />

            <DroppableContainer
              id="queue"
              className="min-h-[120px] rounded-card border border-dashed border-border-strong bg-surface-2/60 p-4"
            >
              {unassignedBookings.length === 0 ? (
                <p className="py-6 text-center text-sm text-fg-muted">
                  Tất cả hành khách của lô chuyến đã được xếp lên xe (0 vé chờ).
                  Kéo vé vào đây nếu muốn đưa khách về lại rổ chờ.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {unassignedBookings.map((b) => (
                    <DraggableBookingCard
                      key={b.id}
                      booking={b}
                      runs={board.runs}
                      onQuickAssign={(bId, rId) => void performAssign(bId, rId)}
                    />
                  ))}
                </div>
              )}
            </DroppableContainer>
          </Card>

          {/* Drag Tip Banner (frame nvSmartDispDragTip) */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-info-border bg-info-bg/40 px-4 py-2.5 text-xs text-info-fg">
            <span>
              Mẹo điều phối: Kéo 1 khách từ Rổ chờ hoặc giữa các xe (Trip_Runs)
              để điều chỉnh thủ công. Hệ thống tự động kiểm tra sức chứa và cảnh
              báo trùng ghế.
            </span>
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Plus className="size-3.5" />}
              onClick={handleOpenAddRun}
            >
              Thêm xe trung chuyển / chuyến chạy
            </Button>
          </div>

          {/* Vehicle Run Columns (frame nvSmartDispRunsRow) */}
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {board.runs.map((run, idx) => {
              const runBookings = board.bookings
                .filter((b) => b.trip_run_id === run.id)
                .sort(
                  (a, b) => (a.pickup_order ?? 999) - (b.pickup_order ?? 999),
                );
              const usedSeats = runBookings.reduce(
                (s, b) => s + b.seats.length,
                0,
              );
              const capacity =
                run.vehicle.capacity || board.batch.capacity_per_vehicle;
              const overCapacity = usedSeats > capacity;
              const fillPct = capacity
                ? Math.min(100, Math.round((usedSeats / capacity) * 100))
                : 0;

              return (
                <DroppableContainer
                  key={run.id}
                  id={`run:${run.id}`}
                  className={cn(
                    'flex flex-col rounded-card border bg-surface-1 p-5 shadow-e1',
                    overCapacity
                      ? 'border-danger-border'
                      : 'border-border-subtle',
                  )}
                >
                  {/* Run Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex size-6 items-center justify-center rounded-full bg-brand font-mono text-xs font-bold text-on-brand">
                          {idx + 1}
                        </span>
                        <Link
                          href={`/trip-runs/${run.id}`}
                          className="font-mono text-base font-bold text-fg hover:text-brand-fg"
                        >
                          {run.vehicle.license_plate}
                        </Link>
                        <StatusTag domain="tripRun" status={run.status} />
                      </div>
                      <p className="mt-1 text-xs text-fg-secondary">
                        Tài xế:{' '}
                        <span className="font-medium text-fg">
                          {run.driver.full_name}
                        </span>{' '}
                        · <Phone value={run.driver.phone} />
                      </p>
                      <p className="text-[11px] text-fg-muted">
                        Mã chuyến: {run.code}
                        {run.planned_distance_km
                          ? ` · Quãng đường: ~${run.planned_distance_km} km`
                          : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/trip-runs/${run.id}/manifest`}
                        title="Xem & In phơi lệnh"
                      >
                        <Button size="icon-sm" variant="ghost">
                          <FileText className="size-4" />
                        </Button>
                      </Link>
                      {run.status === 'PENDING' && (
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Xóa chuyến chưa xuất lệnh"
                          onClick={async () => {
                            if (
                              await confirm({
                                title: `Xóa chuyến ${run.code}?`,
                                content:
                                  'Các hành khách trên xe sẽ được trả về Rổ chờ.',
                                okText: 'Xóa chuyến',
                                danger: true,
                              })
                            ) {
                              await adminApi.deleteTripRun(run.id);
                              toast.success(
                                'Đã xóa chuyến và trả khách về rổ chờ',
                              );
                              await loadBoard(board.batch.id);
                            }
                          }}
                        >
                          <Trash2 className="size-4 text-danger-fg" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs tabular-nums">
                      <span
                        className={cn(
                          'font-semibold',
                          overCapacity ? 'text-danger-fg' : 'text-fg',
                        )}
                      >
                        {overCapacity && (
                          <AlertTriangle className="mr-1 inline size-3.5" />
                        )}
                        Lấp đầy: {usedSeats}/{capacity} ghế
                      </span>
                      <span className="text-fg-muted">{fillPct}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-pill bg-surface-3">
                      <div
                        className={cn(
                          'h-full rounded-pill transition-all',
                          overCapacity ? 'bg-danger-solid' : 'bg-brand',
                        )}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Passenger Cards List */}
                  <div className="mt-4 flex flex-1 flex-col gap-2.5">
                    {runBookings.length === 0 ? (
                      <div className="flex flex-1 flex-col items-center justify-center rounded-control border border-dashed border-border-subtle py-10 text-center text-xs text-fg-muted">
                        <Bus className="mb-1.5 size-5 opacity-50" />
                        Kéo hành khách vào xe này (Drag & Drop)
                      </div>
                    ) : (
                      runBookings.map((b) => (
                        <DraggableBookingCard
                          key={b.id}
                          booking={b}
                          runs={board.runs}
                          onQuickAssign={(bId, rId) =>
                            void performAssign(bId, rId)
                          }
                        />
                      ))
                    )}
                  </div>

                  {/* Run Footer Actions */}
                  <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3">
                    <Link
                      href={`/trip-runs/${run.id}/edit`}
                      className="text-xs font-semibold text-fg-secondary hover:text-brand-fg"
                    >
                      Sửa thứ tự đón/trả →
                    </Link>
                    {run.status === 'PENDING' && usedSeats > 0 && (
                      <Button
                        size="sm"
                        leftIcon={<Send className="size-3.5" />}
                        onClick={() => void handleDispatchRun(run.id, run.code)}
                      >
                        Xuất lệnh xe này
                      </Button>
                    )}
                  </div>
                </DroppableContainer>
              );
            })}
          </div>

          {/* Bottom Export & Summary Bar (frame nvSmartDispExportRow + nvSmartDispMsgBar) */}
          <Card className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-fg">
                Đã chuẩn bị lệnh đón/trả cho {board.batch.route} ·{' '}
                {board.runs.length} xe · {totalPassengers} khách (
                {unassignedBookings.length} vé chờ xếp).
              </p>
              <p className="mt-0.5 text-xs text-fg-muted">
                Rà soát lại phân bổ khách trước khi bấm Xuất Lệnh để đẩy thông
                báo tức thì xuống Mobile App tài xế.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                leftIcon={<Plus className="size-4" />}
                onClick={handleOpenAddRun}
              >
                Thêm xe
              </Button>
              <Button
                size="lg"
                loading={dispatchingAll}
                leftIcon={<Send className="size-4" />}
                onClick={handleDispatchAll}
              >
                Xuất Lệnh Toàn Bộ
              </Button>
            </div>
          </Card>

          {/* PostGIS Cluster Map */}
          <Card>
            <CardHeader
              title="Bản đồ gom cụm điểm đón PostGIS"
              description="Các điểm đón khách được tô màu theo xe được phân công"
            />
            <MapView height={340} markers={mapMarkers} />
          </Card>
        </DndContext>
      )}

      {/* Modal: Add Vehicle Run */}
      <Modal
        open={addRunOpen}
        onCancel={() => setAddRunOpen(false)}
        title="Thêm xe trung chuyển / chuyến chạy vào lô"
        footer={null}
      >
        <div className="mt-4 flex flex-col gap-4">
          <Field label="Chọn phương tiện (Đang sẵn sàng)" required>
            {() => (
              <Select
                className="w-full"
                value={newRunVehicleId}
                onChange={(v) => setNewRunVehicleId(v)}
                options={vehicles.map((v) => ({
                  value: v.id,
                  label: `${v.license_plate} — ${v.vehicle_type.name} (${v.vehicle_type.capacity} chỗ)`,
                }))}
              />
            )}
          </Field>
          <Field label="Chọn tài xế phụ trách" required>
            {() => (
              <Select
                className="w-full"
                value={newRunDriverId}
                onChange={(v) => setNewRunDriverId(v)}
                options={drivers.map((d) => ({
                  value: d.id,
                  label: `${d.full_name} (${d.phone})`,
                }))}
              />
            )}
          </Field>
          <Field label="Ghi chú lệnh điều động">
            {(p) => (
              <Input
                {...p}
                value={newRunNote}
                onChange={(e) => setNewRunNote(e.target.value)}
                placeholder="VD: Xe tăng cường đón cụm Cầu Giấy…"
              />
            )}
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAddRunOpen(false)}>
              Hủy
            </Button>
            <Button loading={creatingRun} onClick={handleCreateRun}>
              Thêm xe vào lô
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
