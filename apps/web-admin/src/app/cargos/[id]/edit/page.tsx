'use client';

import type {
  CargoDto,
  CargoStatus,
  TripRunDto,
} from '@limousine-workspace/shared-types';
import {
  Button,
  Card,
  CardFooter,
  ErrorState,
  Field,
  FormSection,
  Skeleton,
  StatusTag,
  Textarea,
  useToast,
} from '@limousine-workspace/shared-ui';
import { Select } from 'antd';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { AdminShell } from '../../../../components/shell/AdminShell';
import { adminApi } from '../../../../lib/api';

export default function CargoEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const [cargo, setCargo] = useState<CargoDto | null>(null);
  const [runs, setRuns] = useState<TripRunDto[]>([]);
  const [status, setStatus] = useState<CargoStatus>('CREATED');
  const [tripRunId, setTripRunId] = useState<string>('');
  const [note, setNote] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [c, rRes] = await Promise.all([
        adminApi.cargo(id),
        adminApi.tripRuns({ limit: 50 }),
      ]);
      setCargo(c);
      setRuns(rRes.items);
      setStatus(c.status);
      setTripRunId(c.trip_run_id ?? '');
      setNote(c.note ?? '');
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !cargo) return;
    setSaving(true);
    try {
      await adminApi.updateCargo(id, {
        status: status !== cargo.status ? status : undefined,
        trip_run_id: tripRunId || null,
        note: note.trim() || undefined,
      });
      toast.success('Đã cập nhật vận đơn ký gửi');
      router.push(`/cargos/${id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="Sửa vận đơn ký gửi"
      subtitle="Chỉnh sửa chuyến xe vận chuyển, ghi chú và cập nhật trạng thái đơn"
      breadcrumbs={[
        { label: 'Vận hành Hàng hóa', href: '/cargos' },
        { label: cargo?.waybill_code ?? 'Chi tiết', href: `/cargos/${id}` },
        { label: 'Sửa vận đơn' },
      ]}
      headerExtra={
        <Link href={`/cargos/${id}`}>
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
      ) : loading || !cargo ? (
        <Card>
          <Skeleton className="h-64 w-full" rounded="card" />
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Card className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-mono text-xl font-bold text-brand-fg">
                  {cargo.waybill_code}
                </h2>
                <StatusTag domain="cargo" status={cargo.status} />
              </div>
              <p className="mt-1 text-xs text-fg-muted">
                Tuyến: {cargo.route.name} · Người nhận: {cargo.receiver.name} (
                {cargo.receiver.phone})
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/cargos/${id}`}>
                <Button type="button" variant="ghost">
                  Hủy
                </Button>
              </Link>
              <Button type="submit" loading={saving}>
                Lưu thay đổi
              </Button>
            </div>
          </Card>

          <Card>
            <FormSection title="Chỉnh sửa vận đơn (nvOrdP2Ed)">
              <Field label="Trạng thái vận đơn">
                {() => (
                  <Select
                    className="w-full"
                    value={status}
                    onChange={(v) => setStatus(v)}
                    options={[
                      { value: 'CREATED', label: 'Chờ tiếp nhận' },
                      { value: 'PICKED_UP', label: 'Đã nhận hàng' },
                      { value: 'IN_TRANSIT', label: 'Đang vận chuyển' },
                      { value: 'DELIVERED', label: 'Đã giao hàng' },
                      { value: 'RETURNED', label: 'Đã hoàn trả' },
                      { value: 'CANCELLED', label: 'Đã hủy' },
                    ]}
                  />
                )}
              </Field>

              <Field label="Gán chuyến xe chạy (Trip_Run)">
                {() => (
                  <Select
                    className="w-full"
                    value={tripRunId}
                    onChange={(v) => setTripRunId(v)}
                    options={[
                      { value: '', label: 'Chưa gán chuyến xe' },
                      ...runs.map((r) => ({
                        value: r.id,
                        label: `${r.code} — Xe ${r.vehicle.license_plate} (${r.driver.full_name})`,
                      })),
                    ]}
                  />
                )}
              </Field>

              <Field label="Ghi chú vận hành" className="sm:col-span-2">
                {(p) => (
                  <Textarea
                    {...p}
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                )}
              </Field>
            </FormSection>

            <CardFooter>
              <Link href={`/cargos/${id}`}>
                <Button type="button" variant="ghost">
                  Hủy
                </Button>
              </Link>
              <Button type="submit" loading={saving}>
                Lưu thay đổi
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </AdminShell>
  );
}
