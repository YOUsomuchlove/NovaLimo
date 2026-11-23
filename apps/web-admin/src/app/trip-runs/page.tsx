'use client';

import type {
  DriverDto,
  TripBatchDto,
  TripRunDto,
  TripRunStatus,
  VehicleDto,
} from '@limousine-workspace/shared-types';
import {
  Avatar,
  Button,
  DataTable,
  DateTime,
  Field,
  FilterBar,
  Input,
  KpiCard,
  Phone,
  StatusTag,
  useToast,
} from '@limousine-workspace/shared-ui';
import { Modal, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Bus,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  FileText,
  Plus,
  RefreshCw,
  Send,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminShell } from '../../components/shell/AdminShell';
import { adminApi, resolveUploadUrl } from '../../lib/api';

export default function TripRunsPage() {
  const router = useRouter();
  const toast = useToast();

  const [runs, setRuns] = useState<TripRunDto[] | undefined>(undefined);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<TripRunStatus | ''>('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  // Create Run Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [batches, setBatches] = useState<TripBatchDto[]>([]);
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [drivers, setDrivers] = useState<DriverDto[]>([]);
  const [batchId, setBatchId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [note, setNote] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.tripRuns({
        page,
        limit,
        q: q.trim() || undefined,
        status: status || undefined,
        date: date || undefined,
      });
      setRuns(res.items);
      setTotal(res.total);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [page, limit, q, status, date]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreateModal = async () => {
    setCreateOpen(true);
    try {
      const [bRes, vRes, dRes] = await Promise.all([
        adminApi.tripBatches({ limit: 30 }),
        adminApi.vehicles({ status: 'AVAILABLE', limit: 100 }),
        adminApi.drivers({ status: 'ACTIVE', limit: 100 }),
      ]);
      setBatches(bRes.items);
      setVehicles(vRes.items);
      setDrivers(dRes.items);
      if (bRes.items[0]) setBatchId(bRes.items[0].id);
      if (vRes.items[0]) setVehicleId(vRes.items[0].id);
      if (dRes.items[0]) setDriverId(dRes.items[0].id);
    } catch {
      // ignore
    }
  };

  const handleCreateRun = async () => {
    if (!batchId || !vehicleId || !driverId) {
      toast.error('Vui lòng chọn lô chuyến, phương tiện và tài xế');
      return;
    }
    setCreating(true);
    try {
      const created = await adminApi.createTripRun({
        trip_batch_id: batchId,
        vehicle_id: vehicleId,
        driver_id: driverId,
        note: note.trim() || undefined,
      });
      toast.success(`Đã tạo chuyến chạy ${created.code}`);
      setCreateOpen(false);
      router.push(`/trip-runs/${created.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể tạo chuyến');
    } finally {
      setCreating(false);
    }
  };

  const stats = useMemo(() => {
    const list = runs ?? [];
    return {
      inProgress: list.filter((r) => r.status === 'IN_PROGRESS').length,
      waiting: list.filter(
        (r) => r.status === 'PENDING' || r.status === 'DISPATCHED',
      ).length,
      finished: list.filter((r) => r.status === 'FINISHED').length,
      passengers: list.reduce((s, r) => s + r.passenger_count, 0),
    };
  }, [runs]);

  const columns: ColumnsType<TripRunDto> = useMemo(
    () => [
      {
        title: 'Mã chuyến',
        dataIndex: 'code',
        key: 'code',
        render: (c: string, r) => (
          <div>
            <Link
              href={`/trip-runs/${r.id}`}
              className="font-mono text-sm font-semibold text-brand-fg hover:underline"
            >
              {c}
            </Link>
            {r.planned_distance_km && (
              <p className="text-xs text-fg-muted">
                Lộ trình ~{r.planned_distance_km} km
              </p>
            )}
          </div>
        ),
      },
      {
        title: 'Phương tiện',
        key: 'vehicle',
        render: (_, r) => (
          <div>
            <Link
              href={`/vehicles/${r.vehicle.id}`}
              className="font-mono text-sm font-semibold text-fg hover:text-brand-fg"
            >
              {r.vehicle.license_plate}
            </Link>
            <p className="text-xs text-fg-muted">
              Sức chứa {r.vehicle.capacity} ghế
            </p>
          </div>
        ),
      },
      {
        title: 'Tài xế',
        key: 'driver',
        render: (_, r) => (
          <div className="flex items-center gap-2.5">
            <Avatar
              name={r.driver.full_name}
              src={resolveUploadUrl(r.driver.avatar_url)}
              size={32}
            />
            <div>
              <Link
                href={`/vehicles/drivers/${r.driver.id}`}
                className="text-sm font-medium text-fg hover:text-brand-fg"
              >
                {r.driver.full_name}
              </Link>
              <Phone
                value={r.driver.phone}
                className="block text-xs text-fg-muted"
              />
            </div>
          </div>
        ),
      },
      {
        title: 'Khách',
        key: 'pax',
        render: (_, r) => (
          <span className="font-mono text-sm font-semibold tabular-nums text-fg">
            {r.passenger_count}/{r.vehicle.capacity}
          </span>
        ),
      },
      {
        title: 'Hàng hóa',
        dataIndex: 'cargo_count',
        key: 'cargo_count',
        render: (n: number) => (
          <span className="font-mono text-sm tabular-nums text-fg-secondary">
            {n} kiện
          </span>
        ),
      },
      {
        title: 'Xuất lệnh / Bắt đầu',
        key: 'times',
        render: (_, r) => (
          <div className="text-xs text-fg-secondary">
            <div>
              Xuất lệnh: <DateTime value={r.dispatched_at} />
            </div>
            <div className="text-fg-muted">
              Lăn bánh: <DateTime value={r.started_at} />
            </div>
          </div>
        ),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (s: TripRunStatus) => <StatusTag domain="tripRun" status={s} />,
      },
      {
        title: 'Thao tác',
        key: 'actions',
        align: 'right',
        render: (_, r) => (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {r.status === 'PENDING' &&
              r.passenger_count + r.cargo_count > 0 && (
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<Send className="size-3.5" />}
                  onClick={async () => {
                    try {
                      await adminApi.changeTripRunStatus(r.id, 'DISPATCHED');
                      toast.success(`Đã xuất lệnh chuyến ${r.code}`);
                      void load();
                    } catch (err) {
                      toast.error(
                        err instanceof Error
                          ? err.message
                          : 'Không thể xuất lệnh',
                      );
                    }
                  }}
                >
                  Xuất lệnh
                </Button>
              )}
            <Link href={`/trip-runs/${r.id}/manifest`} title="Phơi lệnh">
              <Button size="icon-sm" variant="ghost" aria-label="Phơi lệnh">
                <FileText className="size-4" />
              </Button>
            </Link>
            <Link href={`/trip-runs/${r.id}`} title="Xem chi tiết">
              <Button size="icon-sm" variant="ghost" aria-label="Chi tiết">
                <Eye className="size-4" />
              </Button>
            </Link>
            <Link href={`/trip-runs/${r.id}/edit`} title="Chỉnh sửa">
              <Button size="icon-sm" variant="ghost" aria-label="Chỉnh sửa">
                <Edit className="size-4" />
              </Button>
            </Link>
          </div>
        ),
      },
    ],
    [load, toast],
  );

  return (
    <AdminShell
      title="Quản lý Chuyến (Trip Runs)"
      subtitle="Danh sách chuyến xe thực tế · Lọc nhanh · Drill-down chi tiết & phơi lệnh"
    >
      <div className="flex flex-col gap-6">
        {/* 4 Stats Row (frame nvTripRunsListStatsRow) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Chuyến đang chạy"
            value={String(stats.inProgress)}
            icon={<Bus className="size-4" />}
          />
          <KpiCard
            label="Chuyến chờ xuất bến"
            value={String(stats.waiting)}
            icon={<Clock className="size-4" />}
          />
          <KpiCard
            label="Chuyến hoàn thành"
            value={String(stats.finished)}
            icon={<CheckCircle2 className="size-4" />}
          />
          <KpiCard
            label="Tổng hành khách trên trang"
            value={`${stats.passengers} khách`}
            icon={<Users className="size-4" />}
          />
        </div>

        {/* Table */}
        <DataTable<TripRunDto>
          columns={columns}
          data={runs}
          rowKey="id"
          loading={loading}
          error={error}
          onRetry={load}
          onRowClick={(row) => router.push(`/trip-runs/${row.id}`)}
          pagination={{
            page,
            pageSize: limit,
            total,
            onChange: (p, ps) => {
              setPage(p);
              setLimit(ps);
            },
          }}
          toolbar={
            <FilterBar
              search={{
                value: q,
                onChange: (v) => {
                  setQ(v);
                  setPage(1);
                },
                placeholder: 'Tìm mã chuyến, biển số, tên tài xế…',
              }}
              onReset={
                q || status || date
                  ? () => {
                      setQ('');
                      setStatus('');
                      setDate('');
                      setPage(1);
                    }
                  : undefined
              }
              actions={
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<RefreshCw className="size-3.5" />}
                    onClick={load}
                  >
                    Làm mới
                  </Button>
                  <Button
                    size="sm"
                    leftIcon={<Plus className="size-4" />}
                    onClick={openCreateModal}
                  >
                    Tạo chuyến
                  </Button>
                </>
              }
            >
              <Input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-44"
              />
              <Select
                className="w-full sm:w-44"
                value={status}
                onChange={(v) => {
                  setStatus(v);
                  setPage(1);
                }}
                options={[
                  { value: '', label: 'Mọi trạng thái' },
                  { value: 'PENDING', label: 'Chờ xuất lệnh' },
                  { value: 'DISPATCHED', label: 'Đã xuất lệnh' },
                  { value: 'IN_PROGRESS', label: 'Đang chạy' },
                  { value: 'FINISHED', label: 'Hoàn thành' },
                  { value: 'CANCELLED', label: 'Đã hủy' },
                ]}
              />
            </FilterBar>
          }
          empty={{
            title: 'Chưa có chuyến chạy nào',
            description:
              'Tạo chuyến mới hoặc mở màn Điều phối thông minh để xếp xe tự động.',
            action: (
              <Button
                size="sm"
                leftIcon={<Plus className="size-4" />}
                onClick={openCreateModal}
              >
                Tạo chuyến
              </Button>
            ),
          }}
        />
      </div>

      <Modal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        title="Tạo chuyến chạy mới (Trip_Run)"
        footer={null}
      >
        <div className="mt-4 flex flex-col gap-4">
          <Field label="Chọn lô chuyến (Trip_Batch)" required>
            {() => (
              <Select
                className="w-full"
                value={batchId}
                onChange={(v) => setBatchId(v)}
                options={batches.map((b) => ({
                  value: b.id,
                  label: `${b.route.name} — ${new Date(b.departure_at).toLocaleString('vi-VN')} (${b.code})`,
                }))}
              />
            )}
          </Field>
          <Field label="Chọn phương tiện" required>
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
          <Field label="Chọn tài xế" required>
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
          <Field label="Ghi chú">
            {(p) => (
              <Input
                {...p}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú lệnh điều động…"
              />
            )}
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Hủy
            </Button>
            <Button loading={creating} onClick={handleCreateRun}>
              Tạo chuyến
            </Button>
          </div>
        </div>
      </Modal>
    </AdminShell>
  );
}
