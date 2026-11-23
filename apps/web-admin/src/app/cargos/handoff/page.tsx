'use client';

import type { CargoDto, TripRunDto } from '@limousine-workspace/shared-types';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  Money,
  Phone,
  StatusTag,
  Stepper,
  useToast,
} from '@limousine-workspace/shared-ui';
import { Select } from 'antd';
import { ArrowLeft, CheckCircle2, QrCode, Search } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminShell } from '../../../components/shell/AdminShell';
import { adminApi } from '../../../lib/api';

export default function CargoHandoffPage() {
  const toast = useToast();

  const [cargos, setCargos] = useState<CargoDto[]>([]);
  const [runs, setRuns] = useState<TripRunDto[]>([]);
  const [scanCode, setScanCode] = useState('');
  const [selectedCargoId, setSelectedCargoId] = useState('');
  const [selectedRunId, setSelectedRunId] = useState('');
  const [hubNote, setHubNote] = useState('Điểm bàn giao: Bến xe trung chuyển');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [cRes, rRes] = await Promise.all([
        adminApi.cargos({ limit: 50 }),
        adminApi.tripRuns({ limit: 50 }),
      ]);
      const activeCargos = cRes.items.filter((c) =>
        ['CREATED', 'PICKED_UP', 'IN_TRANSIT'].includes(c.status),
      );
      setCargos(activeCargos);
      setRuns(
        rRes.items.filter((r) =>
          ['PENDING', 'DISPATCHED', 'IN_PROGRESS'].includes(r.status),
        ),
      );
      if (activeCargos[0] && !selectedCargoId) {
        setSelectedCargoId(activeCargos[0].id);
      }
      if (rRes.items[0] && !selectedRunId) {
        setSelectedRunId(rRes.items[0].id);
      }
    } catch {
      // ignore
    }
  }, [selectedCargoId, selectedRunId]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedCargo = useMemo(
    () => cargos.find((c) => c.id === selectedCargoId) ?? null,
    [cargos, selectedCargoId],
  );

  const handleScanLookup = () => {
    const q = scanCode.trim().toUpperCase();
    if (!q) return;
    const hit = cargos.find((c) => c.waybill_code.toUpperCase() === q);
    if (hit) {
      setSelectedCargoId(hit.id);
      toast.success(`Đã tìm thấy kiện hàng ${hit.waybill_code}`);
    } else {
      toast.error(`Không tìm thấy vận đơn "${q}" trong danh sách chờ bàn giao`);
    }
  };

  const handleConfirmHandoff = async () => {
    if (!selectedCargo) {
      toast.error('Vui lòng chọn kiện hàng cần bàn giao');
      return;
    }
    if (!selectedRunId) {
      toast.error('Vui lòng chọn chuyến xe nhận bàn giao');
      return;
    }
    setSaving(true);
    try {
      await adminApi.updateCargo(selectedCargo.id, {
        trip_run_id: selectedRunId,
        status:
          selectedCargo.status === 'CREATED'
            ? 'PICKED_UP'
            : selectedCargo.status,
        note: hubNote.trim() || undefined,
      });
      toast.success(
        `Đã xác nhận bàn giao kiện ${selectedCargo.waybill_code} lên chuyến xe!`,
      );
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Bàn giao thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="Bàn giao Trung chuyển"
      subtitle="Quét QR kiện hàng · Đối chiếu COD / tình trạng · Xác nhận bàn giao lên xe"
      breadcrumbs={[
        { label: 'Vận hành Hàng hóa', href: '/cargos' },
        { label: 'Bàn giao Trung chuyển' },
      ]}
      headerExtra={
        <Link href="/cargos">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ArrowLeft className="size-4" />}
          >
            Danh sách vận đơn
          </Button>
        </Link>
      }
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <Card>
          <Stepper
            current={selectedCargo ? (selectedRunId ? 2 : 1) : 0}
            steps={[
              {
                label: '1) Quét QR kiện hàng',
                description: 'Tra mã vận đơn',
              },
              {
                label: '2) Đối chiếu COD / tình trạng',
                description: 'Kiểm tra niêm phong',
              },
              {
                label: '3) Xác nhận bàn giao',
                description: 'Gán chuyến & tài xế',
              },
            ]}
          />
        </Card>

        {/* Main Handoff Card (frame nvCargoHandoff) */}
        <Card className="flex flex-col gap-6">
          <CardHeader
            title="Quy trình Bàn giao Trung chuyển (nvCargoHandoff)"
            description="Dùng máy quét mã vạch / QR hoặc chọn kiện hàng từ danh sách tại bến"
          />

          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <Input
              value={scanCode}
              onChange={(e) => setScanCode(e.target.value)}
              placeholder="Quét hoặc nhập mã vận đơn (VD: CG-4HX82N)…"
              leftIcon={<QrCode className="size-4" />}
              onKeyDown={(e) => e.key === 'Enter' && handleScanLookup()}
            />
            <Button
              variant="secondary"
              leftIcon={<Search className="size-4" />}
              onClick={handleScanLookup}
            >
              Tra cứu QR
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Chọn kiện hàng cần bàn giao" required>
              {() => (
                <Select
                  className="w-full"
                  value={selectedCargoId}
                  onChange={(v) => setSelectedCargoId(v)}
                  options={cargos.map((c) => ({
                    value: c.id,
                    label: `${c.waybill_code} — ${c.description} (${c.route.name})`,
                  }))}
                />
              )}
            </Field>

            <Field label="Chọn xe / chuyến nhận bàn giao (Trip_Run)" required>
              {() => (
                <Select
                  className="w-full"
                  value={selectedRunId}
                  onChange={(v) => setSelectedRunId(v)}
                  options={runs.map((r) => ({
                    value: r.id,
                    label: `${r.code} · Xe ${r.vehicle.license_plate} (${r.driver.full_name})`,
                  }))}
                />
              )}
            </Field>
          </div>

          {selectedCargo && (
            <div className="rounded-card border border-border-subtle bg-surface-2 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-brand-fg">
                    {selectedCargo.waybill_code}
                  </span>
                  <StatusTag domain="cargo" status={selectedCargo.status} />
                  {selectedCargo.is_fragile && (
                    <Badge tone="warning">Hàng dễ vỡ</Badge>
                  )}
                </div>
                <span className="text-xs text-fg-muted">
                  Cỡ {selectedCargo.size} · {selectedCargo.weight_kg} kg
                </span>
              </div>
              <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                <div>
                  <p className="text-fg-muted">Người gửi:</p>
                  <p className="font-medium text-fg">
                    {selectedCargo.sender.name} (
                    <Phone value={selectedCargo.sender.phone} />)
                  </p>
                  <p className="text-fg-secondary">
                    {selectedCargo.sender.address}
                  </p>
                </div>
                <div>
                  <p className="text-fg-muted">Người nhận:</p>
                  <p className="font-medium text-fg">
                    {selectedCargo.receiver.name} (
                    <Phone value={selectedCargo.receiver.phone} />)
                  </p>
                  <p className="text-fg-secondary">
                    {selectedCargo.receiver.address}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-3 text-xs">
                <span>
                  Cước vận chuyển:{' '}
                  <Money
                    value={selectedCargo.fee_vnd}
                    className="font-semibold text-fg"
                  />
                </span>
                <span>
                  COD cần thu:{' '}
                  <Money
                    value={selectedCargo.cod_amount_vnd}
                    className="font-bold text-brand-fg"
                  />
                </span>
              </div>
            </div>
          )}

          <Field label="Điểm bàn giao & Ghi chú tình trạng kiện hàng">
            {(p) => (
              <Input
                {...p}
                value={hubNote}
                onChange={(e) => setHubNote(e.target.value)}
              />
            )}
          </Field>

          <div className="flex justify-end gap-2">
            <Button
              size="lg"
              loading={saving}
              leftIcon={<CheckCircle2 className="size-4" />}
              onClick={handleConfirmHandoff}
            >
              Xác nhận bàn giao
            </Button>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
