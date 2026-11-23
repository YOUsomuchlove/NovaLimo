'use client';

import type { CargoDto, CargoStatus } from '@limousine-workspace/shared-types';
import {
  Badge,
  Button,
  DataTable,
  DateTime,
  FilterBar,
  Money,
  Phone,
  SegmentedControl,
  StatusTag,
} from '@limousine-workspace/shared-ui';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowLeftRight,
  Edit,
  Eye,
  Plus,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminShell } from '../../components/shell/AdminShell';
import { adminApi } from '../../lib/api';

type CargoFilterTab = 'ALL' | 'CREATED' | 'IN_TRANSIT' | 'DELIVERED';

export default function CargosPage() {
  const router = useRouter();

  const [filterTab, setFilterTab] = useState<CargoFilterTab>('ALL');
  const [cargos, setCargos] = useState<CargoDto[] | undefined>(undefined);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.cargos({
        page,
        limit,
        q: q.trim() || undefined,
        status: filterTab === 'ALL' ? undefined : (filterTab as CargoStatus),
      });
      setCargos(res.items);
      setTotal(res.total);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [page, limit, q, filterTab]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns: ColumnsType<CargoDto> = useMemo(
    () => [
      {
        title: 'Mã vận đơn',
        key: 'waybill',
        render: (_, c) => (
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={`/cargos/${c.id}`}
                className="font-mono text-sm font-semibold text-brand-fg hover:underline"
              >
                {c.waybill_code}
              </Link>
              {c.is_fragile && <Badge tone="warning">Dễ vỡ</Badge>}
            </div>
            <p className="text-xs text-fg-muted">
              {c.route.name} · Cỡ {c.size} ({c.weight_kg} kg) ·{' '}
              <DateTime value={c.created_at} />
            </p>
          </div>
        ),
      },
      {
        title: 'Điểm nhận (Người gửi)',
        key: 'sender',
        render: (_, c) => (
          <div className="max-w-xs text-xs">
            <p className="font-semibold text-fg">
              {c.sender.name} · <Phone value={c.sender.phone} />
            </p>
            <p className="truncate text-fg-muted">{c.sender.address}</p>
          </div>
        ),
      },
      {
        title: 'Điểm giao (Người nhận)',
        key: 'receiver',
        render: (_, c) => (
          <div className="max-w-xs text-xs">
            <p className="font-semibold text-fg">
              {c.receiver.name} · <Phone value={c.receiver.phone} />
            </p>
            <p className="truncate text-fg-muted">{c.receiver.address}</p>
          </div>
        ),
      },
      {
        title: 'Cước & COD',
        key: 'money',
        render: (_, c) => (
          <div className="text-xs">
            <div>
              Cước:{' '}
              <Money value={c.fee_vnd} className="font-semibold text-fg" />
            </div>
            <div className="text-fg-muted">
              COD:{' '}
              {c.cod_amount_vnd > 0 ? (
                <Money
                  value={c.cod_amount_vnd}
                  className="font-semibold text-brand-fg"
                />
              ) : (
                '—'
              )}
            </div>
          </div>
        ),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (s: CargoStatus) => <StatusTag domain="cargo" status={s} />,
      },
      {
        title: 'Thao tác',
        key: 'actions',
        align: 'right',
        render: (_, c) => (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Link href={`/cargos/${c.id}`}>
              <Button size="icon-sm" variant="ghost" aria-label="Xem vận đơn">
                <Eye className="size-4" />
              </Button>
            </Link>
            <Link href={`/cargos/${c.id}/edit`}>
              <Button size="icon-sm" variant="ghost" aria-label="Sửa vận đơn">
                <Edit className="size-4" />
              </Button>
            </Link>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminShell
      title="Vận hành Hàng hóa"
      subtitle="Danh sách vận đơn theo trạng thái · Bàn giao trung chuyển · Đối soát COD"
    >
      <div className="flex flex-col gap-6">
        {/* Top Filters & Actions (frame nvCargoOpsListFilters) */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SegmentedControl<CargoFilterTab>
            ariaLabel="Lọc trạng thái vận đơn"
            value={filterTab}
            onChange={(next) => {
              setFilterTab(next);
              setPage(1);
            }}
            options={[
              { value: 'ALL', label: 'Tất cả' },
              { value: 'CREATED', label: 'Chờ nhận' },
              { value: 'IN_TRANSIT', label: 'Đang chuyển' },
              { value: 'DELIVERED', label: 'Đã giao' },
            ]}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/cargos/handoff">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<ArrowLeftRight className="size-4" />}
              >
                Bàn giao trung chuyển
              </Button>
            </Link>
            <Link href="/cargos/cod-reconcile">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Wallet className="size-4" />}
              >
                Đối soát COD
              </Button>
            </Link>
            <Link href="/cargos/new">
              <Button size="sm" leftIcon={<Plus className="size-4" />}>
                Tạo vận đơn
              </Button>
            </Link>
          </div>
        </div>

        <DataTable<CargoDto>
          columns={columns}
          data={cargos}
          rowKey="id"
          loading={loading}
          error={error}
          onRetry={load}
          onRowClick={(row) => router.push(`/cargos/${row.id}`)}
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
                placeholder:
                  'Tìm theo mã vận đơn, tên hoặc SĐT người gửi/nhận…',
              }}
              onReset={
                q
                  ? () => {
                      setQ('');
                      setPage(1);
                    }
                  : undefined
              }
              actions={
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<RefreshCw className="size-3.5" />}
                  onClick={load}
                >
                  Làm mới
                </Button>
              }
            />
          }
          empty={{
            title: 'Chưa có vận đơn nào phù hợp',
            description: 'Tạo vận đơn mới hoặc chuyển tab trạng thái.',
            action: (
              <Link href="/cargos/new">
                <Button size="sm" leftIcon={<Plus className="size-4" />}>
                  Tạo vận đơn
                </Button>
              </Link>
            ),
          }}
        />
      </div>
    </AdminShell>
  );
}
