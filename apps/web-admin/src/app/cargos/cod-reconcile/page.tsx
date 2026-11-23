'use client';

import type { CodSettlementDto } from '@limousine-workspace/shared-types';
import {
  Button,
  Card,
  CardHeader,
  DataTable,
  DateTime,
  KpiCard,
  Money,
  StatusTag,
  useConfirm,
  useToast,
} from '@limousine-workspace/shared-ui';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  RefreshCw,
  Users,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminShell } from '../../../components/shell/AdminShell';
import {
  type CodOutstandingRowDto,
  adminApi,
  exportToCsv,
} from '../../../lib/api';

export default function CodReconcilePage() {
  const toast = useToast();
  const confirm = useConfirm();

  const [outstanding, setOutstanding] = useState<
    CodOutstandingRowDto[] | undefined
  >(undefined);
  const [settlements, setSettlements] = useState<
    CodSettlementDto[] | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [out, setts] = await Promise.all([
        adminApi.codOutstanding(),
        adminApi.codSettlements(),
      ]);
      setOutstanding(out);
      setSettlements(setts);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPendingVnd = useMemo(
    () => (outstanding ?? []).reduce((s, r) => s + Number(r.amount_vnd), 0),
    [outstanding],
  );
  const totalSettledVnd = useMemo(
    () => (settlements ?? []).reduce((s, r) => s + Number(r.amount_vnd), 0),
    [settlements],
  );

  const outstandingColumns: ColumnsType<CodOutstandingRowDto> = useMemo(
    () => [
      {
        title: 'Tài xế',
        dataIndex: 'driver_name',
        key: 'driver_name',
        render: (name: string, r) => (
          <Link
            href={`/vehicles/drivers/${r.driver_id}`}
            className="text-sm font-semibold text-fg hover:text-brand-fg"
          >
            {name}
          </Link>
        ),
      },
      {
        title: 'Số đơn COD đã thu',
        dataIndex: 'cargo_count',
        key: 'cargo_count',
        render: (n: number) => (
          <span className="font-mono text-sm font-semibold text-fg">
            {n} kiện
          </span>
        ),
      },
      {
        title: 'Thu từ thời điểm',
        dataIndex: 'oldest_collected_at',
        key: 'oldest_collected_at',
        render: (d: string) => <DateTime value={d} />,
      },
      {
        title: 'Số tiền cần nộp quỹ',
        dataIndex: 'amount_vnd',
        key: 'amount_vnd',
        render: (v: number) => (
          <Money value={v} className="text-base font-bold text-brand-fg" />
        ),
      },
      {
        title: 'Thao tác',
        key: 'actions',
        align: 'right',
        render: (_, r) => (
          <Button
            size="sm"
            leftIcon={<CheckCircle2 className="size-3.5" />}
            onClick={async () => {
              if (
                await confirm({
                  title: `Xác nhận thu quỹ COD từ tài xế ${r.driver_name}?`,
                  content: `Số tiền ${r.amount_vnd.toLocaleString('vi-VN')} ₫ (${r.cargo_count} đơn) sẽ được ghi nhận vào Sổ quỹ Tài chính.`,
                  okText: 'Xác nhận đã thu',
                })
              ) {
                try {
                  await adminApi.settleCod({
                    driver_id: r.driver_id,
                    note: `Đối soát COD ${r.cargo_count} đơn`,
                  });
                  toast.success(`Đã đối soát COD cho tài xế ${r.driver_name}`);
                  void load();
                } catch (err) {
                  toast.error(
                    err instanceof Error ? err.message : 'Đối soát thất bại',
                  );
                }
              }
            }}
          >
            Xác nhận đã nộp
          </Button>
        ),
      },
    ],
    [confirm, load, toast],
  );

  const settlementColumns: ColumnsType<CodSettlementDto> = useMemo(
    () => [
      {
        title: 'Thời gian đối soát',
        dataIndex: 'confirmed_at',
        key: 'confirmed_at',
        render: (d: string | null, r) => <DateTime value={d ?? r.created_at} />,
      },
      {
        title: 'Tài xế nộp quỹ',
        key: 'driver',
        render: (_, r) => (
          <span className="text-sm font-medium text-fg">
            {r.driver.full_name}
          </span>
        ),
      },
      {
        title: 'Số vận đơn',
        dataIndex: 'cargo_count',
        key: 'cargo_count',
        render: (n: number) => (
          <span className="font-mono text-xs">{n} đơn</span>
        ),
      },
      {
        title: 'Tổng tiền đã nộp',
        dataIndex: 'amount_vnd',
        key: 'amount_vnd',
        render: (v: number) => (
          <Money value={v} className="font-semibold text-success-fg" />
        ),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (s: CodSettlementDto['status']) => (
          <StatusTag domain="codSettlement" status={s} />
        ),
      },
      {
        title: 'Ghi chú',
        dataIndex: 'note',
        key: 'note',
        render: (n: string | null) => (
          <span className="text-xs text-fg-muted">{n ?? '—'}</span>
        ),
      },
    ],
    [],
  );

  return (
    <AdminShell
      title="Đối soát COD"
      subtitle="Theo dõi tiền thu hộ COD theo tài xế · Xác nhận nộp quỹ · Xuất Excel/CSV"
      breadcrumbs={[
        { label: 'Vận hành Hàng hóa', href: '/cargos' },
        { label: 'Đối soát COD' },
      ]}
      headerExtra={
        <div className="flex items-center gap-2">
          <Link href="/cargos">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowLeft className="size-4" />}
            >
              Danh sách vận đơn
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="size-4" />}
            onClick={() => {
              if (!settlements?.length) return;
              exportToCsv('novalimo-cod-settlements.csv', settlements, [
                { header: 'Mã đối soát', value: (r) => r.id },
                { header: 'Tài xế', value: (r) => r.driver.full_name },
                { header: 'Số đơn', value: (r) => r.cargo_count },
                { header: 'Số tiền VND', value: (r) => r.amount_vnd },
                { header: 'Trạng thái', value: (r) => r.status },
                { header: 'Thời gian', value: (r) => r.confirmed_at },
              ]);
            }}
          >
            Xuất Excel / CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw className="size-3.5" />}
            onClick={load}
          >
            Làm mới
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Summary KPI Bar (frame nvCargoCodReconcileSummary) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard
            label="Cần nộp (Chờ đối soát)"
            value={<Money value={totalPendingVnd} />}
            icon={<Wallet className="size-4" />}
          />
          <KpiCard
            label="Số tài xế đang giữ COD"
            value={`${outstanding?.length ?? 0} tài xế`}
            icon={<Users className="size-4" />}
          />
          <KpiCard
            label="Tổng COD đã đối soát"
            value={<Money value={totalSettledVnd} />}
            icon={<CheckCircle2 className="size-4" />}
          />
        </div>

        {/* Outstanding COD Table */}
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-fg">
            1. Danh sách tài xế đang giữ tiền COD cần nộp
          </h2>
          <DataTable<CodOutstandingRowDto>
            columns={outstandingColumns}
            data={outstanding}
            rowKey="driver_id"
            loading={loading}
            error={error}
            onRetry={load}
            empty={{
              title: 'Không có khoản COD nào tồn đọng',
              description:
                'Tất cả các đơn thu hộ COD đã giao đều đã được tài xế nộp quỹ đầy đủ.',
            }}
          />
        </div>

        {/* Completed Settlements History */}
        <Card padding="none">
          <div className="p-5 pb-0">
            <CardHeader
              title="2. Lịch sử phiếu đối soát COD đã hoàn tất"
              description="Mỗi phiếu đối soát tự động tạo 1 bút toán Thu vào Sổ quỹ Tài chính"
            />
          </div>
          <DataTable<CodSettlementDto>
            columns={settlementColumns}
            data={settlements}
            rowKey="id"
            loading={loading}
            className="border-0 shadow-none"
            empty={{
              title: 'Chưa có lịch sử đối soát COD',
            }}
          />
        </Card>
      </div>
    </AdminShell>
  );
}
