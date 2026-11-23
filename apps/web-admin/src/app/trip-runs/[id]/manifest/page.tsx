'use client';

import type { DriverRunDetailDto } from '@limousine-workspace/shared-types';
import {
  Badge,
  Button,
  Card,
  DateTime,
  ErrorState,
  Money,
  Phone,
  Skeleton,
  StatusTag,
} from '@limousine-workspace/shared-ui';
import { ArrowLeft, FileDown, Printer, QrCode } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminShell } from '../../../../components/shell/AdminShell';
import { adminApi } from '../../../../lib/api';

export default function TripRunManifestPage() {
  const { id } = useParams<{ id: string }>();

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

  const passengerRows = useMemo(() => {
    if (!run) return [];
    const pickups = run.stops.filter(
      (s) => s.ref_type === 'BOOKING' && s.kind === 'PICKUP',
    );
    return pickups.map((p, i) => {
      const drop = run.stops.find(
        (x) => x.ref_id === p.ref_id && x.kind === 'DROPOFF',
      );
      return {
        index: p.order ?? i + 1,
        ref_id: p.ref_id,
        name: p.name,
        phone: p.phone,
        seats: p.seats,
        pickupAddress: p.address,
        dropoffAddress: drop?.address ?? '—',
        status: p.status,
        note: p.note,
      };
    });
  }, [run]);

  const cargoRows = useMemo(() => {
    if (!run) return [];
    return run.stops.filter(
      (s) => s.ref_type === 'CARGO' && s.kind === 'DROPOFF',
    );
  }, [run]);

  return (
    <AdminShell
      title="Phơi lệnh (Manifest)"
      subtitle="In / Xuất lệnh điều hành · Mã QR chuyến · Thứ tự đón/trả chuẩn"
      breadcrumbs={[
        { label: 'Chuyến (Trip Runs)', href: '/trip-runs' },
        { label: run?.code ?? 'Chi tiết', href: `/trip-runs/${id}` },
        { label: 'Phơi lệnh (Manifest)' },
      ]}
      headerExtra={
        <div className="flex items-center gap-2">
          <Link href={`/trip-runs/${id}`}>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowLeft className="size-4" />}
            >
              Chi tiết chuyến
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Printer className="size-4" />}
            onClick={() => window.print()}
          >
            In
          </Button>
          <Button
            size="sm"
            leftIcon={<FileDown className="size-4" />}
            onClick={() => window.print()}
          >
            Xuất PDF
          </Button>
        </div>
      }
    >
      {error ? (
        <Card>
          <ErrorState onRetry={load} />
        </Card>
      ) : loading || !run ? (
        <Card>
          <Skeleton className="h-96 w-full" rounded="card" />
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Printable Manifest Sheet (frame nvTripRunManifestSheet) */}
          <Card className="print-sheet p-6 sm:p-10">
            <div className="flex flex-wrap items-start justify-between gap-6 border-b border-border-subtle pb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-fg">
                  CÔNG TY VẬN TẢI HÀNH KHÁCH CAO CẤP NOVALIMO
                </p>
                <h2 className="mt-1 font-mono text-2xl font-bold text-fg">
                  PHƠI LỆNH CHUYẾN · {run.code}
                </h2>
                <p className="mt-1 text-sm text-fg-secondary">
                  {run.trip.route.name} · Khởi hành{' '}
                  <DateTime value={run.trip.departure_at} /> · Xe{' '}
                  <span className="font-mono font-bold text-fg">
                    {run.vehicle.license_plate}
                  </span>{' '}
                  ({run.vehicle.capacity} chỗ)
                </p>
                <p className="mt-1 text-sm text-fg-secondary">
                  Tài xế:{' '}
                  <span className="font-semibold text-fg">
                    {run.driver.full_name}
                  </span>{' '}
                  · SĐT: <Phone value={run.driver.phone} />
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex size-20 items-center justify-center rounded-control border border-border-strong bg-surface-2 p-2">
                  <QrCode className="size-14 text-brand-fg" />
                </div>
                <StatusTag domain="tripRun" status={run.status} />
              </div>
            </div>

            {/* Passengers Table */}
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-fg">
                  1. Danh sách hành khách (theo thứ tự đón)
                </h3>
                <Badge tone="brand">
                  Tổng: {run.passenger_count}/{run.vehicle.capacity} ghế
                </Badge>
              </div>

              <div className="overflow-x-auto rounded-control border border-border-subtle">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border-subtle bg-surface-2 text-xs font-semibold uppercase text-fg-muted">
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Họ tên</th>
                      <th className="px-4 py-3">SĐT</th>
                      <th className="px-4 py-3">Ghế</th>
                      <th className="px-4 py-3">Điểm đón</th>
                      <th className="px-4 py-3">Điểm trả</th>
                      <th className="px-4 py-3">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {passengerRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-6 text-center text-fg-muted"
                        >
                          Chưa có hành khách trên chuyến này
                        </td>
                      </tr>
                    ) : (
                      passengerRows.map((row) => (
                        <tr key={row.ref_id}>
                          <td className="px-4 py-3 font-mono font-bold text-brand-fg">
                            {row.index}
                          </td>
                          <td className="px-4 py-3 font-medium text-fg">
                            {row.name}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-fg-secondary">
                            {row.phone}
                          </td>
                          <td className="px-4 py-3 font-mono font-semibold text-fg">
                            {row.seats.join(', ')}
                          </td>
                          <td className="px-4 py-3 text-xs text-fg-secondary">
                            {row.pickupAddress}
                          </td>
                          <td className="px-4 py-3 text-xs text-fg-secondary">
                            {row.dropoffAddress}
                          </td>
                          <td className="px-4 py-3 text-xs text-fg-muted">
                            {row.note ?? '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cargo Table */}
            <div className="mt-8">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-base font-semibold text-fg">
                  2. Hàng hóa ký gửi đi kèm ({cargoRows.length} kiện)
                </h3>
                <span className="text-xs text-fg-muted">
                  Ghi chú: hàng hóa là “hành khách ảo”, không chiếm ghế ngồi.
                </span>
              </div>

              <div className="overflow-x-auto rounded-control border border-border-subtle">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border-subtle bg-surface-2 text-xs font-semibold uppercase text-fg-muted">
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Người nhận</th>
                      <th className="px-4 py-3">SĐT nhận</th>
                      <th className="px-4 py-3">Điểm giao</th>
                      <th className="px-4 py-3">Mô tả hàng</th>
                      <th className="px-4 py-3">Thu hộ COD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {cargoRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-6 text-center text-fg-muted"
                        >
                          Không có hàng hóa ký gửi trên chuyến này
                        </td>
                      </tr>
                    ) : (
                      cargoRows.map((c, idx) => (
                        <tr key={c.ref_id}>
                          <td className="px-4 py-3 font-mono">{idx + 1}</td>
                          <td className="px-4 py-3 font-medium text-fg">
                            {c.name}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs">
                            {c.phone}
                          </td>
                          <td className="px-4 py-3 text-xs text-fg-secondary">
                            {c.address}
                          </td>
                          <td className="px-4 py-3 text-xs text-fg-muted">
                            {c.note ?? '—'}
                          </td>
                          <td className="px-4 py-3 font-semibold text-brand-fg">
                            {c.cod_amount_vnd ? (
                              <Money value={c.cod_amount_vnd} />
                            ) : (
                              '0 ₫'
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signatures */}
            <div className="mt-10 grid grid-cols-2 gap-8 border-t border-border-subtle pt-6 text-center text-xs text-fg-muted">
              <div>
                <p className="font-semibold uppercase text-fg">
                  Điều hành xuất lệnh
                </p>
                <p className="mt-12">(Ký & ghi rõ họ tên)</p>
              </div>
              <div>
                <p className="font-semibold uppercase text-fg">
                  Tài xế nhận lệnh ({run.driver.full_name})
                </p>
                <p className="mt-12">(Ký & ghi rõ họ tên)</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AdminShell>
  );
}
